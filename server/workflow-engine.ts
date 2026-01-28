/**
 * Workflow Engine - Motor de ejecución de workflows
 * Piano Emotion Manager
 */

import { getDb } from './db';
import { workflows, workflowNodes, workflowConnections, workflowExecutions, userSettings } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { sendEmail as sendEmailIntegration, replaceEmailVariables, emailTemplates, isEmailConfigured } from './integrations/email';
import { sendWhatsAppMessage, replaceWhatsAppVariables, isWhatsAppConfigured } from './integrations/whatsapp';
import { UnifiedEmailService } from './services/emailUnified';

interface WorkflowNode {
  id: number;
  workflowId: number;
  nodeType: 'trigger' | 'condition' | 'action' | 'delay';
  nodeConfig: any;
  positionX: number;
  positionY: number;
}

interface WorkflowConnection {
  id: number;
  workflowId: number;
  sourceNodeId: number;
  targetNodeId: number;
  connectionType: string | null;
}

interface ExecutionContext {
  workflowId: number;
  executionId: number;
  triggerData: any;
  variables: Record<string, any>;
  userId?: number;
  userConfig?: {
    email?: any;
    whatsapp?: any;
    calendar?: any;
  };
}

/**
 * Ejecuta un workflow completo
 */
export async function executeWorkflow(workflowId: number, triggerData: any = {}, userId?: number) {
  const db = await getDb();
  
  try {
    // Obtener workflow
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, workflowId));
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Verificar que el workflow esté activo
    if (workflow.status !== 'active') {
      throw new Error(`Workflow ${workflowId} is not active`);
    }

    // Cargar configuraciones de usuario si se proporciona userId
    let userConfig: any = {};
    if (userId) {
      const [settings] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);

      if (settings) {
        userConfig = {
          email: settings.emailConfig ? JSON.parse(settings.emailConfig as string) : null,
          whatsapp: settings.whatsappConfig ? JSON.parse(settings.whatsappConfig as string) : null,
          calendar: settings.calendarConfig ? JSON.parse(settings.calendarConfig as string) : null,
        };
      }
    }

    // Crear registro de ejecución
    const executionResult = await db.insert(workflowExecutions).values({
      workflowId,
      status: 'running',
      triggerData,
      startedAt: new Date(),
    });

    const executionId = (executionResult as any).insertId || 0;

    // Crear contexto de ejecución
    const context: ExecutionContext = {
      workflowId,
      executionId,
      triggerData,
      variables: {},
      userId,
      userConfig,
    };

    // Obtener nodos y conexiones
    const nodes = await db.select().from(workflowNodes).where(eq(workflowNodes.workflowId, workflowId));
    const connections = await db.select().from(workflowConnections).where(eq(workflowConnections.workflowId, workflowId));

    // Encontrar nodo trigger (punto de inicio)
    const triggerNode = nodes.find(n => n.nodeType === 'trigger');
    if (!triggerNode) {
      throw new Error('No trigger node found in workflow');
    }

    // Ejecutar workflow desde el trigger
    await executeNode(triggerNode, nodes, connections, context);

    // Actualizar estado de ejecución a completado
    await db.update(workflowExecutions)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(workflowExecutions.id, executionId));

    return {
      success: true,
      executionId,
      message: 'Workflow executed successfully',
    };

  } catch (error: any) {
    console.error('[Workflow Engine] Error executing workflow:', error);
    
    // Actualizar estado de ejecución a fallido
    if (error.executionId) {
      await db.update(workflowExecutions)
        .set({
          status: 'failed',
          error: error.message,
          completedAt: new Date(),
        })
        .where(eq(workflowExecutions.id, error.executionId));
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Ejecuta un nodo individual y sus nodos siguientes
 */
async function executeNode(
  node: WorkflowNode,
  allNodes: WorkflowNode[],
  allConnections: WorkflowConnection[],
  context: ExecutionContext
) {
  console.log(`[Workflow Engine] Executing node ${node.id} (${node.nodeType})`);

  try {
    switch (node.nodeType) {
      case 'trigger':
        // El trigger ya se ejecutó, continuar con los nodos siguientes
        break;

      case 'condition':
        // Evaluar condición
        const conditionResult = await evaluateCondition(node, context);
        
        // Encontrar conexiones basadas en el resultado
        const connectionType = conditionResult ? 'true' : 'false';
        const nextConnections = allConnections.filter(
          c => c.sourceNodeId === node.id && c.connectionType === connectionType
        );

        // Ejecutar solo el camino correspondiente
        for (const conn of nextConnections) {
          const nextNode = allNodes.find(n => n.id === conn.targetNodeId);
          if (nextNode) {
            await executeNode(nextNode, allNodes, allConnections, context);
          }
        }
        return; // No continuar con el flujo normal

      case 'action':
        // Ejecutar acción
        await executeAction(node, context);
        break;

      case 'delay':
        // Implementar delay (en producción, esto debería ser asíncrono)
        await executeDelay(node, context);
        break;

      case 'approval':
        // Pausar workflow y esperar aprobación manual
        await pauseForApproval(node, context);
        return; // Detener ejecución hasta que se apruebe
    }

    // Encontrar y ejecutar nodos siguientes (para nodos sin bifurcación)
    const nextConnections = allConnections.filter(c => c.sourceNodeId === node.id);
    for (const conn of nextConnections) {
      const nextNode = allNodes.find(n => n.id === conn.targetNodeId);
      if (nextNode) {
        await executeNode(nextNode, allNodes, allConnections, context);
      }
    }

  } catch (error: any) {
    console.error(`[Workflow Engine] Error executing node ${node.id}:`, error);
    throw error;
  }
}

/**
 * Evalúa una condición con soporte para operadores lógicos (AND/OR) y comparaciones avanzadas
 */
async function evaluateCondition(node: WorkflowNode, context: ExecutionContext): Promise<boolean> {
  const config = node.nodeConfig;
  
  // Soporte para condiciones compuestas con AND/OR
  if (config.conditions && Array.isArray(config.conditions)) {
    const logicOperator = config.logicOperator || 'AND';
    const results: boolean[] = [];

    for (const condition of config.conditions) {
      const result = await evaluateSingleCondition(condition, context);
      results.push(result);
    }

    if (logicOperator === 'AND') {
      return results.every(r => r === true);
    } else if (logicOperator === 'OR') {
      return results.some(r => r === true);
    }
  }

  // Condición simple (backward compatibility)
  return await evaluateSingleCondition(config, context);
}

/**
 * Evalúa una condición individual
 */
async function evaluateSingleCondition(condition: any, context: ExecutionContext): Promise<boolean> {
  if (!condition.field || !condition.operator) {
    return false;
  }

  const fieldValue = context.variables[condition.field] || context.triggerData[condition.field];
  const compareValue = condition.value;

  switch (condition.operator) {
    // Comparaciones de igualdad
    case 'equals':
    case '==':
      return fieldValue == compareValue;
    
    case 'not_equals':
    case '!=':
      return fieldValue != compareValue;
    
    case 'strict_equals':
    case '===':
      return fieldValue === compareValue;
    
    case 'strict_not_equals':
    case '!==':
      return fieldValue !== compareValue;

    // Comparaciones numéricas
    case 'greater_than':
    case '>':
      return Number(fieldValue) > Number(compareValue);
    
    case 'greater_than_or_equal':
    case '>=':
      return Number(fieldValue) >= Number(compareValue);
    
    case 'less_than':
    case '<':
      return Number(fieldValue) < Number(compareValue);
    
    case 'less_than_or_equal':
    case '<=':
      return Number(fieldValue) <= Number(compareValue);

    // Validaciones de texto
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
    
    case 'not_contains':
      return !String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
    
    case 'starts_with':
      return String(fieldValue).toLowerCase().startsWith(String(compareValue).toLowerCase());
    
    case 'ends_with':
      return String(fieldValue).toLowerCase().endsWith(String(compareValue).toLowerCase());
    
    case 'matches_regex':
      try {
        const regex = new RegExp(String(compareValue));
        return regex.test(String(fieldValue));
      } catch {
        return false;
      }

    // Validaciones de existencia
    case 'is_empty':
      return !fieldValue || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);
    
    case 'is_not_empty':
      return !!fieldValue && fieldValue !== '' && (!Array.isArray(fieldValue) || fieldValue.length > 0);
    
    case 'is_null':
      return fieldValue === null || fieldValue === undefined;
    
    case 'is_not_null':
      return fieldValue !== null && fieldValue !== undefined;

    // Validaciones de tipo
    case 'is_number':
      return !isNaN(Number(fieldValue));
    
    case 'is_boolean':
      return typeof fieldValue === 'boolean';
    
    case 'is_array':
      return Array.isArray(fieldValue);

    // Validaciones de rango
    case 'in_range':
      if (condition.min !== undefined && condition.max !== undefined) {
        const numValue = Number(fieldValue);
        return numValue >= Number(condition.min) && numValue <= Number(condition.max);
      }
      return false;
    
    case 'in_list':
      if (Array.isArray(compareValue)) {
        return compareValue.includes(fieldValue);
      }
      return false;

    default:
      console.warn(`[Workflow Engine] Unknown operator: ${condition.operator}`);
      return false;
  }
}

/**
 * Ejecuta una acción
 */
async function executeAction(node: WorkflowNode, context: ExecutionContext) {
  const config = node.nodeConfig;
  const actionType = config.actionType;

  console.log(`[Workflow Engine] Executing action: ${actionType}`);

  switch (actionType) {
    case 'send_email':
      await sendEmail(config, context);
      break;

    case 'send_whatsapp':
      await sendWhatsApp(config, context);
      break;

    case 'create_reminder':
      await createReminder(config, context);
      break;

    case 'create_appointment':
      await createAppointment(config, context);
      break;

    case 'update_status':
      await updateStatus(config, context);
      break;

    default:
      console.warn(`[Workflow Engine] Unknown action type: ${actionType}`);
  }
}

/**
 * Ejecuta un delay
 */
async function executeDelay(node: WorkflowNode, context: ExecutionContext) {
  const config = node.nodeConfig;
  const duration = config.duration || 0;
  const unit = config.unit || 'minutes';

  // Convertir a milisegundos
  let delayMs = 0;
  switch (unit) {
    case 'seconds':
      delayMs = duration * 1000;
      break;
    case 'minutes':
      delayMs = duration * 60 * 1000;
      break;
    case 'hours':
      delayMs = duration * 60 * 60 * 1000;
      break;
    case 'days':
      delayMs = duration * 24 * 60 * 60 * 1000;
      break;
  }

  console.log(`[Workflow Engine] Delaying for ${duration} ${unit} (${delayMs}ms)`);
  
  // En producción, esto debería usar un sistema de colas o scheduler
  // Por ahora, solo simulamos el delay
  if (delayMs < 60000) { // Solo delays menores a 1 minuto en ejecución síncrona
    await new Promise(resolve => setTimeout(resolve, delayMs));
  } else {
    console.log('[Workflow Engine] Long delay detected, would schedule for later execution');
  }
}

// ============================================
// Implementaciones de acciones específicas
// ============================================

async function sendEmail(config: any, context: ExecutionContext) {
  console.log('[Workflow Engine] Sending email:', {
    to: config.emailTo,
    subject: config.emailSubject,
    template: config.emailTemplate,
    provider: context.userConfig?.email?.provider || 'gmail',
  });

  try {
    // Preparar variables para reemplazo
    const variables = {
      ...context.variables,
      ...context.triggerData,
    };

    // Reemplazar variables en destinatario, asunto y contenido
    const to = replaceEmailVariables(config.emailTo || '', variables);
    const subject = replaceEmailVariables(config.emailSubject || '', variables);
    
    let html = '';

    // Usar plantilla predefinida o contenido personalizado
    if (config.emailTemplate && config.emailTemplate !== 'custom') {
      const template = emailTemplates[config.emailTemplate as keyof typeof emailTemplates];
      if (template) {
        html = replaceEmailVariables(template.html, variables);
      }
    } else if (config.emailBody) {
      html = replaceEmailVariables(config.emailBody, variables);
    }

    // Usar UnifiedEmailService que detecta automáticamente el proveedor configurado
    const success = await UnifiedEmailService.sendEmail({
      to,
      subject,
      html,
      userId: context.userId,
    });

    if (success) {
      console.log('[Workflow Engine] Email sent successfully');
    } else {
      console.error('[Workflow Engine] Failed to send email');
    }

  } catch (error: any) {
    console.error('[Workflow Engine] Error in sendEmail action:', error);
  }
}

async function sendWhatsApp(config: any, context: ExecutionContext) {
  const whatsappMethod = context.userConfig?.whatsapp?.method || 'web';
  
  console.log('[Workflow Engine] Sending WhatsApp:', {
    to: config.whatsappPhone,
    message: config.whatsappMessage,
    method: whatsappMethod,
  });

  try {
    // Preparar variables para reemplazo
    const variables = {
      ...context.variables,
      ...context.triggerData,
    };

    // Reemplazar variables en número y mensaje
    const phone = replaceWhatsAppVariables(config.whatsappPhone || '', variables);
    const message = replaceWhatsAppVariables(config.whatsappMessage || '', variables);

    if (whatsappMethod === 'business_api') {
      // Usar WhatsApp Business API si está configurado
      if (!isWhatsAppConfigured()) {
        console.warn('[Workflow Engine] WhatsApp Business API not configured, skipping');
        return;
      }

      const result = await sendWhatsAppMessage({
        to: phone,
        type: 'text',
        text: message,
      });

      if (result.success) {
        console.log('[Workflow Engine] WhatsApp message sent via Business API');
      } else {
        console.error('[Workflow Engine] Failed to send WhatsApp via Business API:', result.error);
      }
    } else {
      // Usar WhatsApp Web (abrir enlace)
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
      
      console.log('[Workflow Engine] WhatsApp Web URL generated:', whatsappUrl);
      console.log('[Workflow Engine] Note: WhatsApp Web requires manual user action');
      
      // En un entorno de producción, esto podría:
      // 1. Enviar notificación al usuario con el enlace
      // 2. Guardar el enlace para que el usuario lo abra manualmente
      // 3. Usar un sistema de colas para procesar más tarde
    }

  } catch (error: any) {
    console.error('[Workflow Engine] Error in sendWhatsApp action:', error);
  }
}

async function createReminder(config: any, context: ExecutionContext) {
  console.log('[Workflow Engine] Creating reminder:', {
    title: config.title,
    date: config.date,
    userId: config.userId,
  });
  
  // TODO: Crear recordatorio en la base de datos
}

async function createAppointment(config: any, context: ExecutionContext) {
  console.log('[Workflow Engine] Creating appointment:', {
    clientId: config.clientId,
    date: config.date,
    type: config.type,
  });
  
  // TODO: Crear cita en la base de datos
}

async function updateStatus(config: any, context: ExecutionContext) {
  console.log('[Workflow Engine] Updating status:', {
    entityType: config.entityType,
    entityId: config.entityId,
    newStatus: config.newStatus,
  });
  
  // TODO: Actualizar estado en la base de datos
}

/**
 * Pausa el workflow y espera aprobación manual
 */
async function pauseForApproval(node: WorkflowNode, context: ExecutionContext) {
  const db = await getDb();
  const config = node.nodeConfig;
  
  console.log('[Workflow Engine] Pausing workflow for approval:', {
    workflowId: context.workflowId,
    executionId: context.executionId,
    nodeId: node.id,
    message: config.approvalMessage || 'Aprobación requerida',
  });

  // Actualizar ejecución con datos de aprobación pendiente
  await db.update(workflowExecutions)
    .set({
      status: 'pending',
      pendingApprovalData: {
        nodeId: node.id,
        message: config.approvalMessage || 'Aprobación requerida',
        details: config.approvalDetails || '',
        pausedAt: new Date().toISOString(),
        approvedBy: null,
        approvedAt: null,
        decision: null, // 'approved' | 'rejected'
      },
    })
    .where(eq(workflowExecutions.id, context.executionId));

  // TODO: Enviar notificación al usuario sobre la aprobación pendiente
  // Esto podría ser un email, notificación push, etc.
}

/**
 * Reanuda un workflow después de aprobación
 */
export async function resumeWorkflowAfterApproval(
  executionId: number,
  decision: 'approved' | 'rejected',
  approvedBy: number
) {
  const db = await getDb();

  try {
    // Obtener ejecución
    const [execution] = await db
      .select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.id, executionId));

    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== 'pending') {
      throw new Error(`Execution ${executionId} is not pending approval`);
    }

    const approvalData = execution.pendingApprovalData as any;

    // Actualizar datos de aprobación
    await db.update(workflowExecutions)
      .set({
        pendingApprovalData: {
          ...approvalData,
          decision,
          approvedBy,
          approvedAt: new Date().toISOString(),
        },
      })
      .where(eq(workflowExecutions.id, executionId));

    if (decision === 'rejected') {
      // Si se rechaza, marcar como completado (no continuar)
      await db.update(workflowExecutions)
        .set({
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(workflowExecutions.id, executionId));

      return {
        success: true,
        message: 'Workflow rejected and stopped',
      };
    }

    // Si se aprueba, continuar con la ejecución
    // Obtener workflow y nodos
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, execution.workflowId));

    if (!workflow) {
      throw new Error(`Workflow ${execution.workflowId} not found`);
    }

    const nodes = await db
      .select()
      .from(workflowNodes)
      .where(eq(workflowNodes.workflowId, execution.workflowId));

    const connections = await db
      .select()
      .from(workflowConnections)
      .where(eq(workflowConnections.workflowId, execution.workflowId));

    // Encontrar el nodo de aprobación
    const approvalNode = nodes.find(n => n.id === approvalData.nodeId);
    if (!approvalNode) {
      throw new Error(`Approval node ${approvalData.nodeId} not found`);
    }

    // Crear contexto de ejecución
    const context: ExecutionContext = {
      workflowId: execution.workflowId,
      executionId: execution.id,
      triggerData: execution.triggerData || {},
      variables: {},
    };

    // Actualizar estado a running
    await db.update(workflowExecutions)
      .set({
        status: 'running',
      })
      .where(eq(workflowExecutions.id, executionId));

    // Continuar con los nodos siguientes al nodo de aprobación
    const nextConnections = connections.filter(c => c.sourceNodeId === approvalNode.id);
    for (const conn of nextConnections) {
      const nextNode = nodes.find(n => n.id === conn.targetNodeId);
      if (nextNode) {
        await executeNode(nextNode, nodes, connections, context);
      }
    }

    // Marcar como completado
    await db.update(workflowExecutions)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(workflowExecutions.id, executionId));

    return {
      success: true,
      message: 'Workflow resumed and completed',
    };

  } catch (error: any) {
    console.error('[Workflow Engine] Error resuming workflow:', error);
    
    await db.update(workflowExecutions)
      .set({
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
      })
      .where(eq(workflowExecutions.id, executionId));

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verifica si un trigger debe activarse
 */
export async function checkTrigger(triggerType: string, data: any): Promise<number[]> {
  const db = await getDb();
  
  // Buscar workflows activos con este tipo de trigger
  const activeWorkflows = await db
    .select()
    .from(workflows)
    .where(
      and(
        eq(workflows.status, 'active'),
        eq(workflows.triggerType, triggerType)
      )
    );

  return activeWorkflows.map(w => w.id);
}

/**
 * Ejecuta workflows basados en un trigger
 */
export async function triggerWorkflows(triggerType: string, data: any) {
  const workflowIds = await checkTrigger(triggerType, data);
  
  console.log(`[Workflow Engine] Found ${workflowIds.length} workflows for trigger: ${triggerType}`);
  
  const results = [];
  for (const workflowId of workflowIds) {
    const result = await executeWorkflow(workflowId, data);
    results.push({ workflowId, result });
  }
  
  return results;
}
