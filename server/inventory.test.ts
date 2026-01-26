/**
 * Inventory Router Tests
 * Piano Emotion Manager
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { inventory } from '../drizzle/schema';

describe('Inventory Router', () => {
  let testItemId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // No necesitamos crear datos de prueba aquí porque el test de createInventoryItem lo hará
  });

  it('should return inventory stats', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const stats = await caller.inventory.getStats();

    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('lowStock');
    expect(stats).toHaveProperty('categories');
    expect(typeof stats.total).toBe('number');
    expect(typeof stats.lowStock).toBe('number');
    expect(typeof stats.categories).toBe('number');
  });

  it('should return paginated inventory items', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.inventory.getInventory({
      page: 1,
      pageSize: 10,
    });

    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('pageSize', 10);
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('should filter inventory items by category', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.inventory.getInventory({
      page: 1,
      pageSize: 10,
      category: 'strings',
    });

    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
    // Todos los items deben tener category 'strings'
    result.items.forEach((item: any) => {
      if (item.category) {
        expect(item.category).toBe('strings');
      }
    });
  });

  it('should filter inventory items by low stock', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.inventory.getInventory({
      page: 1,
      pageSize: 10,
      lowStock: true,
    });

    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
    // Todos los items deben tener quantity <= minStock
    result.items.forEach((item: any) => {
      if (item.quantity !== undefined && item.minStock !== undefined) {
        expect(parseFloat(item.quantity)).toBeLessThanOrEqual(parseFloat(item.minStock));
      }
    });
  });

  it('should filter inventory items by search term', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.inventory.getInventory({
      page: 1,
      pageSize: 10,
      search: 'test',
    });

    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('should get low stock items', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const items = await caller.inventory.getLowStockItems();

    expect(Array.isArray(items)).toBe(true);
    // Todos los items deben tener quantity <= minStock
    items.forEach((item: any) => {
      if (item.quantity !== undefined && item.minStock !== undefined) {
        expect(parseFloat(item.quantity)).toBeLessThanOrEqual(parseFloat(item.minStock));
      }
    });
  });

  it('should create a new inventory item', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.inventory.createInventoryItem({
      name: 'Test String Set',
      category: 'strings',
      description: 'Test string set for piano',
      quantity: 5,
      unit: 'set',
      minStock: 10,
      costPerUnit: 25.50,
      supplier: 'Test Supplier',
    });

    expect(result.success).toBe(true);
    expect(result.itemId).toBeGreaterThanOrEqual(0);
    testItemId = result.itemId;
  });

  it('should get inventory item by id', async () => {
    if (testItemId > 0) {
      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const item = await caller.inventory.getInventoryById({ id: testItemId });

      expect(item).not.toBeNull();
      if (item) {
        expect(item.id).toBe(testItemId);
        expect(item.name).toBe('Test String Set');
        expect(item.category).toBe('strings');
      }
    }
  });

  it('should update an inventory item', async () => {
    if (testItemId > 0) {
      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const result = await caller.inventory.updateInventoryItem({
        id: testItemId,
        quantity: 15,
        supplier: 'Updated Supplier',
      });

      expect(result.success).toBe(true);
    }
  });

  it('should delete an inventory item', async () => {
    if (testItemId > 0) {
      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const result = await caller.inventory.deleteInventoryItem({ id: testItemId });

      expect(result.success).toBe(true);
    }
  });
});
