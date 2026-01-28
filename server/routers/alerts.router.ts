/**
 * Alerts Router - tRPC
 * Piano Emotion Manager
 * 
 * Sistema completo de alertas conectado a la base de datos
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { invoices, appointments, services, pianos, clients, alertHistory, alertSettings } from '../../drizzle/schema';
import { and, eq, lt, gte, sql, lte, desc } from 'drizzle-orm';

export const alertsRouter = router({
  // Obtener todas las alertas activas
  getAlerts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const alerts: any[] = [];

    // 1. FACTURAS VENCIDAS (dueDate < now y status = 'sent')
    const overdueInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientName: invoices.clientName,
        dueDate: invoices.dueDate,
        total: invoices.total,
        status: invoices.status,
      })
      .from(invoices)
      .where(
        and(
          lt(invoices.dueDate, now),
          eq(invoices.status, 'sent')
        )
      );

    alerts.push(...overdueInvoices.map((invoice) => ({
      id: `overdue-invoice-${invoice.id}`,
      type: 'overdue_invoice' as const,
      priority: 'urgent' as const,
      title: 'Factura vencida',
      message: `La factura ${invoice.invoiceNumber} de ${invoice.clientName} venció el ${new Date(invoice.dueDate!).toLocaleDateString('es-ES')}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      amount: invoice.total,
      dueDate: invoice.dueDate,
      createdAt: new Date(),
      actionUrl: `/facturacion`,
    })));

    // 2. FACTURAS PRÓXIMAS A VENCER (dueDate entre now y now+3 días y status = 'sent')
    const upcomingInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientName: invoices.clientName,
        dueDate: invoices.dueDate,
        total: invoices.total,
        status: invoices.status,
      })
      .from(invoices)
      .where(
        and(
          gte(invoices.dueDate, now),
          lt(invoices.dueDate, threeDaysFromNow),
          eq(invoices.status, 'sent')
        )
      );

    alerts.push(...upcomingInvoices.map((invoice) => ({
      id: `upcoming-invoice-${invoice.id}`,
      type: 'upcoming_invoice' as const,
      priority: 'pending' as const,
      title: 'Factura próxima a vencer',
      message: `La factura ${invoice.invoiceNumber} de ${invoice.clientName} vence el ${new Date(invoice.dueDate!).toLocaleDateString('es-ES')}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      amount: invoice.total,
      dueDate: invoice.dueDate,
      createdAt: new Date(),
      actionUrl: `/facturacion`,
    })));

    // 3. CITAS PRÓXIMAS (date entre now y now+7 días y status = 'scheduled' o 'confirmed')
    const upcomingAppointments = await db
      .select({
        id: appointments.id,
        title: appointments.title,
        date: appointments.date,
        clientId: appointments.clientId,
        serviceType: appointments.serviceType,
        status: appointments.status,
      })
      .from(appointments)
      .where(
        and(
          gte(appointments.date, now),
          lte(appointments.date, sevenDaysFromNow),
          sql`${appointments.status} IN ('scheduled', 'confirmed')`
        )
      )
      .orderBy(appointments.date);

    // Obtener nombres de clientes para las citas
    for (const appointment of upcomingAppointments) {
      const client = await db
        .select({ name: clients.name })
        .from(clients)
        .where(eq(clients.id, appointment.clientId))
        .limit(1);

      const clientName = client[0]?.name || 'Cliente desconocido';
      const daysUntil = Math.ceil((new Date(appointment.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      alerts.push({
        id: `upcoming-appointment-${appointment.id}`,
        type: 'upcoming_appointment' as const,
        priority: daysUntil <= 1 ? 'urgent' as const : 'pending' as const,
        title: daysUntil === 0 ? 'Cita hoy' : daysUntil === 1 ? 'Cita mañana' : 'Cita próxima',
        message: `${appointment.title} con ${clientName} el ${new Date(appointment.date).toLocaleDateString('es-ES')} a las ${new Date(appointment.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
        appointmentId: appointment.id,
        clientName,
        date: appointment.date,
        serviceType: appointment.serviceType,
        createdAt: new Date(),
        actionUrl: `/agenda`,
      });
    }

    // 4. ALERTAS DE MANTENIMIENTO DE PIANOS (desde alertHistory con status = 'active')
    const pianoAlerts = await db
      .select({
        id: alertHistory.id,
        pianoId: alertHistory.pianoId,
        clientId: alertHistory.clientId,
        alertType: alertHistory.alertType,
        priority: alertHistory.priority,
        message: alertHistory.message,
        daysSinceLastService: alertHistory.daysSinceLastService,
        status: alertHistory.status,
        createdAt: alertHistory.createdAt,
      })
      .from(alertHistory)
      .where(eq(alertHistory.status, 'active'))
      .orderBy(desc(alertHistory.priority));

    // Obtener información de pianos y clientes
    for (const alert of pianoAlerts) {
      const piano = await db
        .select({ brand: pianos.brand, model: pianos.model })
        .from(pianos)
        .where(eq(pianos.id, alert.pianoId))
        .limit(1);

      const client = await db
        .select({ name: clients.name })
        .from(clients)
        .where(eq(clients.id, alert.clientId))
        .limit(1);

      const pianoName = piano[0] ? `${piano[0].brand} ${piano[0].model}` : 'Piano desconocido';
      const clientName = client[0]?.name || 'Cliente desconocido';

      let title = '';
      if (alert.alertType === 'tuning') {
        title = alert.priority === 'urgent' ? 'Afinación urgente' : 'Afinación pendiente';
      } else if (alert.alertType === 'regulation') {
        title = alert.priority === 'urgent' ? 'Regulación urgente' : 'Regulación pendiente';
      } else if (alert.alertType === 'repair') {
        title = alert.priority === 'urgent' ? 'Reparación urgente' : 'Reparación pendiente';
      }

      alerts.push({
        id: `piano-alert-${alert.id}`,
        type: `piano_${alert.alertType}` as const,
        priority: alert.priority,
        title,
        message: `${pianoName} de ${clientName}: ${alert.message}`,
        pianoId: alert.pianoId,
        clientId: alert.clientId,
        clientName,
        pianoName,
        daysSinceLastService: alert.daysSinceLastService,
        createdAt: alert.createdAt || new Date(),
        actionUrl: `/pianos`,
      });
    }

    // Ordenar alertas por prioridad (urgent primero) y luego por fecha
    const sortedAlerts = alerts.sort((a, b) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return {
      alerts: sortedAlerts,
      count: sortedAlerts.length,
      hasAlerts: sortedAlerts.length > 0,
    };
  }),

  // Obtener resumen de alertas para el dashboard
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Contar facturas vencidas
    const overdueInvoicesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(
        and(
          lt(invoices.dueDate, now),
          eq(invoices.status, 'sent')
        )
      );

    // Contar facturas próximas a vencer
    const upcomingInvoicesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(
        and(
          gte(invoices.dueDate, now),
          lt(invoices.dueDate, threeDaysFromNow),
          eq(invoices.status, 'sent')
        )
      );

    // Contar citas próximas
    const upcomingAppointmentsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(
        and(
          gte(appointments.date, now),
          lte(appointments.date, sevenDaysFromNow),
          sql`${appointments.status} IN ('scheduled', 'confirmed')`
        )
      );

    // Contar alertas de pianos activas
    const pianoAlertsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(alertHistory)
      .where(eq(alertHistory.status, 'active'));

    const overdueInvoices = Number(overdueInvoicesCount[0]?.count || 0);
    const upcomingInvoices = Number(upcomingInvoicesCount[0]?.count || 0);
    const upcomingAppointments = Number(upcomingAppointmentsCount[0]?.count || 0);
    const pianoAlerts = Number(pianoAlertsCount[0]?.count || 0);

    const total = overdueInvoices + upcomingInvoices + upcomingAppointments + pianoAlerts;

    return {
      overdueInvoices,
      upcomingInvoices,
      upcomingAppointments,
      pianoAlerts,
      total,
      hasAlerts: total > 0,
    };
  }),

  // Marcar alerta como leída/resuelta
  markAsRead: protectedProcedure
    .input(z.object({ 
      alertId: z.string(),
      alertType: z.enum(['piano_alert', 'invoice', 'appointment']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Si es una alerta de piano, actualizar en alertHistory
      if (input.alertId.startsWith('piano-alert-')) {
        const id = parseInt(input.alertId.replace('piano-alert-', ''));
        await db
          .update(alertHistory)
          .set({ 
            status: 'acknowledged',
            acknowledgedAt: new Date(),
          })
          .where(eq(alertHistory.id, id));
      }

      return { success: true };
    }),

  // Resolver alerta de piano
  resolveAlert: protectedProcedure
    .input(z.object({ 
      alertId: z.number(),
      serviceId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(alertHistory)
        .set({ 
          status: 'resolved',
          resolvedAt: new Date(),
          resolvedByServiceId: input.serviceId,
        })
        .where(eq(alertHistory.id, input.alertId));

      return { success: true };
    }),
});
