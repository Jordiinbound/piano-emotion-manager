/**
 * Alert Settings Router - tRPC
 * Piano Emotion Manager
 * 
 * Gestión de configuración de umbrales de alertas
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { alertSettings } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const alertSettingsRouter = router({
  // Obtener configuración de alertas del usuario
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Buscar configuración del usuario
    const settings = await db
      .select()
      .from(alertSettings)
      .where(eq(alertSettings.userId, ctx.user.id))
      .limit(1);

    // Si no existe, retornar valores por defecto
    if (settings.length === 0) {
      return {
        // Umbrales de Pianos
        tuningPendingDays: 180,
        tuningUrgentDays: 270,
        regulationPendingDays: 730,
        regulationUrgentDays: 1095,
        
        // Citas y Servicios
        appointmentsNoticeDays: 7,
        scheduledServicesNoticeDays: 7,
        
        // Finanzas
        invoicesDueNoticeDays: 7,
        quotesExpiryNoticeDays: 7,
        contractsRenewalNoticeDays: 30,
        overduePaymentsNoticeDays: 15,
        
        // Inventario
        inventoryMinStock: 5,
        inventoryExpiryNoticeDays: 30,
        
        // Mantenimiento
        toolsMaintenanceDays: 180,
        
        // Clientes
        clientFollowupDays: 90,
        clientInactiveMonths: 12,
        
        // Preferencias de Notificaciones
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: false,
        weeklyDigestEnabled: true,
        weeklyDigestDay: 1,
      };
    }

    return settings[0];
  }),

  // Actualizar configuración de alertas
  updateSettings: protectedProcedure
    .input(z.object({
      // Umbrales de Pianos
      tuningPendingDays: z.number().min(1).max(365).optional(),
      tuningUrgentDays: z.number().min(1).max(730).optional(),
      regulationPendingDays: z.number().min(1).max(1095).optional(),
      regulationUrgentDays: z.number().min(1).max(1825).optional(),
      
      // Citas y Servicios
      appointmentsNoticeDays: z.number().min(1).max(30).optional(),
      scheduledServicesNoticeDays: z.number().min(1).max(30).optional(),
      
      // Finanzas
      invoicesDueNoticeDays: z.number().min(1).max(30).optional(),
      quotesExpiryNoticeDays: z.number().min(1).max(30).optional(),
      contractsRenewalNoticeDays: z.number().min(1).max(90).optional(),
      overduePaymentsNoticeDays: z.number().min(1).max(60).optional(),
      
      // Inventario
      inventoryMinStock: z.number().min(0).max(100).optional(),
      inventoryExpiryNoticeDays: z.number().min(1).max(90).optional(),
      
      // Mantenimiento
      toolsMaintenanceDays: z.number().min(1).max(365).optional(),
      
      // Clientes
      clientFollowupDays: z.number().min(1).max(180).optional(),
      clientInactiveMonths: z.number().min(1).max(24).optional(),
      
      // Preferencias de Notificaciones
      emailNotificationsEnabled: z.boolean().optional(),
      pushNotificationsEnabled: z.boolean().optional(),
      weeklyDigestEnabled: z.boolean().optional(),
      weeklyDigestDay: z.number().min(0).max(6).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar si ya existe configuración
      const existing = await db
        .select()
        .from(alertSettings)
        .where(eq(alertSettings.userId, ctx.user.id))
        .limit(1);

      if (existing.length === 0) {
        // Crear nueva configuración
        await db.insert(alertSettings).values({
          userId: ctx.user.id,
          partnerId: 1, // TODO: obtener partnerId del usuario
          ...input,
        });
      } else {
        // Actualizar configuración existente
        await db
          .update(alertSettings)
          .set(input)
          .where(eq(alertSettings.userId, ctx.user.id));
      }

      return { success: true };
    }),

  // Restablecer configuración a valores por defecto
  resetSettings: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Eliminar configuración personalizada
    await db
      .delete(alertSettings)
      .where(eq(alertSettings.userId, ctx.user.id));

    return { success: true };
  }),
});
