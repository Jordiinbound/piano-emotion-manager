/**
 * Sistema de Triggers Automáticos para Workflows
 * Piano Emotion Manager
 * 
 * Event listeners que detectan eventos del sistema y ejecutan workflows automáticamente
 */

import { getDb } from './db';
import { workflows, workflowExecutions } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { executeWorkflow } from './workflow-engine';

// Tipos de eventos soportados
export type WorkflowTriggerEvent =
  | 'client_created'
  | 'client_updated'
  | 'appointment_created'
  | 'appointment_updated'
  | 'appointment_completed'
  | 'invoice_created'
  | 'invoice_due'
  | 'invoice_overdue'
  | 'invoice_paid'
  | 'service_created'
  | 'service_completed'
  | 'piano_created'
  | 'piano_updated';

// Datos del evento
export interface TriggerEventData {
  eventType: WorkflowTriggerEvent;
  entityId: number;
  entityData: Record<string, any>;
  userId: number;
  timestamp: Date;
}

/**
 * Registra un evento y ejecuta workflows asociados
 */
export async function triggerWorkflowEvent(eventData: TriggerEventData): Promise<void> {
  try {
    console.log(`[Workflow Trigger] Event received: ${eventData.eventType}`, {
      entityId: eventData.entityId,
      userId: eventData.userId,
    });

    // Buscar workflows activos con este trigger
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const activeWorkflows = await db
      .select()
      .from(workflows)
      .where(
        and(
          eq(workflows.trigger_type, eventData.eventType),
          eq(workflows.is_active, true)
        )
      );

    if (activeWorkflows.length === 0) {
      console.log(`[Workflow Trigger] No active workflows found for event: ${eventData.eventType}`);
      return;
    }

    console.log(`[Workflow Trigger] Found ${activeWorkflows.length} active workflow(s) for event: ${eventData.eventType}`);

    // Ejecutar cada workflow
    for (const workflow of activeWorkflows) {
      try {
        console.log(`[Workflow Trigger] Executing workflow: ${workflow.name} (ID: ${workflow.id})`);

        // Preparar contexto del workflow con datos del evento
        const workflowContext = {
          trigger: {
            type: eventData.eventType,
            entityId: eventData.entityId,
            entityData: eventData.entityData,
            timestamp: eventData.timestamp.toISOString(),
          },
          user: {
            id: eventData.userId,
          },
          // Variables disponibles para el workflow
          variables: {
            ...eventData.entityData,
            event_type: eventData.eventType,
            entity_id: eventData.entityId,
            user_id: eventData.userId,
            timestamp: eventData.timestamp.toISOString(),
          },
        };

        // Ejecutar workflow
        await executeWorkflow(workflow.id, eventData.userId, workflowContext);

        console.log(`[Workflow Trigger] Workflow executed successfully: ${workflow.name}`);
      } catch (error) {
        console.error(`[Workflow Trigger] Error executing workflow ${workflow.id}:`, error);
        // Continuar con el siguiente workflow aunque uno falle
      }
    }
  } catch (error) {
    console.error('[Workflow Trigger] Error processing trigger event:', error);
    throw error;
  }
}

/**
 * Helper: Trigger cuando se crea un nuevo cliente
 */
export async function triggerClientCreated(clientId: number, clientData: any, userId: number): Promise<void> {
  await triggerWorkflowEvent({
    eventType: 'client_created',
    entityId: clientId,
    entityData: {
      client_id: clientId,
      client_name: clientData.name || `${clientData.first_name} ${clientData.last_name}`,
      client_email: clientData.email,
      client_phone: clientData.phone,
      client_address: clientData.address,
      ...clientData,
    },
    userId,
    timestamp: new Date(),
  });
}

/**
 * Helper: Trigger cuando se programa una cita
 */
export async function triggerAppointmentCreated(appointmentId: number, appointmentData: any, userId: number): Promise<void> {
  await triggerWorkflowEvent({
    eventType: 'appointment_created',
    entityId: appointmentId,
    entityData: {
      appointment_id: appointmentId,
      appointment_date: appointmentData.date,
      appointment_time: appointmentData.time,
      appointment_title: appointmentData.title,
      appointment_description: appointmentData.description,
      client_id: appointmentData.client_id,
      client_name: appointmentData.client_name,
      ...appointmentData,
    },
    userId,
    timestamp: new Date(),
  });
}

