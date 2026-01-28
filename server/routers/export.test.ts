/**
 * Export Router Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers';

describe('Export Router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    // Create a mock context with a test user
    const mockContext = {
      req: {} as any,
      res: {} as any,
      user: {
        id: 'test-user-export',
        email: 'test-export@example.com',
        name: 'Test Export User',
        role: 'user' as const,
      },
    };

    caller = appRouter.createCaller(mockContext);
  });

  describe('exportClients', () => {
    it('should export clients to Excel format', async () => {
      const result = await caller.export.exportClients({
        format: 'excel',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filename).toContain('clientes_');
      expect(result.filename).toContain('.xlsx');
      expect(result.base64).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
    });

    it('should export clients to PDF format', async () => {
      const result = await caller.export.exportClients({
        format: 'pdf',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filename).toContain('clientes_');
      expect(result.filename).toContain('.pdf');
      expect(result.base64).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('exportServices', () => {
    it('should export services to Excel format', async () => {
      const result = await caller.export.exportServices({
        format: 'excel',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filename).toContain('servicios_');
      expect(result.filename).toContain('.xlsx');
      expect(result.base64).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
    });

    it('should export services to PDF format', async () => {
      const result = await caller.export.exportServices({
        format: 'pdf',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filename).toContain('servicios_');
      expect(result.filename).toContain('.pdf');
      expect(result.base64).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('exportInvoices', () => {
    it('should export invoices to Excel format', async () => {
      const result = await caller.export.exportInvoices({
        format: 'excel',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filename).toContain('facturas_');
      expect(result.filename).toContain('.xlsx');
      expect(result.base64).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
    });

    it('should export invoices to PDF format', async () => {
      const result = await caller.export.exportInvoices({
        format: 'pdf',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filename).toContain('facturas_');
      expect(result.filename).toContain('.pdf');
      expect(result.base64).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('exportInventory', () => {
    it('should export inventory to Excel format', async () => {
      const result = await caller.export.exportInventory({
        format: 'excel',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filename).toContain('inventario_');
      expect(result.filename).toContain('.xlsx');
      expect(result.base64).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
    });

    it('should export inventory to PDF format', async () => {
      const result = await caller.export.exportInventory({
        format: 'pdf',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filename).toContain('inventario_');
      expect(result.filename).toContain('.pdf');
      expect(result.base64).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('exportPianos', () => {
    it('should export pianos to Excel format', async () => {
      const result = await caller.export.exportPianos({
        format: 'excel',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filename).toContain('pianos_');
      expect(result.filename).toContain('.xlsx');
      expect(result.base64).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
    });

    it('should export pianos to PDF format', async () => {
      const result = await caller.export.exportPianos({
        format: 'pdf',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filename).toContain('pianos_');
      expect(result.filename).toContain('.pdf');
      expect(result.base64).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
    });
  });
});
