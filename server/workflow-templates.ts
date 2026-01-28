/**
 * Workflow Templates - Plantillas predefinidas de workflows
 * Piano Emotion Manager
 */

export interface WorkflowTemplate {
  name: string;
  description: string;
  category: 'customer' | 'appointment' | 'service';
  nodes: Array<{
    nodeType: 'trigger' | 'condition' | 'action' | 'delay';
    nodeConfig: any;
    positionX: number;
    positionY: number;
  }>;
  connections: Array<{
    sourceIndex: number;
    targetIndex: number;
    connectionType: string | null;
  }>;
}

export const workflowTemplates: Record<string, WorkflowTemplate> = {
  welcome_new_client: {
    name: 'Bienvenida a Nuevos Clientes',
    description: 'Envía automáticamente un email de bienvenida cuando se registra un nuevo cliente',
    category: 'customer',
    nodes: [
      {
        nodeType: 'trigger',
        nodeConfig: {
          triggerType: 'client_created',
          description: 'Se activa cuando se crea un nuevo cliente',
        },
        positionX: 100,
        positionY: 200,
      },
      {
        nodeType: 'action',
        nodeConfig: {
          actionType: 'send_email',
          emailTo: '{{client_email}}',
          emailSubject: '¡Bienvenido a Piano Emotion!',
          emailTemplate: 'welcome',
          emailBody: `
            <h2>¡Bienvenido a Piano Emotion!</h2>
            <p>Hola {{client_name}},</p>
            <p>Estamos encantados de tenerte como cliente. En Piano Emotion nos dedicamos a ofrecer el mejor servicio de afinación y mantenimiento de pianos.</p>
            <p>Nuestro equipo de expertos está a tu disposición para cualquier consulta.</p>
            <p>¡Gracias por confiar en nosotros!</p>
            <p>Atentamente,<br>El equipo de Piano Emotion</p>
          `,
        },
        positionX: 400,
        positionY: 200,
      },
    ],
    connections: [
      {
        sourceIndex: 0,
        targetIndex: 1,
        connectionType: null,
      },
    ],
  },

  appointment_reminder: {
    name: 'Recordatorio de Citas',
    description: 'Envía un recordatorio automático 24 horas antes de una cita programada',
    category: 'appointment',
    nodes: [
      {
        nodeType: 'trigger',
        nodeConfig: {
          triggerType: 'appointment_scheduled',
          description: 'Se activa cuando se programa una cita',
        },
        positionX: 100,
        positionY: 200,
      },
      {
        nodeType: 'delay',
        nodeConfig: {
          duration: 24,
          unit: 'hours',
          description: 'Esperar hasta 24 horas antes de la cita',
        },
        positionX: 300,
        positionY: 200,
      },
      {
        nodeType: 'action',
        nodeConfig: {
          actionType: 'send_email',
          emailTo: '{{client_email}}',
          emailSubject: 'Recordatorio: Cita mañana con Piano Emotion',
          emailTemplate: 'reminder',
          emailBody: `
            <h2>Recordatorio de Cita</h2>
            <p>Hola {{client_name}},</p>
            <p>Te recordamos que tienes una cita programada para mañana:</p>
            <ul>
              <li><strong>Fecha:</strong> {{appointment_date}}</li>
              <li><strong>Hora:</strong> {{appointment_time}}</li>
              <li><strong>Servicio:</strong> {{service_type}}</li>
            </ul>
            <p>Si necesitas reprogramar o cancelar, por favor contáctanos lo antes posible.</p>
            <p>¡Te esperamos!</p>
            <p>Atentamente,<br>El equipo de Piano Emotion</p>
          `,
        },
        positionX: 500,
        positionY: 200,
      },
      {
        nodeType: 'action',
        nodeConfig: {
          actionType: 'send_whatsapp',
          whatsappPhone: '{{client_phone}}',
          whatsappMessage: 'Hola {{client_name}}, te recordamos tu cita mañana a las {{appointment_time}} para {{service_type}}. ¡Te esperamos! - Piano Emotion',
        },
        positionX: 500,
        positionY: 350,
      },
    ],
    connections: [
      {
        sourceIndex: 0,
        targetIndex: 1,
        connectionType: null,
      },
      {
        sourceIndex: 1,
        targetIndex: 2,
        connectionType: null,
      },
      {
        sourceIndex: 1,
        targetIndex: 3,
        connectionType: null,
      },
    ],
  },

  post_service_followup: {
    name: 'Seguimiento Post-Servicio',
    description: 'Envía un email de seguimiento 3 días después de completar un servicio',
    category: 'service',
    nodes: [
      {
        nodeType: 'trigger',
        nodeConfig: {
          triggerType: 'service_completed',
          description: 'Se activa cuando se completa un servicio',
        },
        positionX: 100,
        positionY: 200,
      },
      {
        nodeType: 'delay',
        nodeConfig: {
          duration: 3,
          unit: 'days',
          description: 'Esperar 3 días después del servicio',
        },
        positionX: 300,
        positionY: 200,
      },
      {
        nodeType: 'action',
        nodeConfig: {
          actionType: 'send_email',
          emailTo: '{{client_email}}',
          emailSubject: '¿Cómo estuvo nuestro servicio?',
          emailTemplate: 'followup',
          emailBody: `
            <h2>Seguimiento de Servicio</h2>
            <p>Hola {{client_name}},</p>
            <p>Esperamos que estés disfrutando de tu piano después de nuestro servicio de {{service_type}}.</p>
            <p>Nos encantaría conocer tu opinión sobre el servicio recibido. Tu feedback nos ayuda a mejorar continuamente.</p>
            <p>Si tienes alguna pregunta o necesitas algún ajuste adicional, no dudes en contactarnos.</p>
            <p>¡Gracias por confiar en Piano Emotion!</p>
            <p>Atentamente,<br>El equipo de Piano Emotion</p>
          `,
        },
        positionX: 500,
        positionY: 200,
      },
    ],
    connections: [
      {
        sourceIndex: 0,
        targetIndex: 1,
        connectionType: null,
      },
      {
        sourceIndex: 1,
        targetIndex: 2,
        connectionType: null,
      },
    ],
  },
};

/**
 * Crea un workflow a partir de una plantilla
 */
export async function createWorkflowFromTemplate(
  templateId: string,
  userId: number,
  db: any
): Promise<number> {
  const template = workflowTemplates[templateId];
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  // Importar schemas
  const { workflows, workflowNodes, workflowConnections } = await import('../drizzle/schema');

  // Crear workflow
  const workflowResult = await db.insert(workflows).values({
    userId,
    name: template.name,
    description: template.description,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const workflowId = (workflowResult as any).insertId || 0;

  // Crear nodos
  const nodeIds: number[] = [];
  for (const node of template.nodes) {
    const nodeResult = await db.insert(workflowNodes).values({
      workflowId,
      nodeType: node.nodeType,
      nodeConfig: JSON.stringify(node.nodeConfig),
      positionX: node.positionX,
      positionY: node.positionY,
    });

    nodeIds.push((nodeResult as any).insertId || 0);
  }

  // Crear conexiones
  for (const conn of template.connections) {
    await db.insert(workflowConnections).values({
      workflowId,
      sourceNodeId: nodeIds[conn.sourceIndex],
      targetNodeId: nodeIds[conn.targetIndex],
      connectionType: conn.connectionType,
    });
  }

  return workflowId;
}