/**
 * Helper: Trigger cuando se completa una cita
 */
export async function triggerAppointmentCompleted(appointmentId: number, appointmentData: any, userId: number): Promise<void> {
  await triggerWorkflowEvent({
    eventType: 'appointment_completed',
    entityId: appointmentId,
    entityData: {
      appointment_id: appointmentId,
      appointment_date: appointmentData.date,
      appointment_title: appointmentData.title,
      client_id: appointmentData.client_id,
      client_name: appointmentData.client_name,
      ...appointmentData,
    },
    userId,
    timestamp: new Date(),
  });
}

/**
 * Helper: Trigger cuando se crea una factura
 */
export async function triggerInvoiceCreated(invoiceId: number, invoiceData: any, userId: number): Promise<void> {
  await triggerWorkflowEvent({
    eventType: 'invoice_created',
    entityId: invoiceId,
    entityData: {
      invoice_id: invoiceId,
      invoice_number: invoiceData.invoice_number,
      invoice_amount: invoiceData.total,
      invoice_due_date: invoiceData.due_date,
      client_id: invoiceData.client_id,
      client_name: invoiceData.client_name,
      ...invoiceData,
    },
    userId,
    timestamp: new Date(),
  });
}

/**
 * Helper: Trigger cuando una factura está vencida
 */
export async function triggerInvoiceOverdue(invoiceId: number, invoiceData: any, userId: number): Promise<void> {
  await triggerWorkflowEvent({
    eventType: 'invoice_overdue',
    entityId: invoiceId,
    entityData: {
      invoice_id: invoiceId,
      invoice_number: invoiceData.invoice_number,
      invoice_amount: invoiceData.total,
      invoice_due_date: invoiceData.due_date,
      days_overdue: Math.floor((new Date().getTime() - new Date(invoiceData.due_date).getTime()) / (1000 * 60 * 60 * 24)),
      client_id: invoiceData.client_id,
      client_name: invoiceData.client_name,
      ...invoiceData,
    },
    userId,
    timestamp: new Date(),
  });
}

/**
 * Helper: Trigger cuando se paga una factura
 */
export async function triggerInvoicePaid(invoiceId: number, invoiceData: any, userId: number): Promise<void> {
  await triggerWorkflowEvent({
    eventType: 'invoice_paid',
    entityId: invoiceId,
    entityData: {
      invoice_id: invoiceId,
      invoice_number: invoiceData.invoice_number,
      invoice_amount: invoiceData.total,
      payment_date: new Date().toISOString(),
      client_id: invoiceData.client_id,
      client_name: invoiceData.client_name,
      ...invoiceData,
    },
    userId,
    timestamp: new Date(),
  });
}

/**
 * Helper: Trigger cuando se completa un servicio
 */
export async function triggerServiceCompleted(serviceId: number, serviceData: any, userId: number): Promise<void> {
  await triggerWorkflowEvent({
    eventType: 'service_completed',
    entityId: serviceId,
    entityData: {
      service_id: serviceId,
      service_title: serviceData.title,
      service_description: serviceData.description,
      service_date: serviceData.date,
      client_id: serviceData.client_id,
      client_name: serviceData.client_name,
      piano_id: serviceData.piano_id,
      ...serviceData,
    },
    userId,
    timestamp: new Date(),
  });
}

/**
 * Tarea programada: Verificar facturas vencidas
 * Debe ejecutarse diariamente (cron job)
 */
export async function checkOverdueInvoices(): Promise<void> {
  try {
    console.log('[Workflow Trigger] Checking for overdue invoices...');

    // Aquí deberías consultar las facturas vencidas de tu base de datos
    // Este es un ejemplo simplificado
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // TODO: Implementar consulta real a la base de datos de facturas
    // const overdueInvoices = await db.select()
    //   .from(invoices)
    //   .where(and(
    //     lt(invoices.due_date, today),
    //     eq(invoices.status, 'pending')
    //   ));

    // for (const invoice of overdueInvoices) {
    //   await triggerInvoiceOverdue(invoice.id, invoice, invoice.user_id);
    // }

    console.log('[Workflow Trigger] Overdue invoices check completed');
  } catch (error) {
    console.error('[Workflow Trigger] Error checking overdue invoices:', error);
  }
}
