import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc.js";
import { getStripe } from "../_core/stripe.js";
import { getDb } from "../db.js";
import { invoices } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const stripeRouter = router({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        invoiceId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Obtener la factura
      const invoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, input.invoiceId))
        .limit(1);

      if (!invoice || invoice.length === 0) {
        throw new Error("Invoice not found");
      }

      const invoiceData = invoice[0];

      // Verificar que la factura esté en estado 'sent' (enviada)
      if (invoiceData.status !== "sent") {
        throw new Error("Invoice must be in 'sent' status to be paid");
      }

      const stripe = getStripe();

      // Crear sesión de Checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Factura ${invoiceData.invoiceNumber}`,
                description: `Pago de factura para ${invoiceData.clientName}`,
              },
              unit_amount: Math.round(Number(invoiceData.total) * 100), // Convertir a centavos
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${ctx.req.headers.origin}/facturacion?payment=success&invoice_id=${invoiceData.id}`,
        cancel_url: `${ctx.req.headers.origin}/facturacion?payment=cancelled`,
        customer_email: invoiceData.clientEmail || undefined,
        client_reference_id: invoiceData.id.toString(),
        metadata: {
          invoice_id: invoiceData.id.toString(),
          invoice_number: invoiceData.invoiceNumber,
          client_name: invoiceData.clientName,
          user_id: ctx.user.id.toString(),
        },
        allow_promotion_codes: true,
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  // Crear sesión de pago pública (sin autenticación)
  createCheckoutSessionPublic: publicProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        token: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Obtener la factura y verificar el token
      const invoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, input.invoiceId))
        .limit(1);

      if (!invoice || invoice.length === 0) {
        throw new Error("Invoice not found");
      }

      const invoiceData = invoice[0];

      // Verificar que el token coincida
      if (invoiceData.paymentToken !== input.token) {
        throw new Error("Invalid payment token");
      }

      // Verificar que la factura esté en estado 'sent' (enviada)
      if (invoiceData.status !== "sent") {
        throw new Error("Invoice must be in 'sent' status to be paid");
      }

      const stripe = getStripe();

      // Crear sesión de Checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Factura ${invoiceData.invoiceNumber}`,
                description: `Pago de factura para ${invoiceData.clientName}`,
              },
              unit_amount: Math.round(Number(invoiceData.total) * 100), // Convertir a centavos
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${ctx.req.headers.origin}/pay/${input.token}?payment=success`,
        cancel_url: `${ctx.req.headers.origin}/pay/${input.token}?payment=cancelled`,
        customer_email: invoiceData.clientEmail || undefined,
        client_reference_id: invoiceData.id.toString(),
        metadata: {
          invoice_id: invoiceData.id.toString(),
          invoice_number: invoiceData.invoiceNumber,
          client_name: invoiceData.clientName,
        },
        allow_promotion_codes: true,
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),
});
