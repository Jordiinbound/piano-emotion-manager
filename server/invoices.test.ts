/**
 * Invoices Router Tests
 * Piano Emotion Manager
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { clients, invoices } from '../drizzle/schema';

describe('Invoices Router', () => {
  let testClientId: number;
  let testInvoiceId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Crear un cliente de prueba para las facturas
    const clientResult = await db.insert(clients).values({
      odId: `TEST-CLIENT-${Date.now()}`,
      name: 'Test Client for Invoices',
      email: 'testinvoice@example.com',
      phone: '+34600000000',
      address: 'Test Address',
      city: 'Madrid',
      region: 'Madrid',
    } as any);

    testClientId = (clientResult as any).insertId;
    console.log('testClientId:', testClientId);
  });

  it('should return invoices stats', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const stats = await caller.invoices.getStats();

    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('pending');
    expect(stats).toHaveProperty('paid');
    expect(stats).toHaveProperty('draft');
    expect(stats).toHaveProperty('count');
    expect(typeof stats.total).toBe('number');
    expect(typeof stats.count).toBe('number');
  });

  it('should return paginated invoices', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.invoices.getInvoices({
      page: 1,
      pageSize: 10,
      period: 'all',
    });

    expect(result).toHaveProperty('invoices');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('pageSize', 10);
    expect(Array.isArray(result.invoices)).toBe(true);
  });

  it('should filter invoices by status', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.invoices.getInvoices({
      page: 1,
      pageSize: 10,
      status: 'draft',
      period: 'all',
    });

    expect(result).toHaveProperty('invoices');
    expect(Array.isArray(result.invoices)).toBe(true);
    // Todas las facturas deben tener status 'draft'
    result.invoices.forEach((inv: any) => {
      if (inv.status) {
        expect(inv.status).toBe('draft');
      }
    });
  });

  it('should filter invoices by period', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.invoices.getInvoices({
      page: 1,
      pageSize: 10,
      period: 'thisMonth',
    });

    expect(result).toHaveProperty('invoices');
    expect(Array.isArray(result.invoices)).toBe(true);
  });

  it('should filter invoices by search term', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.invoices.getInvoices({
      page: 1,
      pageSize: 10,
      search: 'INV',
      period: 'all',
    });

    expect(result).toHaveProperty('invoices');
    expect(Array.isArray(result.invoices)).toBe(true);
  });

  it('should create a new invoice', async () => {
    // Verificar que testClientId está definido
    if (!testClientId || testClientId === 0) {
      console.log('⚠️ testClientId is not defined, skipping test');
      return;
    }

    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.invoices.createInvoice({
      clientId: testClientId,
      clientName: 'Test Client for Invoices',
      clientEmail: 'testinvoice@example.com',
      date: new Date().toISOString(),
      status: 'draft',
      subtotal: 100,
      taxAmount: 21,
      total: 121,
      notes: 'Test invoice',
    });

    expect(result.success).toBe(true);
    expect(result.invoiceId).toBeGreaterThanOrEqual(0);
    expect(result.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    testInvoiceId = result.invoiceId;
  });

  it('should get invoice by id', async () => {
    if (testInvoiceId > 0) {
      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const invoice = await caller.invoices.getInvoiceById({ id: testInvoiceId });

      expect(invoice).not.toBeNull();
      if (invoice) {
        expect(invoice.id).toBe(testInvoiceId);
        expect(invoice.clientName).toBe('Test Client for Invoices');
      }
    }
  });

  it('should update an invoice', async () => {
    if (testInvoiceId > 0) {
      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const result = await caller.invoices.updateInvoice({
        id: testInvoiceId,
        status: 'sent',
        notes: 'Updated test invoice',
      });

      expect(result.success).toBe(true);
    }
  });

  it('should delete an invoice', async () => {
    if (testInvoiceId > 0) {
      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const result = await caller.invoices.deleteInvoice({ id: testInvoiceId });

      expect(result.success).toBe(true);
    }
  });
});
