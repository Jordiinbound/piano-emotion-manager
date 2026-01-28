import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { partnerActivationCodes, partnersV2 } from "../../drizzle/schema.js";
import { eq, and, desc, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Función para generar código aleatorio
function generateCode(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix.toUpperCase() + '-';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const activationCodesRouter = router({
  // Listar códigos de un partner
  listByPartner: protectedProcedure
    .input(
      z.object({
        partnerId: z.number(),
        page: z.number().default(1),
        limit: z.number().default(20),
        status: z.enum(['active', 'used', 'expired', 'revoked']).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // TODO: Verificar permisos (admin o partner owner)

      const offset = (input.page - 1) * input.limit;

      let query = db
        .select()
        .from(partnerActivationCodes)
        .where(eq(partnerActivationCodes.partnerId, input.partnerId));

      if (input.status) {
        query = query.where(
          and(
            eq(partnerActivationCodes.partnerId, input.partnerId),
            eq(partnerActivationCodes.status, input.status)
          )
        ) as any;
      }

      const codes = await query
        .orderBy(desc(partnerActivationCodes.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: count() })
        .from(partnerActivationCodes)
        .where(eq(partnerActivationCodes.partnerId, input.partnerId));

      return {
        codes,
        total: totalResult.count,
        page: input.page,
        limit: input.limit,
      };
    }),

  // Generar códigos de activación
  generate: protectedProcedure
    .input(
      z.object({
        partnerId: z.number(),
        quantity: z.number().min(1).max(100),
        codeType: z.enum(['single_use', 'multi_use']),
        maxUses: z.number().optional(),
        billingCycle: z.enum(['monthly', 'yearly']),
        durationMonths: z.number().default(12),
        expiresAt: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // TODO: Verificar permisos (admin)

      // Verificar que el partner existe
      const [partner] = await db
        .select()
        .from(partnersV2)
        .where(eq(partnersV2.id, input.partnerId))
        .limit(1);

      if (!partner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Partner no encontrado" });
      }

      // Verificar que el partner tiene licencias disponibles
      if (partner.licensesAvailable < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `El partner solo tiene ${partner.licensesAvailable} licencias disponibles`,
        });
      }

      // Generar códigos
      const codes = [];
      const prefix = partner.slug.substring(0, 4);

      for (let i = 0; i < input.quantity; i++) {
        let code = generateCode(prefix);
        
        // Verificar que el código no exista
        let attempts = 0;
        while (attempts < 10) {
          const [existing] = await db
            .select()
            .from(partnerActivationCodes)
            .where(eq(partnerActivationCodes.code, code))
            .limit(1);

          if (!existing) break;
          code = generateCode(prefix);
          attempts++;
        }

        const [result] = await db.insert(partnerActivationCodes).values({
          partnerId: input.partnerId,
          code,
          codeType: input.codeType,
          maxUses: input.maxUses,
          billingCycle: input.billingCycle,
          durationMonths: input.durationMonths,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        });

        codes.push({ id: result.insertId, code });
      }

      return { codes, success: true };
    }),

  // Revocar código
  revoke: protectedProcedure
    .input(z.object({ codeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // TODO: Verificar permisos (admin)

      await db
        .update(partnerActivationCodes)
        .set({ status: 'revoked' })
        .where(eq(partnerActivationCodes.id, input.codeId));

      return { success: true };
    }),

  // Verificar código
  verify: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [code] = await db
        .select()
        .from(partnerActivationCodes)
        .where(eq(partnerActivationCodes.code, input.code))
        .limit(1);

      if (!code) {
        return { valid: false, message: "Código no encontrado" };
      }

      if (code.status !== 'active') {
        return { valid: false, message: `Código ${code.status}` };
      }

      if (code.codeType === 'single_use' && code.usesCount > 0) {
        return { valid: false, message: "Código ya utilizado" };
      }

      if (code.codeType === 'multi_use' && code.maxUses && code.usesCount >= code.maxUses) {
        return { valid: false, message: "Código alcanzó el máximo de usos" };
      }

      if (code.expiresAt && new Date() > new Date(code.expiresAt)) {
        return { valid: false, message: "Código expirado" };
      }

      // Obtener información del partner
      const [partner] = await db
        .select()
        .from(partnersV2)
        .where(eq(partnersV2.id, code.partnerId))
        .limit(1);

      return {
        valid: true,
        code,
        partner,
      };
    }),

  // Obtener estadísticas de códigos de un partner
  getStats: protectedProcedure
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [totalResult] = await db
        .select({ count: count() })
        .from(partnerActivationCodes)
        .where(eq(partnerActivationCodes.partnerId, input.partnerId));

      const [activeResult] = await db
        .select({ count: count() })
        .from(partnerActivationCodes)
        .where(
          and(
            eq(partnerActivationCodes.partnerId, input.partnerId),
            eq(partnerActivationCodes.status, 'active')
          )
        );

      const [usedResult] = await db
        .select({ count: count() })
        .from(partnerActivationCodes)
        .where(
          and(
            eq(partnerActivationCodes.partnerId, input.partnerId),
            eq(partnerActivationCodes.status, 'used')
          )
        );

      return {
        total: totalResult.count,
        active: activeResult.count,
        used: usedResult.count,
      };
    }),

  // Obtener códigos del partner actual
  getMyPartnerCodes: protectedProcedure
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

      // Obtener todos los códigos del partner
      const codes = await db
        .select()
        .from(partnerActivationCodes)
        .where(eq(partnerActivationCodes.partnerId, partner.id))
        .orderBy(desc(partnerActivationCodes.createdAt));

      return codes;
    }),
});
