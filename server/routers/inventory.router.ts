/**
 * Inventory Router - tRPC
 * Piano Emotion Manager
 * 
 * Endpoints para gestión de inventario/materials
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { inventory } from '../../drizzle/schema';
import { eq, sql, lte } from 'drizzle-orm';

export const inventoryRouter = router({
  // Obtener estadísticas de inventario
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Contar total de items
    const totalResult = await db.execute(sql`SELECT COUNT(*) as count FROM inventory`);
    const total = (totalResult as any)[0]?.[0]?.count || 0;

    // Contar items con stock bajo (quantity <= minStock)
    const lowStockResult = await db.execute(sql`SELECT COUNT(*) as count FROM inventory WHERE quantity <= minStock`);
    const lowStock = (lowStockResult as any)[0]?.[0]?.count || 0;

    // Contar categorías únicas
    const categoriesResult = await db.execute(sql`SELECT COUNT(DISTINCT category) as count FROM inventory`);
    const categories = (categoriesResult as any)[0]?.[0]?.count || 0;

    return {
      total,
      lowStock,
      categories,
    };
  }),

  // Obtener lista de inventory items con paginación y filtros
  getInventory: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(50),
        search: z.string().optional(),
        category: z.enum(['strings','hammers','dampers','keys','action_parts','pedals','tuning_pins','felts','tools','chemicals','other']).optional(),
        lowStock: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { page, pageSize, search, category, lowStock } = input;
      const offset = (page - 1) * pageSize;

      // Construir query base
      let baseQuery = `
        SELECT 
          id, odId, name, category, description, quantity, unit, 
          minStock, costPerUnit, supplier, createdAt, updatedAt
        FROM inventory
        WHERE 1=1
      `;

      if (search) {
        baseQuery += ` AND (name LIKE '%${search}%' OR description LIKE '%${search}%' OR supplier LIKE '%${search}%')`;
      }

      if (category) {
        baseQuery += ` AND category = '${category}'`;
      }

      if (lowStock) {
        baseQuery += ` AND quantity <= minStock`;
      }

      baseQuery += ` ORDER BY name ASC LIMIT ${pageSize} OFFSET ${offset}`;

      const result = await db.execute(sql.raw(baseQuery));
      const items = (result as any)[0] || [];

      // Contar total
      let countQuery = `SELECT COUNT(*) as count FROM inventory WHERE 1=1`;

      if (search) {
        countQuery += ` AND (name LIKE '%${search}%' OR description LIKE '%${search}%' OR supplier LIKE '%${search}%')`;
      }

      if (category) {
        countQuery += ` AND category = '${category}'`;
      }

      if (lowStock) {
        countQuery += ` AND quantity <= minStock`;
      }

      const countResult = await db.execute(sql.raw(countQuery));
      const total = (countResult as any)[0]?.[0]?.count || 0;

      return {
        items,
        total,
        page,
        pageSize,
      };
    }),

  // Obtener inventory item por ID
  getInventoryById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const query = `
        SELECT 
          id, odId, name, category, description, quantity, unit, 
          minStock, costPerUnit, supplier, createdAt, updatedAt
        FROM inventory
        WHERE id = ${input.id}
      `;

      const result = await db.execute(sql.raw(query));
      const item = (result as any)[0]?.[0] || null;

      return item;
    }),

  // Obtener items con stock bajo
  getLowStockItems: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const query = `
      SELECT 
        id, odId, name, category, description, quantity, unit, 
        minStock, costPerUnit, supplier, createdAt, updatedAt
      FROM inventory
      WHERE quantity <= minStock
      ORDER BY quantity ASC, name ASC
    `;

    const result = await db.execute(sql.raw(query));
    const items = (result as any)[0] || [];

    return items;
  }),

  // Crear nuevo inventory item
  createInventoryItem: publicProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.enum(['strings','hammers','dampers','keys','action_parts','pedals','tuning_pins','felts','tools','chemicals','other']),
        description: z.string().optional(),
        quantity: z.number().default(0),
        unit: z.string().default('unidad'),
        minStock: z.number().default(0),
        costPerUnit: z.number().optional(),
        supplier: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const odId = `INV-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const result = await db.insert(inventory).values({ 
        ...input, 
        odId 
      } as any);

      return {
        success: true,
        itemId: (result as any).insertId || 0,
      };
    }),

  // Actualizar inventory item
  updateInventoryItem: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.enum(['strings','hammers','dampers','keys','action_parts','pedals','tuning_pins','felts','tools','chemicals','other']).optional(),
        description: z.string().optional(),
        quantity: z.number().optional(),
        unit: z.string().optional(),
        minStock: z.number().optional(),
        costPerUnit: z.number().optional(),
        supplier: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updateData } = input;
      const result = await db.update(inventory).set(updateData as any).where(eq(inventory.id, id));

      return {
        success: true,
        updated: (result as any).rowsAffected || 0,
      };
    }),

  // Eliminar inventory item
  deleteInventoryItem: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.delete(inventory).where(eq(inventory.id, input.id));

      return {
        success: true,
        deleted: (result as any).rowsAffected || 0,
      };
    }),
});
