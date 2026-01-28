/**
 * Notifications Router - Gestión de notificaciones del sistema
 * Piano Emotion Manager
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc.js';
import { getDb } from '../db.js';
import { notifications } from '../../drizzle/schema.js';
import { eq, and, desc } from 'drizzle-orm';

export const notificationsRouter = router({
  /**
   * Listar notificaciones del usuario actual
   */
  list: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        unreadOnly: z.boolean().optional(),
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const conditions = [eq(notifications.userId, input.userId)];
      
      if (input.unreadOnly) {
        conditions.push(eq(notifications.isRead, 0));
      }

      const results = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(input.limit);

      return results;
    }),

  /**
   * Contar notificaciones no leídas
   */
  countUnread: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const results = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, input.userId),
            eq(notifications.isRead, 0)
          )
        );

      return { count: results.length };
    }),

  /**
   * Marcar notificación como leída
   */
  markAsRead: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(notifications)
        .set({
          isRead: 1,
          readAt: new Date(),
        })
        .where(eq(notifications.id, input.id));

      return { success: true };
    }),

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(notifications)
        .set({
          isRead: 1,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.userId, input.userId),
            eq(notifications.isRead, 0)
          )
        );

      return { success: true };
    }),

  /**
   * Eliminar notificación
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .delete(notifications)
        .where(eq(notifications.id, input.id));

      return { success: true };
    }),

  /**
   * Crear notificación (uso interno)
   */
  create: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        type: z.enum(['approval_pending', 'workflow_completed', 'workflow_failed', 'system']),
        title: z.string(),
        message: z.string().optional(),
        data: z.any().optional(),
        actionUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.insert(notifications).values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data ? JSON.stringify(input.data) : null,
        actionUrl: input.actionUrl,
        isRead: 0,
      } as any);

      return {
        success: true,
        notificationId: (result as any).insertId || 0,
      };
    }),
});
