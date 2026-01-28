import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { userLicenses } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export const licenseRenewalRouter = router({
  // Crear sesión de Stripe para renovar licencia
  createRenewalSession: protectedProcedure
    .input(
      z.object({
        licenseId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener la licencia
      const [license] = await db
        .select()
        .from(userLicenses)
        .where(eq(userLicenses.id, input.licenseId))
        .limit(1);

      if (!license) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Licencia no encontrada" });
      }

      // Verificar que la licencia pertenece al usuario
      if (license.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permiso para renovar esta licencia" });
      }

      // Calcular precio de renovación (mismo precio que la licencia actual)
      const priceInCents = Math.round(parseFloat(license.price) * 100);

      // Crear sesión de Stripe Checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: license.currency.toLowerCase(),
              product_data: {
                name: `Renovación de Licencia Piano Emotion Manager`,
                description: `Renovación ${license.billingCycle === 'monthly' ? 'mensual' : 'anual'} - Licencia #${license.id}`,
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${ctx.req.headers.origin}/licenses/renewal-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/licenses/notifications`,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          license_id: license.id.toString(),
          renewal_type: license.billingCycle,
          customer_email: ctx.user.email,
          customer_name: ctx.user.name || '',
        },
        customer_email: ctx.user.email,
        allow_promotion_codes: true,
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  // Confirmar renovación después del pago exitoso
  confirmRenewal: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar la sesión de Stripe
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      if (session.payment_status !== 'paid') {
        throw new TRPCError({ code: "BAD_REQUEST", message: "El pago no ha sido completado" });
      }

      const licenseId = parseInt(session.metadata?.license_id || '0');
      if (!licenseId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "ID de licencia no encontrado en la sesión" });
      }

      // Obtener la licencia
      const [license] = await db
        .select()
        .from(userLicenses)
        .where(eq(userLicenses.id, licenseId))
        .limit(1);

      if (!license) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Licencia no encontrada" });
      }

      // Calcular nueva fecha de expiración
      const currentExpiration = license.expiresAt ? new Date(license.expiresAt) : new Date();
      const newExpiration = new Date(currentExpiration);
      
      if (license.billingCycle === 'monthly') {
        newExpiration.setMonth(newExpiration.getMonth() + 1);
      } else {
        newExpiration.setFullYear(newExpiration.getFullYear() + 1);
      }

      // Actualizar la licencia
      await db
        .update(userLicenses)
        .set({
          expiresAt: newExpiration.toISOString(),
          status: 'active',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userLicenses.id, licenseId));

      return {
        success: true,
        newExpirationDate: newExpiration.toISOString(),
        message: "Licencia renovada exitosamente",
      };
    }),
});
