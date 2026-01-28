/**
 * Workflow Engine - Motor de ejecución de workflows
 * Piano Emotion Manager
 */

import { getDb } from './db';
import { workflows, workflowNodes, workflowConnections, workflowExecutions } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { sendEmail as sendEmailIntegration, replaceEmailVariables, emailTemplates, isEmailConfigured } from './integrations/email';
import { sendWhatsAppMessage, replaceWhatsAppVariables, isWhatsAppConfigured } from './integrations/whatsapp';

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
}

/**
 * Ejecuta un workflow completo
 */
export async function executeWorkflow(workflowId: number, triggerData: any = {}) {
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
 * Evalúa una condición
 */
async function evaluateCondition(node: WorkflowNode, context: ExecutionContext): Promise<boolean> {
  const config = node.nodeConfig;
  
  // Ejemplo de evaluación de condición
  // En producción, esto debería ser más robusto y soportar diferentes tipos de condiciones
  if (config.field && config.operator && config.value !== undefined) {
    const fieldValue = context.variables[config.field] || context.triggerData[config.field];
    
    switch (config.operator) {
      case 'equals':
        return fieldValue === config.value;
      case 'not_equals':
        return fieldValue !== config.value;
      case 'greater_than':
        return fieldValue > config.value;
      case 'less_than':
        return fieldValue < config.value;
      case 'contains':
        return String(fieldValue).includes(String(config.value));
      default:
        return false;
    }
  }

  return false;
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
  });
  
  // Verificar si el email está configurado
  if (!isEmailConfigured()) {
    console.warn('[Workflow Engine] Email service not configured, skipping email action');
    return;
  }

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
    let text = '';

    // Usar plantilla predefinida o contenido personalizado
    if (config.emailTemplate && config.emailTemplate !== 'custom') {
      const template = emailTemplates[config.emailTemplate as keyof typeof emailTemplates];
      if (template) {
        html = replaceEmailVariables(template.html, variables);
      }
    } else if (config.emailBody) {
      html = replaceEmailVariables(config.emailBody, variables);
    }

    // Enviar email
    const result = await sendEmailIntegration({
      to,
      subject,
      html,
      text,
    });

    if (result.success) {
      console.log('[Workflow Engine] Email sent successfully');
    } else {
      console.error('[Workflow Engine] Failed to send email:', result.error);
    }

  } catch (error: any) {
    console.error('[Workflow Engine] Error in sendEmail action:', error);
  }
}

async function sendWhatsApp(config: any, context: ExecutionContext) {
  console.log('[Workflow Engine] Sending WhatsApp:', {
    to: config.whatsappPhone,
    message: config.whatsappMessage,
  });
  
  // Verificar si WhatsApp está configurado
  if (!isWhatsAppConfigured()) {
    console.warn('[Workflow Engine] WhatsApp service not configured, skipping WhatsApp action');
    return;
  }

  try {
    // Preparar variables para reemplazo
    const variables = {
      ...context.variables,
      ...context.triggerData,
    };

    // Reemplazar variables en número y mensaje
    const phone = replaceWhatsAppVariables(config.whatsappPhone || '', variables);
    const message = replaceWhatsAppVariables(config.whatsappMessage || '', variables);

    // Enviar mensaje de WhatsApp
    const result = await sendWhatsAppMessage({
      to: phone,
      type: 'text',
      text: message,
    });

    if (result.success) {
      console.log('[Workflow Engine] WhatsApp message sent successfully');
    } else {
      console.error('[Workflow Engine] Failed to send WhatsApp message:', result.error);
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
