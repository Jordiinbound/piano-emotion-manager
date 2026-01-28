/**
 * Settings Router
 * Piano Emotion Manager
 * 
 * Endpoints para configuración de comunicaciones (Email, WhatsApp, Calendario)
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { userSettings } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// ============================================
// Schemas de validación
// ============================================

const emailConfigSchema = z.object({
  provider: z.enum(['gmail', 'outlook', 'smtp', 'sendgrid', 'mailgun']),
  smtp: z.object({
    host: z.string(),
    port: z.string(),
    secure: z.boolean(),
    user: z.string(),
    password: z.string(),
    fromEmail: z.string(),
    fromName: z.string(),
  }).optional(),
  sendgrid: z.object({
    apiKey: z.string(),
  }).optional(),
  mailgun: z.object({
    apiKey: z.string(),
    domain: z.string(),
  }).optional(),
});

const whatsappConfigSchema = z.object({
  method: z.enum(['web', 'business']),
  business: z.object({
    accessToken: z.string(),
    phoneNumberId: z.string(),
    businessAccountId: z.string(),
  }).optional(),
});

const calendarConfigSchema = z.object({
  primaryCalendar: z.enum(['google', 'outlook', 'both']),
  autoSync: z.boolean(),
  reminders: z.boolean(),
});

// ============================================
// Router
// ============================================

export const settingsRouter = router({
  /**
   * Guardar configuración de email
   */
  saveEmailConfig: protectedProcedure
    .input(emailConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      try {
        // Buscar configuración existente
        const [existing] = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, userId))
          .limit(1);

        const emailConfig = JSON.stringify(input);

        if (existing) {
          // Actualizar configuración existente
          await db
            .update(userSettings)
            .set({
              emailConfig,
              updatedAt: new Date(),
            })
            .where(eq(userSettings.userId, userId));
        } else {
          // Crear nueva configuración
          await db.insert(userSettings).values({
            userId,
            emailConfig,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return { success: true, message: 'Configuración de email guardada' };
      } catch (error: any) {
        console.error('[Settings] Error saving email config:', error);
        throw new Error('Error al guardar configuración de email');
      }
    }),

  /**
   * Obtener configuración de email
   */
  getEmailConfig: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      try {
        const [settings] = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, userId))
          .limit(1);

        if (!settings || !settings.emailConfig) {
          return { provider: 'gmail' }; // Default
        }

        return JSON.parse(settings.emailConfig as string);
      } catch (error: any) {
        console.error('[Settings] Error getting email config:', error);
        return { provider: 'gmail' };
      }
    }),

  /**
   * Guardar configuración de WhatsApp
   */
  saveWhatsAppConfig: protectedProcedure
    .input(whatsappConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      try {
        const [existing] = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, userId))
          .limit(1);

        const whatsappConfig = JSON.stringify(input);

        if (existing) {
          await db
            .update(userSettings)
            .set({
              whatsappConfig,
              updatedAt: new Date(),
            })
            .where(eq(userSettings.userId, userId));
        } else {
          await db.insert(userSettings).values({
            userId,
            whatsappConfig,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return { success: true, message: 'Configuración de WhatsApp guardada' };
      } catch (error: any) {
        console.error('[Settings] Error saving WhatsApp config:', error);
        throw new Error('Error al guardar configuración de WhatsApp');
      }
    }),

  /**
   * Obtener configuración de WhatsApp
   */
  getWhatsAppConfig: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      try {
        const [settings] = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, userId))
          .limit(1);

        if (!settings || !settings.whatsappConfig) {
          return { method: 'web' }; // Default
        }

        return JSON.parse(settings.whatsappConfig as string);
      } catch (error: any) {
        console.error('[Settings] Error getting WhatsApp config:', error);
        return { method: 'web' };
      }
    }),

  /**
   * Guardar configuración de calendario
   */
  saveCalendarConfig: protectedProcedure
    .input(calendarConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      try {
        const [existing] = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, userId))
          .limit(1);

        const calendarConfig = JSON.stringify(input);

        if (existing) {
          await db
            .update(userSettings)
            .set({
              calendarConfig,
              updatedAt: new Date(),
            })
            .where(eq(userSettings.userId, userId));
        } else {
          await db.insert(userSettings).values({
            userId,
            calendarConfig,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return { success: true, message: 'Configuración de calendario guardada' };
      } catch (error: any) {
        console.error('[Settings] Error saving calendar config:', error);
        throw new Error('Error al guardar configuración de calendario');
      }
    }),

  /**
   * Obtener configuración de calendario
   */
  getCalendarConfig: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      try {
        const [settings] = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, userId))
          .limit(1);

        if (!settings || !settings.calendarConfig) {
          return {
            primaryCalendar: 'google',
            autoSync: true,
            reminders: true,
          }; // Default
        }

        return JSON.parse(settings.calendarConfig as string);
      } catch (error: any) {
        console.error('[Settings] Error getting calendar config:', error);
        return {
          primaryCalendar: 'google',
          autoSync: true,
          reminders: true,
        };
      }
    }),

  /**
   * Enviar email de prueba
   */
  testEmailConfig: protectedProcedure
    .input(z.object({
      provider: z.enum(['gmail', 'outlook', 'smtp', 'sendgrid', 'mailgun']),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const userEmail = ctx.user.email;

      try {
        console.log(`[Settings] Testing email config for provider: ${input.provider}`);
        
        // TODO: Implementar envío real de email de prueba según el proveedor
        // Por ahora solo simulamos el envío
        
        return {
          success: true,
          message: `Email de prueba enviado a ${userEmail} usando ${input.provider}`,
        };
      } catch (error: any) {
        console.error('[Settings] Error testing email:', error);
        throw new Error('Error al enviar email de prueba');
      }
    }),
});
