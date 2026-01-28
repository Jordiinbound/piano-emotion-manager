import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { rolePermissions, userPermissions, users } from "../../drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { requirePermission } from "../_core/authMiddleware.js";
import { getUserPermissions } from "../_core/permissions.js";

export const rolesRouter = router({
  // Obtener todos los roles y sus permisos
  listRoles: protectedProcedure
    .use(requirePermission('manage_roles'))
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const permissions = await db
        .select()
        .from(rolePermissions);

      // Agrupar por rol
      const roleMap = new Map<string, string[]>();
      permissions.forEach(p => {
        if (!roleMap.has(p.role)) {
          roleMap.set(p.role, []);
        }
        roleMap.get(p.role)!.push(p.permission);
      });

      return Array.from(roleMap.entries()).map(([role, perms]) => ({
        role,
        permissions: perms,
      }));
    }),

  // Obtener permisos de un usuario específico
  getUserPermissions: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .use(requirePermission('manage_users'))
    .query(async ({ input }) => {
      const permissions = await getUserPermissions(input.userId);
      return permissions;
    }),

  // Obtener mis propios permisos
  getMyPermissions: protectedProcedure
    .query(async ({ ctx }) => {
      const permissions = await getUserPermissions(ctx.user.id);
      return permissions;
    }),

  // Asignar rol a un usuario
  assignRole: protectedProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(['user', 'admin', 'partner', 'technician']),
    }))
    .use(requirePermission('manage_roles'))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Otorgar permiso específico a un usuario
  grantPermission: protectedProcedure
    .input(z.object({
      userId: z.number(),
      permission: z.string(),
    }))
    .use(requirePermission('manage_roles'))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar si ya existe
      const [existing] = await db
        .select()
        .from(userPermissions)
        .where(
          and(
            eq(userPermissions.userId, input.userId),
            eq(userPermissions.permission, input.permission)
          )
        )
        .limit(1);

      if (existing) {
        // Actualizar
        await db
          .update(userPermissions)
          .set({ granted: 1 })
          .where(eq(userPermissions.id, existing.id));
      } else {
        // Insertar
        await db
          .insert(userPermissions)
          .values({
            userId: input.userId,
            permission: input.permission,
            granted: 1,
          });
      }

      return { success: true };
    }),

  // Revocar permiso específico de un usuario
  revokePermission: protectedProcedure
    .input(z.object({
      userId: z.number(),
      permission: z.string(),
    }))
    .use(requirePermission('manage_roles'))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar si existe
      const [existing] = await db
        .select()
        .from(userPermissions)
        .where(
          and(
            eq(userPermissions.userId, input.userId),
            eq(userPermissions.permission, input.permission)
          )
        )
        .limit(1);

      if (existing) {
        // Actualizar a revocado
        await db
          .update(userPermissions)
          .set({ granted: 0 })
          .where(eq(userPermissions.id, existing.id));
      } else {
        // Insertar como revocado
        await db
          .insert(userPermissions)
          .values({
            userId: input.userId,
            permission: input.permission,
            granted: 0,
          });
      }

      return { success: true };
    }),

  // Listar usuarios con sus roles
  listUsersWithRoles: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      role: z.enum(['user', 'admin', 'partner', 'technician']).optional(),
    }))
    .use(requirePermission('manage_users'))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const offset = (input.page - 1) * input.limit;

      let query = db.select().from(users);

      if (input.role) {
        query = query.where(eq(users.role, input.role)) as any;
      }

      const usersList = await query
        .limit(input.limit)
        .offset(offset);

      return {
        users: usersList.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
        })),
        page: input.page,
        limit: input.limit,
      };
    }),
});
