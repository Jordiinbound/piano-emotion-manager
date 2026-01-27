import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { partners, partnerUsers, partnerSettings, partnerPricing } from "../../drizzle/schema.js";
import { eq, and, or, desc, asc, like, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const partnersRouter = router({
  // Obtener partner actual del usuario
  getMyPartner: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const [partnerUser] = await db
      .select({
        partner: partners,
        partnerUser: partnerUsers,
      })
      .from(partnerUsers)
      .innerJoin(partners, eq(partnerUsers.partnerId, partners.id))
      .where(eq(partnerUsers.userId, ctx.user.id))
      .limit(1);

    if (!partnerUser) {
      return null;
    }

    // Obtener settings
    const [settings] = await db
      .select()
      .from(partnerSettings)
      .where(eq(partnerSettings.partnerId, partnerUser.partner.id))
      .limit(1);

    return {
      ...partnerUser.partner,
      role: partnerUser.partnerUser.role,
      permissions: {
        canManageBranding: partnerUser.partnerUser.canManageBranding === 1,
        canManagePricing: partnerUser.partnerUser.canManagePricing === 1,
        canManageUsers: partnerUser.partnerUser.canManageUsers === 1,
        canViewAnalytics: partnerUser.partnerUser.canViewAnalytics === 1,
      },
      settings,
    };
  }),

  // Obtener partner por ID
  getPartner: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
      const [partner] = await db
        .select()
        .from(partners)
        .where(eq(partners.id, input.id))
        .limit(1);

      if (!partner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Partner no encontrado" });
      }

      // Verificar que el usuario pertenece al partner
      const [partnerUser] = await db
        .select()
        .from(partnerUsers)
        .where(
          and(
            eq(partnerUsers.partnerId, input.id),
            eq(partnerUsers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!partnerUser) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a este partner" });
      }

      // Obtener settings
      const [settings] = await db
        .select()
        .from(partnerSettings)
        .where(eq(partnerSettings.partnerId, input.id))
        .limit(1);

      return { ...partner, settings };
    }),

  // Crear partner
  createPartner: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        name: z.string().min(1),
        email: z.string().email(),
        customDomain: z.string().optional(),
        logo: z.string().optional(),
        primaryColor: z.string().default('#3b82f6'),
        secondaryColor: z.string().default('#10b981'),
        brandName: z.string().optional(),
        defaultLanguage: z.string().default('es'),
        supportEmail: z.string().email().optional(),
        supportPhone: z.string().optional(),
        legalName: z.string().optional(),
        businessName: z.string().optional(),
        taxId: z.string().optional(),
        addressStreet: z.string().optional(),
        addressPostalCode: z.string().optional(),
        addressCity: z.string().optional(),
        addressProvince: z.string().optional(),
        iban: z.string().optional(),
        bankName: z.string().optional(),
        businessMode: z.enum(['individual', 'team']).default('individual'),
        emailClientPreference: z.enum(['gmail', 'outlook', 'default']).default('gmail'),
      })
    )
    .mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
      // Verificar que el slug no exista
      const [existing] = await db
        .select()
        .from(partners)
        .where(eq(partners.slug, input.slug))
        .limit(1);

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "El slug ya está en uso" });
      }

      // Crear partner
      const [partner] = await db.insert(partners).values(input);
      const partnerId = partner.insertId;

      // Agregar al usuario como owner
      await db.insert(partnerUsers).values({
        partnerId,
        userId: ctx.user.id,
        role: 'owner',
        canManageBranding: 1,
        canManagePricing: 1,
        canManageUsers: 1,
        canViewAnalytics: 1,
      });

      // Crear settings por defecto
      await db.insert(partnerSettings).values({
        partnerId,
        ecommerceEnabled: 0,
        autoOrderEnabled: 0,
        autoOrderThreshold: 5,
        alertPianoTuning: 1,
        alertPianoRegulation: 1,
        alertPianoMaintenance: 1,
        alertQuotesPending: 1,
        alertQuotesExpiring: 1,
        alertInvoicesPending: 1,
        alertInvoicesOverdue: 1,
        alertUpcomingAppointments: 1,
        alertUnconfirmedAppointments: 1,
        alertFrequency: 'realtime',
        pushNotifications: 1,
        emailNotifications: 1,
        calendarSync: 'none',
      });

      return { id: partnerId, ...input };
    }),

  // Actualizar partner
  updatePartner: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        customDomain: z.string().optional(),
        logo: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        brandName: z.string().optional(),
        defaultLanguage: z.string().optional(),
        supportEmail: z.string().email().optional(),
        supportPhone: z.string().optional(),
        legalName: z.string().optional(),
        businessName: z.string().optional(),
        taxId: z.string().optional(),
        addressStreet: z.string().optional(),
        addressPostalCode: z.string().optional(),
        addressCity: z.string().optional(),
        addressProvince: z.string().optional(),
        iban: z.string().optional(),
        bankName: z.string().optional(),
        businessMode: z.enum(['individual', 'team']).optional(),
        emailClientPreference: z.enum(['gmail', 'outlook', 'default']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...updates } = input;

      // Verificar permisos
      const [partnerUser] = await db
        .select()
        .from(partnerUsers)
        .where(
          and(
            eq(partnerUsers.partnerId, id),
            eq(partnerUsers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!partnerUser) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a este partner" });
      }

      if (partnerUser.canManageBranding !== 1 && partnerUser.role !== 'owner') {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para editar el partner" });
      }

      // Actualizar
      await db
        .update(partners)
        .set(updates)
        .where(eq(partners.id, id));

      return { success: true };
    }),

  // Actualizar settings del partner
  updateSettings: protectedProcedure
    .input(
      z.object({
        partnerId: z.number(),
        ecommerceEnabled: z.number().optional(),
        ecommerceApiUrl: z.string().optional(),
        ecommerceApiKey: z.string().optional(),
        autoOrderEnabled: z.number().optional(),
        autoOrderThreshold: z.number().optional(),
        notificationEmail: z.string().email().optional(),
        notificationWebhook: z.string().optional(),
        maxUsers: z.number().optional(),
        maxOrganizations: z.number().optional(),
        supportedLanguages: z.any().optional(),
        alertPianoTuning: z.number().optional(),
        alertPianoRegulation: z.number().optional(),
        alertPianoMaintenance: z.number().optional(),
        alertQuotesPending: z.number().optional(),
        alertQuotesExpiring: z.number().optional(),
        alertInvoicesPending: z.number().optional(),
        alertInvoicesOverdue: z.number().optional(),
        alertUpcomingAppointments: z.number().optional(),
        alertUnconfirmedAppointments: z.number().optional(),
        alertFrequency: z.enum(['realtime', 'daily', 'weekly']).optional(),
        pushNotifications: z.number().optional(),
        emailNotifications: z.number().optional(),
        calendarSync: z.enum(['none', 'google', 'outlook']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { partnerId, ...updates } = input;

      // Verificar permisos
      const [partnerUser] = await db
        .select()
        .from(partnerUsers)
        .where(
          and(
            eq(partnerUsers.partnerId, partnerId),
            eq(partnerUsers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!partnerUser) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a este partner" });
      }

      if (partnerUser.role !== 'owner' && partnerUser.role !== 'admin') {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para editar la configuración" });
      }

      // Actualizar settings
      await db
        .update(partnerSettings)
        .set(updates)
        .where(eq(partnerSettings.partnerId, partnerId));

      return { success: true };
    }),

  // Obtener usuarios del partner
  getUsers: protectedProcedure
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar acceso
      const [partnerUser] = await db
        .select()
        .from(partnerUsers)
        .where(
          and(
            eq(partnerUsers.partnerId, input.partnerId),
            eq(partnerUsers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!partnerUser) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a este partner" });
      }

      // Obtener usuarios
      const users = await db
        .select()
        .from(partnerUsers)
        .where(eq(partnerUsers.partnerId, input.partnerId))
        .orderBy(desc(partnerUsers.createdAt));

      return users;
    }),

  // Agregar usuario al partner
  addUser: protectedProcedure
    .input(
      z.object({
        partnerId: z.number(),
        userId: z.number(),
        role: z.enum(['owner', 'admin', 'manager']),
        canManageBranding: z.boolean().default(false),
        canManagePricing: z.boolean().default(false),
        canManageUsers: z.boolean().default(false),
        canViewAnalytics: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar permisos
      const [partnerUser] = await db
        .select()
        .from(partnerUsers)
        .where(
          and(
            eq(partnerUsers.partnerId, input.partnerId),
            eq(partnerUsers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!partnerUser) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a este partner" });
      }

      if (partnerUser.canManageUsers !== 1 && partnerUser.role !== 'owner') {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para agregar usuarios" });
      }

      // Agregar usuario
      await db.insert(partnerUsers).values({
        partnerId: input.partnerId,
        userId: input.userId,
        role: input.role,
        canManageBranding: input.canManageBranding ? 1 : 0,
        canManagePricing: input.canManagePricing ? 1 : 0,
        canManageUsers: input.canManageUsers ? 1 : 0,
        canViewAnalytics: input.canViewAnalytics ? 1 : 0,
      });

      return { success: true };
    }),

  // Eliminar usuario del partner
  removeUser: protectedProcedure
    .input(
      z.object({
        partnerId: z.number(),
        partnerUserId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar permisos
      const [partnerUser] = await db
        .select()
        .from(partnerUsers)
        .where(
          and(
            eq(partnerUsers.partnerId, input.partnerId),
            eq(partnerUsers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!partnerUser) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a este partner" });
      }

      if (partnerUser.canManageUsers !== 1 && partnerUser.role !== 'owner') {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para eliminar usuarios" });
      }

      // Verificar que no sea el owner
      const [targetUser] = await db
        .select()
        .from(partnerUsers)
        .where(eq(partnerUsers.id, input.partnerUserId))
        .limit(1);

      if (targetUser?.role === 'owner') {
        throw new TRPCError({ code: "FORBIDDEN", message: "No puedes eliminar al propietario" });
      }

      // Eliminar
      await db
        .delete(partnerUsers)
        .where(eq(partnerUsers.id, input.partnerUserId));

      return { success: true };
    }),

  // Obtener pricing del partner
  getPricing: protectedProcedure
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar acceso
      const [partnerUser] = await db
        .select()
        .from(partnerUsers)
        .where(
          and(
            eq(partnerUsers.partnerId, input.partnerId),
            eq(partnerUsers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!partnerUser) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a este partner" });
      }

      const [pricing] = await db
        .select()
        .from(partnerPricing)
        .where(eq(partnerPricing.partnerId, input.partnerId))
        .limit(1);

      return pricing || null;
    }),

  // Actualizar pricing del partner
  updatePricing: protectedProcedure
    .input(
      z.object({
        partnerId: z.number(),
        tier: z.enum(['basic', 'professional', 'premium']),
        monthlyPrice: z.string().optional(),
        yearlyPrice: z.string().optional(),
        minMonthlyRevenue: z.string().optional(),
        discountPercentage: z.number().optional(),
        customFeatures: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { partnerId, ...updates } = input;

      // Verificar permisos
      const [partnerUser] = await db
        .select()
        .from(partnerUsers)
        .where(
          and(
            eq(partnerUsers.partnerId, partnerId),
            eq(partnerUsers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!partnerUser) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a este partner" });
      }

      if (partnerUser.canManagePricing !== 1 && partnerUser.role !== 'owner') {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para editar el pricing" });
      }

      // Verificar si existe pricing
      const [existing] = await db
        .select()
        .from(partnerPricing)
        .where(eq(partnerPricing.partnerId, partnerId))
        .limit(1);

      if (existing) {
        // Actualizar
        await db
          .update(partnerPricing)
          .set(updates)
          .where(eq(partnerPricing.partnerId, partnerId));
      } else {
        // Crear
        await db.insert(partnerPricing).values({
          partnerId,
          ...updates,
        });
      }

      return { success: true };
    }),
});
