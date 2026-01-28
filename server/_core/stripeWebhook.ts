import { Router } from "express";
import { getStripe } from "./stripe.js";
import { ENV } from "./env.js";
import { getDb } from "../db.js";
import { invoices, userLicenses } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const stripeWebhookRouter = Router();

stripeWebhookRouter.post("/api/stripe/webhook", async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] No signature provided");
    return res.status(400).send("No signature");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Detectar eventos de test y devolver respuesta de verificación
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  // Procesar eventos de pago completado
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    console.log("[Stripe Webhook] Processing checkout.session.completed");
    console.log("[Stripe Webhook] Session metadata:", session.metadata);

    const invoiceId = session.metadata?.invoice_id;
    const licenseId = session.metadata?.license_id;
    const paymentIntentId = session.payment_intent;

    // Procesar renovación de licencia
    if (licenseId) {
      console.log(`[Stripe Webhook] Processing license renewal for license_id: ${licenseId}`);
      
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Obtener la licencia
        const [license] = await db
          .select()
          .from(userLicenses)
          .where(eq(userLicenses.id, parseInt(licenseId)))
          .limit(1);

        if (!license) {
          console.error(`[Stripe Webhook] License ${licenseId} not found`);
          return res.status(404).send("License not found");
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
          .where(eq(userLicenses.id, parseInt(licenseId)));

        console.log(`[Stripe Webhook] License ${licenseId} renewed until ${newExpiration.toISOString()}`);
        return res.json({ received: true, renewed: true });
      } catch (error: any) {
        console.error("[Stripe Webhook] Error renewing license:", error.message);
        return res.status(500).send("Error renewing license");
      }
    }

    // Procesar pago de factura
    if (!invoiceId) {
      console.error("[Stripe Webhook] No invoice_id or license_id in metadata");
      return res.status(400).send("No invoice_id or license_id in metadata");
    }

    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Actualizar la factura a estado 'paid' y guardar el payment_intent_id
      await db
        .update(invoices)
        .set({
          status: "paid",
          stripePaymentIntentId: paymentIntentId as string,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, parseInt(invoiceId)));

      console.log(`[Stripe Webhook] Invoice ${invoiceId} marked as paid`);
    } catch (error: any) {
      console.error("[Stripe Webhook] Error updating invoice:", error.message);
      return res.status(500).send("Error updating invoice");
    }
  }

  // Responder a Stripe que el webhook fue recibido correctamente
  res.json({ received: true });
});
