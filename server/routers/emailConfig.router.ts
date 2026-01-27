/**
 * Email Configuration Router - tRPC
 * Piano Emotion Manager
 * 
 * Endpoints para configuración de email con OAuth2 y SMTP manual
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  getGmailAuthUrl,
  exchangeGmailCode,
  refreshGmailToken,
  getGmailUserEmail,
} from '../services/gmailOAuth';
import {
  getOutlookAuthUrl,
  exchangeOutlookCode,
  refreshOutlookToken,
  getOutlookUserEmail,
} from '../services/outlookOAuth';

export const emailConfigRouter = router({
  // Obtener configuración actual de email
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const userResult = await db
      .select({
        emailProvider: users.emailProvider,
        oauth2Email: users.oauth2Email,
        smtpHost: users.smtpHost,
        smtpPort: users.smtpPort,
        smtpUser: users.smtpUser,
        smtpSecure: users.smtpSecure,
        smtpFromName: users.smtpFromName,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id));

    if (!userResult || userResult.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    return userResult[0];
  }),

  // Obtener URL de autorización de Gmail
  getGmailAuthUrl: protectedProcedure.query(({ ctx }) => {
    const authUrl = getGmailAuthUrl(ctx.user.id);
    return { authUrl };
  }),

  // Obtener URL de autorización de Outlook
  getOutlookAuthUrl: protectedProcedure.query(({ ctx }) => {
    const authUrl = getOutlookAuthUrl(ctx.user.id);
    return { authUrl };
  }),

  // Callback de Gmail OAuth2
  handleGmailCallback: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      try {
        // Intercambiar código por tokens
        const tokens = await exchangeGmailCode(input.code);

        if (!tokens.access_token || !tokens.refresh_token) {
          throw new Error('No se pudieron obtener los tokens');
        }

        // Obtener email del usuario
        const email = await getGmailUserEmail(tokens.access_token);

        // Guardar tokens en la base de datos
        await db
          .update(users)
          .set({
            emailProvider: 'gmail_oauth',
            oauth2AccessToken: tokens.access_token,
            oauth2RefreshToken: tokens.refresh_token,
            oauth2TokenExpiry: tokens.expiry_date
              ? new Date(tokens.expiry_date)
              : null,
            oauth2Email: email,
          })
          .where(eq(users.id, ctx.user.id));

        return {
          success: true,
          message: 'Gmail conectado exitosamente',
          email,
        };
      } catch (error) {
        console.error('[Gmail OAuth] Error:', error);
        throw new Error('Error al conectar con Gmail');
      }
    }),

  // Callback de Outlook OAuth2
  handleOutlookCallback: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      try {
        // Intercambiar código por tokens
        const tokens = await exchangeOutlookCode(input.code);

        if (!tokens.access_token || !tokens.refresh_token) {
          throw new Error('No se pudieron obtener los tokens');
        }

        // Obtener email del usuario
        const email = await getOutlookUserEmail(tokens.access_token);

        // Guardar tokens en la base de datos
        await db
          .update(users)
          .set({
            emailProvider: 'outlook_oauth',
            oauth2AccessToken: tokens.access_token,
            oauth2RefreshToken: tokens.refresh_token,
            oauth2TokenExpiry: tokens.expiry_date
              ? new Date(tokens.expiry_date)
              : null,
            oauth2Email: email,
          })
          .where(eq(users.id, ctx.user.id));

        return {
          success: true,
          message: 'Outlook conectado exitosamente',
          email,
        };
      } catch (error) {
        console.error('[Outlook OAuth] Error:', error);
        throw new Error('Error al conectar con Outlook');
      }
    }),

  // Configurar SMTP manual
  configureSMTP: protectedProcedure
    .input(
      z.object({
        host: z.string(),
        port: z.number(),
        user: z.string(),
        password: z.string(),
        secure: z.boolean(),
        fromName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(users)
        .set({
          emailProvider: 'smtp',
          smtpHost: input.host,
          smtpPort: input.port,
          smtpUser: input.user,
          smtpPassword: input.password,
          smtpSecure: input.secure ? 1 : 0,
          smtpFromName: input.fromName || null,
          // Limpiar tokens OAuth2 si existían
          oauth2AccessToken: null,
          oauth2RefreshToken: null,
          oauth2TokenExpiry: null,
          oauth2Email: null,
        })
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
        message: 'Configuración SMTP guardada exitosamente',
      };
    }),

  // Desconectar email (limpiar configuración)
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    await db
      .update(users)
      .set({
        emailProvider: 'smtp',
        oauth2AccessToken: null,
        oauth2RefreshToken: null,
        oauth2TokenExpiry: null,
        oauth2Email: null,
        smtpHost: null,
        smtpPort: null,
        smtpUser: null,
        smtpPassword: null,
        smtpSecure: null,
        smtpFromName: null,
      })
      .where(eq(users.id, ctx.user.id));

    return {
      success: true,
      message: 'Configuración de email eliminada',
    };
  }),
});
