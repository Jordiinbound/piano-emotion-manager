/**
 * Users Router
 * Piano Emotion Manager
 * 
 * Endpoints para gestión de usuarios
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const usersRouter = router({
  // Actualizar configuración SMTP del usuario
  updateSmtpConfig: protectedProcedure
    .input(
      z.object({
        smtpHost: z.string(),
        smtpPort: z.number(),
        smtpUser: z.string().email(),
        smtpPassword: z.string().optional(),
        smtpSecure: z.boolean(),
        smtpFromName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Preparar datos para actualizar
      const updateData: any = {
        smtpHost: input.smtpHost,
        smtpPort: input.smtpPort,
        smtpUser: input.smtpUser,
        smtpSecure: input.smtpSecure ? 1 : 0,
        smtpFromName: input.smtpFromName || null,
      };

      // Solo actualizar contraseña si se proporcionó una nueva
      if (input.smtpPassword) {
        updateData.smtpPassword = input.smtpPassword;
      }

      // Actualizar usuario
      await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));

      return { success: true };
    }),
});
