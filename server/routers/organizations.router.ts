import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { organizations, organizationMembers, organizationInvitations, organizationActivityLog } from "../../drizzle/schema.js";
import { eq, and, or, desc, asc, like, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const organizationsRouter = router({
  // Obtener todas las organizaciones del usuario
  getMyOrganizations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userOrgs = await db
      .select({
        organization: organizations,
        member: organizationMembers,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(eq(organizationMembers.userId, ctx.user.id))
      .orderBy(desc(organizationMembers.createdAt));

    return userOrgs.map((row) => ({
      ...row.organization,
      role: row.member.role,
      permissions: row.member.permissions,
    }));
  }),

  // Obtener una organización por ID
  getOrganization: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.id))
        .limit(1);

      if (!org) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Organización no encontrada" });
      }

      // Verificar que el usuario pertenece a la organización
      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.id),
            eq(organizationMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a esta organización" });
      }

      return { ...org, role: member.role, permissions: member.permissions };
    }),

  // Crear organización
  createOrganization: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        logo: z.string().optional(),
        subscriptionPlan: z.enum(['free', 'starter', 'team', 'business', 'enterprise']).default('free'),
        taxId: z.string().optional(),
        legalName: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().default('ES'),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar que el slug no exista
      const [existing] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, input.slug))
        .limit(1);

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "El slug ya está en uso" });
      }

      // Crear organización
      const [org] = await db.insert(organizations).values({
        ...input,
        ownerId: ctx.user.id,
      });

      const orgId = org.insertId;

      // Agregar al usuario como owner
      await db.insert(organizationMembers).values({
        organizationId: orgId,
        userId: ctx.user.id,
        role: 'owner',
        permissions: JSON.stringify({
          canManageMembers: true,
          canManageSettings: true,
          canManageBilling: true,
          canManageModules: true,
          canViewAnalytics: true,
          canManageData: true,
        }),
      });

      // Registrar actividad
      await db.insert(organizationActivityLog).values({
        organizationId: orgId,
        userId: ctx.user.id,
        action: 'organization_created',
        details: JSON.stringify({ name: input.name }),
      });

      return { id: orgId, ...input };
    }),

  // Actualizar organización
  updateOrganization: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        taxId: z.string().optional(),
        legalName: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().optional(),
        bankAccount: z.string().optional(),
        bankName: z.string().optional(),
        swiftBic: z.string().optional(),
        invoicePrefix: z.string().optional(),
        defaultTaxRate: z.string().optional(),
        defaultCurrency: z.string().optional(),
        timezone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...updates } = input;

      // Verificar permisos
      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, id),
            eq(organizationMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a esta organización" });
      }

      const permissions = typeof member.permissions === 'string' 
        ? JSON.parse(member.permissions) 
        : member.permissions;

      if (!permissions.canManageSettings) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para editar la organización" });
      }

      // Actualizar
      await db
        .update(organizations)
        .set(updates)
        .where(eq(organizations.id, id));

      // Registrar actividad
      await db.insert(organizationActivityLog).values({
        organizationId: id,
        userId: ctx.user.id,
        action: 'organization_updated',
        details: JSON.stringify(updates),
      });

      return { success: true };
    }),

  // Obtener miembros de la organización
  getMembers: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar acceso
      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a esta organización" });
      }

      // Obtener miembros
      const members = await db
        .select({
          id: organizationMembers.id,
          userId: organizationMembers.userId,
          role: organizationMembers.role,
          permissions: organizationMembers.permissions,
          joinedAt: organizationMembers.createdAt,
        })
        .from(organizationMembers)
        .where(eq(organizationMembers.organizationId, input.organizationId))
        .orderBy(desc(organizationMembers.createdAt));

      return members;
    }),

  // Invitar miembro
  inviteMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        email: z.string().email(),
        role: z.enum(['admin', 'member', 'viewer']),
        permissions: z.object({
          canManageMembers: z.boolean().default(false),
          canManageSettings: z.boolean().default(false),
          canManageBilling: z.boolean().default(false),
          canManageModules: z.boolean().default(false),
          canViewAnalytics: z.boolean().default(true),
          canManageData: z.boolean().default(false),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar permisos
      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a esta organización" });
      }

      const permissions = typeof member.permissions === 'string' 
        ? JSON.parse(member.permissions) 
        : member.permissions;

      if (!permissions.canManageMembers) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para invitar miembros" });
      }

      // Crear invitación
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

      await db.insert(organizationInvitations).values({
        organizationId: input.organizationId,
        email: input.email,
        role: input.role,
        permissions: JSON.stringify(input.permissions),
        token,
        expiresAt,
        invitedBy: ctx.user.id,
      });

      // Registrar actividad
      await db.insert(organizationActivityLog).values({
        organizationId: input.organizationId,
        userId: ctx.user.id,
        action: 'member_invited',
        details: JSON.stringify({ email: input.email, role: input.role }),
      });

      return { success: true, token };
    }),

  // Eliminar miembro
  removeMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        memberId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar permisos
      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a esta organización" });
      }

      const permissions = typeof member.permissions === 'string' 
        ? JSON.parse(member.permissions) 
        : member.permissions;

      if (!permissions.canManageMembers) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para eliminar miembros" });
      }

      // Verificar que no sea el owner
      const [targetMember] = await db
        .select()
        .from(organizationMembers)
        .where(eq(organizationMembers.id, input.memberId))
        .limit(1);

      if (targetMember?.role === 'owner') {
        throw new TRPCError({ code: "FORBIDDEN", message: "No puedes eliminar al propietario" });
      }

      // Eliminar
      await db
        .delete(organizationMembers)
        .where(eq(organizationMembers.id, input.memberId));

      // Registrar actividad
      await db.insert(organizationActivityLog).values({
        organizationId: input.organizationId,
        userId: ctx.user.id,
        action: 'member_removed',
        details: JSON.stringify({ memberId: input.memberId }),
      });

      return { success: true };
    }),

  // Obtener log de actividad
  getActivityLog: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        page: z.number().default(1),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar acceso
      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a esta organización" });
      }

      const offset = (input.page - 1) * input.limit;

      const activities = await db
        .select()
        .from(organizationActivityLog)
        .where(eq(organizationActivityLog.organizationId, input.organizationId))
        .orderBy(desc(organizationActivityLog.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: count() })
        .from(organizationActivityLog)
        .where(eq(organizationActivityLog.organizationId, input.organizationId));

      return {
        items: activities,
        total: totalResult?.count || 0,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil((totalResult?.count || 0) / input.limit),
      };
    }),
});
