/**
 * Stripe Router Tests
 * Piano Emotion Manager
 * 
 * Tests para verificar la integración de Stripe
 */

import { describe, it, expect } from 'vitest';

describe('Stripe Router Tests', () => {
  it('debería tener el router de Stripe disponible', async () => {
    const { stripeRouter } = await import('./routers/stripe.router');
    expect(stripeRouter).toBeDefined();
  });

  it('debería tener el endpoint createCheckoutSession', async () => {
    const { stripeRouter } = await import('./routers/stripe.router');
    expect(stripeRouter._def.procedures.createCheckoutSession).toBeDefined();
  });

  it('debería tener el helper de Stripe configurado', async () => {
    const fs = await import('fs/promises');
    const stripePath = '/home/ubuntu/piano-emotion-nextjs/server/_core/stripe.ts';
    const exists = await fs.access(stripePath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('debería tener el webhook handler configurado', async () => {
    // Verificar que el archivo del webhook existe
    const fs = await import('fs/promises');
    const webhookPath = '/home/ubuntu/piano-emotion-nextjs/server/_core/stripeWebhook.ts';
    const exists = await fs.access(webhookPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('debería exportar el stripeWebhookRouter', async () => {
    const { stripeWebhookRouter } = await import('./_core/stripeWebhook');
    expect(stripeWebhookRouter).toBeDefined();
  });
});
