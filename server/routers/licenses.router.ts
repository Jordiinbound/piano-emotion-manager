import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { userLicenses, userLicenseTransactions, partnersV2, partnerActivationCodes } from "../../drizzle/schema.js";
import { eq, and, desc, count, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const licensesRouter = router({
  // Obtener licencia del usuario actual
  getMy: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [license] = await db
      .select()
      .from(userLicenses)
      .where(
        and(
          eq(userLicenses.userId, ctx.user.id),
          eq(userLicenses.status, 'active')
        )
      )
      .limit(1);

    return license || null;
  }),

  // Listar todas las licencias (admin)
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        status: z.enum(['active', 'expired', 'suspended', 'cancelled']).optional(),
        licenseType: z.enum(['direct', 'partner']).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // TODO: Verificar que el usuario sea admin

      const offset = (input.page - 1) * input.limit;

      let query = db.select().from(userLicenses);

      if (input.status) {
        query = query.where(eq(userLicenses.status, input.status)) as any;
      }

      if (input.licenseType) {
        query = query.where(eq(userLicenses.licenseType, input.licenseType)) as any;
      }

      const licenses = await query
        .orderBy(desc(userLicenses.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: count() })
        .from(userLicenses);

      return {
        licenses,
        total: totalResult.count,
        page: input.page,
        limit: input.limit,
      };
    }),

  // Crear licencia directa
  createDirect: protectedProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        organizationId: z.number().optional(),
        billingCycle: z.enum(['monthly', 'yearly']),
        price: z.number(),
        currency: z.string().default('EUR'),
        durationMonths: z.number().default(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // TODO: Verificar que el usuario sea admin

      if (!input.userId && !input.organizationId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debe especificar userId o organizationId" });
      }

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + input.durationMonths);

      const [result] = await db.insert(userLicenses).values({
        userId: input.userId,
        organizationId: input.organizationId,
        licenseType: 'direct',
        status: 'active',
        billingCycle: input.billingCycle,
        price: input.price.toString(),
        currency: input.currency,
        expiresAt,
        storeUrl: 'https://pianoemotion.com/store',
      });

      // Crear transacción
      await db.insert(userLicenseTransactions).values({
        licenseId: result.insertId,
        transactionType: 'purchase',
        amount: input.price.toString(),
        currency: input.currency,
        paymentMethod: 'stripe',
        paymentStatus: 'completed',
      });

      return { id: result.insertId, success: true };
    }),

  // Activar licencia con código de partner
  activateWithCode: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        userId: z.number().optional(),
        organizationId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const userId = input.userId || ctx.user.id;

      // Buscar código de activación
      const [activationCode] = await db
        .select()
        .from(partnerActivationCodes)
        .where(
          and(
            eq(partnerActivationCodes.code, input.code),
            eq(partnerActivationCodes.status, 'active')
          )
        )
        .limit(1);

      if (!activationCode) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Código de activación no válido" });
      }

      // Verificar si el código ya fue usado (single_use)
      if (activationCode.codeType === 'single_use' && activationCode.usesCount > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este código ya fue utilizado" });
      }

      // Verificar si el código multi_use alcanzó el máximo
      if (activationCode.codeType === 'multi_use' && activationCode.maxUses) {
        if (activationCode.usesCount >= activationCode.maxUses) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Este código alcanzó el máximo de usos" });
        }
      }

      // Verificar si el código expiró
      if (activationCode.expiresAt && new Date() > new Date(activationCode.expiresAt)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este código ha expirado" });
      }

      // Obtener información del partner
      const [partner] = await db
        .select()
        .from(partnersV2)
        .where(eq(partnersV2.id, activationCode.partnerId))
        .limit(1);

      if (!partner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Partner no encontrado" });
      }

      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + activationCode.durationMonths);

      // Crear licencia
      const [result] = await db.insert(userLicenses).values({
        userId: input.organizationId ? undefined : userId,
        organizationId: input.organizationId,
        licenseType: 'partner',
        partnerId: activationCode.partnerId,
        activationCodeId: activationCode.id,
        status: 'active',
        billingCycle: activationCode.billingCycle,
        price: '0',
        currency: 'EUR',
        expiresAt,
        storeUrl: partner.ecommerceUrl || undefined,
        storePartnerId: activationCode.partnerId,
      });

      // Actualizar contador de usos del código
      await db
        .update(partnerActivationCodes)
        .set({
          usesCount: activationCode.usesCount + 1,
          status: activationCode.codeType === 'single_use' ? 'used' : 'active',
        })
        .where(eq(partnerActivationCodes.id, activationCode.id));

      // Actualizar contador de licencias del partner
      await db
        .update(partnersV2)
        .set({
          licensesAssigned: partner.licensesAssigned + 1,
          licensesAvailable: partner.licensesAvailable - 1,
        })
        .where(eq(partnersV2.id, activationCode.partnerId));

      return { id: result.insertId, success: true };
    }),

  // Renovar licencia
  renew: protectedProcedure
    .input(
      z.object({
        licenseId: z.number(),
        durationMonths: z.number().default(1),
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

      // Verificar permisos
      if (license.userId !== ctx.user.id) {
        // TODO: Verificar si es admin o miembro de la organización
      }

      const newExpiresAt = new Date(license.expiresAt || new Date());
      newExpiresAt.setMonth(newExpiresAt.getMonth() + input.durationMonths);

      await db
        .update(userLicenses)
        .set({
          expiresAt: newExpiresAt,
          status: 'active',
        })
        .where(eq(userLicenses.id, input.licenseId));

      // Crear transacción
      await db.insert(userLicenseTransactions).values({
        licenseId: input.licenseId,
        transactionType: 'renewal',
        amount: license.price,
        currency: license.currency,
        paymentMethod: 'stripe',
        paymentStatus: 'completed',
      });

      return { success: true };
    }),

  // Cancelar licencia
  cancel: protectedProcedure
    .input(z.object({ licenseId: z.number() }))
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

      // Verificar permisos
      if (license.userId !== ctx.user.id) {
        // TODO: Verificar si es admin o miembro de la organización
      }

      await db
        .update(userLicenses)
        .set({ status: 'cancelled' })
        .where(eq(userLicenses.id, input.licenseId));

      // Crear transacción
      await db.insert(userLicenseTransactions).values({
        licenseId: input.licenseId,
        transactionType: 'cancellation',
        amount: '0',
        currency: license.currency,
        paymentMethod: 'stripe',
        paymentStatus: 'completed',
      });

      return { success: true };
    }),

  // Obtener historial de transacciones de una licencia
  getTransactions: protectedProcedure
    .input(z.object({ licenseId: z.number() }))
    .query(async ({ input, ctx }) => {
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

      // Verificar permisos
      if (license.userId !== ctx.user.id) {
        // TODO: Verificar si es admin o miembro de la organización
      }

      const transactions = await db
        .select()
        .from(userLicenseTransactions)
        .where(eq(userLicenseTransactions.licenseId, input.licenseId))
        .orderBy(desc(userLicenseTransactions.createdAt));

      return transactions;
    }),

  // Obtener licencias del partner actual
  getPartnerLicenses: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Buscar si el usuario actual es un partner
      const [partner] = await db
        .select()
        .from(partnersV2)
        .where(eq(partnersV2.contactEmail, ctx.user.email))
        .limit(1);

      if (!partner) {
        return [];
      }

      // Obtener todas las licencias activadas con códigos de este partner
      const licenses = await db
        .select()
        .from(userLicenses)
        .where(eq(userLicenses.partnerId, partner.id))
        .orderBy(desc(userLicenses.createdAt));

      return licenses;
    }),
});
