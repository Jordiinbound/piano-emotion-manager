/**
 * WhatsApp Notifications Router
 * Piano Emotion Manager - Manus
 * 
 * Endpoints para generar notificaciones automáticas de WhatsApp
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { WhatsAppNotificationsService } from '../services/whatsappNotifications';

export const whatsappNotificationsRouter = router({
  /**
   * Obtiene recordatorios de citas próximas
   */
  getUpcomingAppointmentReminders: protectedProcedure
    .input(z.object({
      daysAhead: z.number().min(0).max(30).default(1),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener citas próximas con información del cliente
      const appointments = await db.query.appointments.findMany({
        with: {
          client: true,
        },
      });

      // Filtrar y transformar datos
      const appointmentsData = appointments.map(apt => ({
        id: apt.id,
        clientId: apt.clientId,
        clientName: apt.client?.name || 'Cliente',
        clientPhone: apt.client?.phone || null,
        serviceName: apt.serviceType || 'Servicio',
        date: apt.date,
      }));

      // Generar recordatorios
      const upcoming = WhatsAppNotificationsService.filterUpcomingAppointments(
        appointmentsData,
        input.daysAhead
      );
      const reminders = WhatsAppNotificationsService.generateAppointmentReminders(upcoming);

      return {
        count: reminders.length,
        reminders,
      };
    }),

  /**
   * Obtiene recordatorios de pagos vencidos
   */
  getOverduePaymentReminders: protectedProcedure
    .input(z.object({
      minDaysOverdue: z.number().min(0).max(365).default(1),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener facturas con información del cliente
      const invoices = await db.query.invoices.findMany({
        with: {
          client: true,
        },
      });

      // Filtrar y transformar datos
      const invoicesData = invoices
        .filter(inv => inv.dueDate) // Solo facturas con fecha de vencimiento
        .map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          clientId: inv.clientId,
          clientName: inv.client?.name || inv.clientName,
          clientPhone: inv.client?.phone || inv.clientEmail || null,
          total: inv.total,
          dueDate: inv.dueDate!,
          status: inv.status,
        }));

      // Generar recordatorios
      const overdue = WhatsAppNotificationsService.filterOverdueInvoices(
        invoicesData,
        input.minDaysOverdue
      );
      const reminders = WhatsAppNotificationsService.generatePaymentReminders(overdue);

      return {
        count: reminders.length,
        reminders,
      };
    }),

  /**
   * Obtiene recordatorios de mantenimiento de pianos
   */
  getMaintenanceReminders: protectedProcedure
    .input(z.object({
      daysSinceLastService: z.number().min(30).max(730).default(180),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener pianos con último servicio y cliente
      const pianos = await db.query.pianos.findMany({
        with: {
          client: true,
          services: {
            orderBy: (services, { desc }) => [desc(services.date)],
            limit: 1,
          },
        },
      });

      // Filtrar pianos que necesitan mantenimiento
      const now = new Date();
      const pianosNeedingMaintenance = pianos
        .filter(piano => {
          if (!piano.services || piano.services.length === 0) return true; // Nunca ha tenido servicio
          
          const lastService = piano.services[0];
          const lastServiceDate = new Date(lastService.date);
          const daysSince = Math.floor((now.getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return daysSince >= input.daysSinceLastService;
        })
        .map(piano => ({
          clientId: piano.clientId,
          clientName: piano.client?.name || 'Cliente',
          clientPhone: piano.client?.phone || '',
          pianoName: `${piano.brand} ${piano.model || ''}`.trim(),
          lastServiceDate: piano.services?.[0]?.date 
            ? new Date(piano.services[0].date).toLocaleDateString('es-ES')
            : 'Nunca',
          recommendedService: 'Afinación y revisión general',
        }));

      // Generar recordatorios
      const reminders = WhatsAppNotificationsService.generateMaintenanceReminders(
        pianosNeedingMaintenance
      );

      return {
        count: reminders.length,
        reminders,
      };
    }),

  /**
   * Genera todos los recordatorios pendientes
   */
  getAllPendingReminders: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener citas de mañana
      const appointments = await db.query.appointments.findMany({
        with: { client: true },
      });
      const appointmentsData = appointments.map(apt => ({
        id: apt.id,
        clientId: apt.clientId,
        clientName: apt.client?.name || 'Cliente',
        clientPhone: apt.client?.phone || null,
        serviceName: apt.serviceType || 'Servicio',
        date: apt.date,
      }));
      const upcomingApts = WhatsAppNotificationsService.filterUpcomingAppointments(appointmentsData, 1);
      const appointmentReminders = WhatsAppNotificationsService.generateAppointmentReminders(upcomingApts);

      // Obtener facturas vencidas
      const invoices = await db.query.invoices.findMany({
        with: { client: true },
      });
      const invoicesData = invoices
        .filter(inv => inv.dueDate)
        .map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          clientId: inv.clientId,
          clientName: inv.client?.name || inv.clientName,
          clientPhone: inv.client?.phone || null,
          total: inv.total,
          dueDate: inv.dueDate!,
          status: inv.status,
        }));
      const overdueInvs = WhatsAppNotificationsService.filterOverdueInvoices(invoicesData, 1);
      const paymentReminders = WhatsAppNotificationsService.generatePaymentReminders(overdueInvs);

      return {
        appointments: {
          count: appointmentReminders.length,
          reminders: appointmentReminders,
        },
        payments: {
          count: paymentReminders.length,
          reminders: paymentReminders,
        },
        total: appointmentReminders.length + paymentReminders.length,
      };
    }),
});
