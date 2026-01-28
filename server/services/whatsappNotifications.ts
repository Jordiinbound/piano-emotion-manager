/**
 * WhatsApp Notifications Service
 * Piano Emotion Manager - Manus
 * 
 * Servicio para generar notificaciones automáticas de WhatsApp
 * para recordatorios de citas y vencimientos de pago
 */

import { WhatsAppService } from './whatsappService';

// ============================================================================
// TIPOS
// ============================================================================

export interface AppointmentReminder {
  clientId: number;
  clientName: string;
  clientPhone: string;
  appointmentId: number;
  serviceName: string;
  date: string;
  time: string;
  daysUntil: number;
}

export interface PaymentReminder {
  clientId: number;
  clientName: string;
  clientPhone: string;
  invoiceId: number;
  invoiceNumber: string;
  totalAmount: string;
  daysOverdue: number;
}

export interface NotificationResult {
  clientId: number;
  clientName: string;
  whatsappUrl: string;
  phoneNumber: string;
  type: 'appointment' | 'payment';
}

// ============================================================================
// SERVICIO DE NOTIFICACIONES
// ============================================================================

export class WhatsAppNotificationsService {
  /**
   * Genera recordatorios de citas próximas
   * @param appointments - Lista de citas próximas
   * @returns Lista de URLs de WhatsApp para enviar
   */
  static generateAppointmentReminders(
    appointments: AppointmentReminder[]
  ): NotificationResult[] {
    return appointments
      .filter(apt => apt.clientPhone) // Solo clientes con teléfono
      .map(apt => {
        const result = WhatsAppService.generateAppointmentReminderLink(
          apt.clientPhone,
          apt.clientName,
          apt.serviceName,
          apt.date,
          apt.time
        );

        return {
          clientId: apt.clientId,
          clientName: apt.clientName,
          whatsappUrl: result.url,
          phoneNumber: result.phoneNumber,
          type: 'appointment' as const,
        };
      });
  }

  /**
   * Genera recordatorios de pagos vencidos
   * @param invoices - Lista de facturas vencidas
   * @returns Lista de URLs de WhatsApp para enviar
   */
  static generatePaymentReminders(
    invoices: PaymentReminder[]
  ): NotificationResult[] {
    return invoices
      .filter(inv => inv.clientPhone) // Solo clientes con teléfono
      .map(inv => {
        const result = WhatsAppService.generatePaymentReminderLink(
          inv.clientPhone,
          inv.clientName,
          inv.invoiceNumber,
          inv.totalAmount,
          inv.daysOverdue
        );

        return {
          clientId: inv.clientId,
          clientName: inv.clientName,
          whatsappUrl: result.url,
          phoneNumber: result.phoneNumber,
          type: 'payment' as const,
        };
      });
  }

  /**
   * Genera recordatorios de mantenimiento para pianos
   * @param pianos - Lista de pianos que necesitan mantenimiento
   * @returns Lista de URLs de WhatsApp para enviar
   */
  static generateMaintenanceReminders(pianos: {
    clientId: number;
    clientName: string;
    clientPhone: string;
    pianoName: string;
    lastServiceDate: string;
    recommendedService: string;
  }[]): NotificationResult[] {
    return pianos
      .filter(piano => piano.clientPhone)
      .map(piano => {
        const result = WhatsAppService.generateMaintenanceReminderLink(
          piano.clientPhone,
          piano.clientName,
          piano.pianoName,
          piano.lastServiceDate,
          piano.recommendedService
        );

        return {
          clientId: piano.clientId,
          clientName: piano.clientName,
          whatsappUrl: result.url,
          phoneNumber: result.phoneNumber,
          type: 'appointment' as const, // Usar tipo appointment para mantenimiento
        };
      });
  }

  /**
   * Filtra citas que necesitan recordatorio (próximas X días)
   * @param appointments - Todas las citas
   * @param daysAhead - Días de anticipación para el recordatorio (default: 1)
   * @returns Citas que necesitan recordatorio
   */
  static filterUpcomingAppointments(
    appointments: {
      id: number;
      clientId: number;
      clientName: string;
      clientPhone: string | null;
      serviceName: string;
      date: Date;
    }[],
    daysAhead: number = 1
  ): AppointmentReminder[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalizar a medianoche

    return appointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
        const diffDays = Math.round((aptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays === daysAhead;
      })
      .map(apt => ({
        clientId: apt.clientId,
        clientName: apt.clientName,
        clientPhone: apt.clientPhone || '',
        appointmentId: apt.id,
        serviceName: apt.serviceName,
        date: new Date(apt.date).toLocaleDateString('es-ES'),
        time: new Date(apt.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        daysUntil: daysAhead,
      }));
  }

  /**
   * Filtra facturas vencidas que necesitan recordatorio
   * @param invoices - Todas las facturas
   * @param minDaysOverdue - Días mínimos de retraso (default: 1)
   * @returns Facturas que necesitan recordatorio
   */
  static filterOverdueInvoices(
    invoices: {
      id: number;
      invoiceNumber: string;
      clientId: number;
      clientName: string;
      clientPhone: string | null;
      total: number | string;
      dueDate: Date;
      status: string;
    }[],
    minDaysOverdue: number = 1
  ): PaymentReminder[] {
    const now = new Date();

    return invoices
      .filter(inv => {
        if (inv.status === 'paid' || inv.status === 'cancelled') return false;
        
        const dueDate = new Date(inv.dueDate);
        const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= minDaysOverdue;
      })
      .map(inv => {
        const dueDate = new Date(inv.dueDate);
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          clientId: inv.clientId,
          clientName: inv.clientName,
          clientPhone: inv.clientPhone || '',
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          totalAmount: typeof inv.total === 'number' ? `${inv.total.toFixed(2)}€` : `${inv.total}€`,
          daysOverdue,
        };
      });
  }
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Genera recordatorios de citas para el día siguiente
 */
export function generateTomorrowAppointmentReminders(
  appointments: {
    id: number;
    clientId: number;
    clientName: string;
    clientPhone: string | null;
    serviceName: string;
    date: Date;
  }[]
): NotificationResult[] {
  const upcoming = WhatsAppNotificationsService.filterUpcomingAppointments(appointments, 1);
  return WhatsAppNotificationsService.generateAppointmentReminders(upcoming);
}

/**
 * Genera recordatorios de pagos vencidos
 */
export function generateOverduePaymentReminders(
  invoices: {
    id: number;
    invoiceNumber: string;
    clientId: number;
    clientName: string;
    clientPhone: string | null;
    total: number | string;
    dueDate: Date;
    status: string;
  }[]
): NotificationResult[] {
  const overdue = WhatsAppNotificationsService.filterOverdueInvoices(invoices, 1);
  return WhatsAppNotificationsService.generatePaymentReminders(overdue);
}
