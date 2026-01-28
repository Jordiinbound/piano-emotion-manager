import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { partnersV2, partnerActivationCodes, userLicenses } from "../../drizzle/schema.js";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const partnersV2Router = router({
  // Listar todos los partners (solo admin)
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // TODO: Verificar que el usuario sea admin
      // if (ctx.user.role !== 'admin') {
      //   throw new TRPCError({ code: "FORBIDDEN", message: "Solo administradores pueden ver partners" });
      // }

      const offset = (input.page - 1) * input.limit;

      const partners = await db
        .select()
        .from(partnersV2)
        .orderBy(desc(partnersV2.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: count() })
        .from(partnersV2);

      return {
        partners,
        total: totalResult.count,
        page: input.page,
        limit: input.limit,
      };
    }),

  // Obtener partner por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [partner] = await db
        .select()
        .from(partnersV2)
        .where(eq(partnersV2.id, input.id))
        .limit(1);

      if (!partner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Partner no encontrado" });
      }

      return partner;
    }),

  // Crear partner
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        email: z.string().email(),
        partnerType: z.enum(['manufacturer', 'distributor']),
        logo: z.string().optional(),
        primaryColor: z.string().default('#3b82f6'),
        secondaryColor: z.string().default('#10b981'),
        brandName: z.string().optional(),
        ecommerceUrl: z.string().url().optional(),
        ecommerceApiKey: z.string().optional(),
        ecommerceType: z.enum(['woocommerce', 'shopify', 'custom']).optional(),
        legalName: z.string().optional(),
        taxId: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().default('ES'),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // TODO: Verificar que el usuario sea admin
      // if (ctx.user.role !== 'admin') {
      //   throw new TRPCError({ code: "FORBIDDEN", message: "Solo administradores pueden crear partners" });
      // }

      // Verificar que el slug no exista
      const [existing] = await db
        .select()
        .from(partnersV2)
        .where(eq(partnersV2.slug, input.slug))
        .limit(1);

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "El slug ya está en uso" });
      }

      const [result] = await db.insert(partnersV2).values(input);

      return { id: result.insertId, ...input };
    }),

  // Actualizar partner
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        partnerType: z.enum(['manufacturer', 'distributor']).optional(),
        logo: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        brandName: z.string().optional(),
        ecommerceUrl: z.string().url().optional(),
        ecommerceApiKey: z.string().optional(),
        ecommerceType: z.enum(['woocommerce', 'shopify', 'custom']).optional(),
        legalName: z.string().optional(),
        taxId: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        status: z.enum(['active', 'suspended', 'inactive']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // TODO: Verificar que el usuario sea admin
      // if (ctx.user.role !== 'admin') {
      //   throw new TRPCError({ code: "FORBIDDEN", message: "Solo administradores pueden actualizar partners" });
      // }

      const { id, ...updates } = input;

      await db
        .update(partnersV2)
        .set(updates)
        .where(eq(partnersV2.id, id));

      return { success: true };
    }),

  // Agregar licencias a un partner
  addLicenses: protectedProcedure
    .input(
      z.object({
        partnerId: z.number(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // TODO: Verificar que el usuario sea admin
      // if (ctx.user.role !== 'admin') {
      //   throw new TRPCError({ code: "FORBIDDEN", message: "Solo administradores pueden agregar licencias" });
      // }

      const [partner] = await db
        .select()
        .from(partnersV2)
        .where(eq(partnersV2.id, input.partnerId))
        .limit(1);

      if (!partner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Partner no encontrado" });
      }

      await db
        .update(partnersV2)
        .set({
          totalLicensesPurchased: partner.totalLicensesPurchased + input.quantity,
          licensesAvailable: partner.licensesAvailable + input.quantity,
        })
        .where(eq(partnersV2.id, input.partnerId));

      return { success: true };
    }),

  // Obtener estadísticas de un partner
  getStats: protectedProcedure
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [partner] = await db
        .select()
        .from(partnersV2)
        .where(eq(partnersV2.id, input.partnerId))
        .limit(1);

      if (!partner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Partner no encontrado" });
      }

      // Contar códigos de activación
      const [codesResult] = await db
        .select({ count: count() })
        .from(partnerActivationCodes)
        .where(eq(partnerActivationCodes.partnerId, input.partnerId));

      // Contar licencias activas
      const [activeLicensesResult] = await db
        .select({ count: count() })
        .from(userLicenses)
        .where(
          and(
            eq(userLicenses.partnerId, input.partnerId),
            eq(userLicenses.status, 'active')
          )
        );

      return {
        totalLicensesPurchased: partner.totalLicensesPurchased,
        licensesAvailable: partner.licensesAvailable,
        licensesAssigned: partner.licensesAssigned,
        activationCodesGenerated: codesResult.count,
        activeLicenses: activeLicensesResult.count,
      };
    }),
});
