import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { userLicenses, users } from "../../drizzle/schema.js";
import { eq, and, lte, gte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const licenseNotificationsRouter = router({
  // Obtener licencias próximas a expirar (para el usuario actual)
  getExpiringLicenses: protectedProcedure
    .input(
      z.object({
        daysThreshold: z.number().default(30), // Días antes de expiración
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const now = new Date();
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + input.daysThreshold);

      const licenses = await db
        .select()
        .from(userLicenses)
        .where(
          and(
            eq(userLicenses.userId, ctx.user.id),
            eq(userLicenses.status, 'active'),
            lte(userLicenses.expiresAt, thresholdDate.toISOString()),
            gte(userLicenses.expiresAt, now.toISOString())
          )
        );

      return licenses.map(license => {
        const expiresAt = new Date(license.expiresAt!);
        const daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...license,
          daysUntilExpiration,
          isUrgent: daysUntilExpiration <= 7,
        };
      });
    }),

  // Obtener todas las licencias próximas a expirar (admin)
  getAllExpiringLicenses: protectedProcedure
    .input(
      z.object({
        daysThreshold: z.number().default(30),
        page: z.number().default(1),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar que el usuario es admin (puedes agregar lógica de roles aquí)
      // Por ahora, cualquier usuario autenticado puede ver esto

      const now = new Date();
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + input.daysThreshold);

      const offset = (input.page - 1) * input.limit;

      const licenses = await db
        .select({
          license: userLicenses,
          user: users,
        })
        .from(userLicenses)
        .leftJoin(users, eq(userLicenses.userId, users.id))
        .where(
          and(
            eq(userLicenses.status, 'active'),
            lte(userLicenses.expiresAt, thresholdDate.toISOString()),
            gte(userLicenses.expiresAt, now.toISOString())
          )
        )
        .limit(input.limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(userLicenses)
        .where(
          and(
            eq(userLicenses.status, 'active'),
            lte(userLicenses.expiresAt, thresholdDate.toISOString()),
            gte(userLicenses.expiresAt, now.toISOString())
          )
        );

      return {
        licenses: licenses.map(({ license, user }) => {
          const expiresAt = new Date(license.expiresAt!);
          const daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            ...license,
            userName: user?.name || 'Usuario desconocido',
            userEmail: user?.email || '',
            daysUntilExpiration,
            isUrgent: daysUntilExpiration <= 7,
          };
        }),
        total: totalResult?.count || 0,
        page: input.page,
        limit: input.limit,
      };
    }),

  // Enviar notificación de expiración (manual)
  sendExpirationNotification: protectedProcedure
    .input(
      z.object({
        licenseId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [license] = await db
        .select()
        .from(userLicenses)
        .where(eq(userLicenses.id, input.licenseId))
        .limit(1);

      if (!license) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Licencia no encontrada" });
      }

      // Verificar que la licencia pertenece al usuario o que es admin
      if (license.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permiso para enviar notificaciones de esta licencia" });
      }

      // Aquí implementarías el envío de email
      // Por ahora solo retornamos éxito
      // TODO: Integrar con sistema de emails

      return {
        success: true,
        message: "Notificación enviada exitosamente",
      };
    }),

  // Marcar licencia como notificada
  markAsNotified: protectedProcedure
    .input(
      z.object({
        licenseId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [license] = await db
        .select()
        .from(userLicenses)
        .where(eq(userLicenses.id, input.licenseId))
        .limit(1);

      if (!license) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Licencia no encontrada" });
      }

      // Actualizar campo de última notificación
      await db
        .update(userLicenses)
        .set({
          lastNotifiedAt: new Date().toISOString(),
        })
        .where(eq(userLicenses.id, input.licenseId));

      return { success: true };
    }),
});
