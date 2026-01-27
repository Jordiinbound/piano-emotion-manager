/**
 * Alerts Router - tRPC
 * Piano Emotion Manager
 * 
 * Sistema de alertas conectado a la base de datos
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { invoices } from '../../drizzle/schema';
import { and, eq, lt, gte, sql } from 'drizzle-orm';

export const alertsRouter = router({
  // Obtener todas las alertas activas
  getAlerts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Facturas vencidas (dueDate < now y status != 'paid')
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

    // Facturas próximas a vencer (dueDate entre now y now+3 días y status != 'paid')
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

    // Construir alertas
    const alerts = [
      ...overdueInvoices.map((invoice) => ({
        id: `overdue-${invoice.id}`,
        type: 'overdue' as const,
        priority: 'urgent' as const,
        title: 'Factura vencida',
        message: `La factura ${invoice.invoiceNumber} de ${invoice.clientName} venció el ${new Date(invoice.dueDate!).toLocaleDateString('es-ES')}`,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        amount: invoice.total,
        dueDate: invoice.dueDate,
        createdAt: new Date(),
      })),
      ...upcomingInvoices.map((invoice) => ({
        id: `upcoming-${invoice.id}`,
        type: 'upcoming' as const,
        priority: 'pending' as const,
        title: 'Factura próxima a vencer',
        message: `La factura ${invoice.invoiceNumber} de ${invoice.clientName} vence el ${new Date(invoice.dueDate!).toLocaleDateString('es-ES')}`,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        amount: invoice.total,
        dueDate: invoice.dueDate,
        createdAt: new Date(),
      })),
    ];

    return {
      alerts,
      count: alerts.length,
      hasAlerts: alerts.length > 0,
    };
  }),

  // Obtener resumen de alertas
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Contar facturas vencidas
    const overdueCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(
        and(
          lt(invoices.dueDate, now),
          eq(invoices.status, 'sent')
        )
      );

    // Contar facturas próximas a vencer
    const upcomingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(
        and(
          gte(invoices.dueDate, now),
          lt(invoices.dueDate, threeDaysFromNow),
          eq(invoices.status, 'sent')
        )
      );

    const overdue = Number(overdueCount[0]?.count || 0);
    const upcoming = Number(upcomingCount[0]?.count || 0);
    const total = overdue + upcoming;

    return {
      overdue,
      upcoming,
      total,
      hasAlerts: total > 0,
    };
  }),

  // Marcar alerta como leída (no implementado en BD, solo para UI)
  markAsRead: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ input }) => {
      // Por ahora solo retornamos success
      // En el futuro se podría guardar en una tabla de alertas leídas
      return { success: true };
    }),
});
