/**
 * Service Types Router - tRPC
 * Piano Emotion Manager
 * 
 * Endpoints para gestión de tipos de servicio, tarifas y tareas predefinidas
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { serviceTypes, serviceRates, serviceTasks } from '../../drizzle/schema';
import { eq, and, like, or, sql, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const serviceTypesRouter = router({
  // ============================================================================
  // SERVICE TYPES (Tipos de servicio simples)
  // ============================================================================
  
  getServiceTypes: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const { page, limit, search, isActive } = input;
      const offset = (page - 1) * limit;

      const conditions = [];

      if (isActive !== undefined) {
        conditions.push(eq(serviceTypes.isActive, isActive ? 1 : 0));
      }

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        conditions.push(like(serviceTypes.name, searchTerm));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(serviceTypes)
        .where(whereClause)
        .orderBy(serviceTypes.name)
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceTypes)
        .where(whereClause);
      
      const totalCount = Number(countResult[0]?.count || 0);

      return {
        items,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }),

  createServiceType: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        price: z.number().min(0),
        duration: z.number().min(0), // en minutos
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.insert(serviceTypes).values({
        partnerId: 1,
        name: input.name,
        price: input.price.toString(),
        duration: input.duration,
        isActive: input.isActive ? 1 : 0,
      });

      return {
        id: Number(result.insertId),
      };
    }),

  updateServiceType: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        price: z.number().min(0).optional(),
        duration: z.number().min(0).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updates } = input;
      const dbUpdates: any = {};

      if (updates.name) dbUpdates.name = updates.name;
      if (updates.price !== undefined) dbUpdates.price = updates.price.toString();
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.isActive !== undefined) dbUpdates.isActive = updates.isActive ? 1 : 0;

      await db.update(serviceTypes).set(dbUpdates).where(eq(serviceTypes.id, id));

      return { success: true };
    }),

  deleteServiceType: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(serviceTypes).where(eq(serviceTypes.id, input.id));

      return { success: true };
    }),

  // ============================================================================
  // SERVICE RATES (Tarifas de servicio con categorías)
  // ============================================================================
  
  getServiceRates: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        search: z.string().optional(),
        category: z.enum(['tuning', 'maintenance', 'regulation', 'repair', 'restoration', 'inspection', 'other']).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const { page, limit, search, category, isActive } = input;
      const offset = (page - 1) * limit;

      const conditions = [];

      if (category) {
        conditions.push(eq(serviceRates.category, category));
      }

      if (isActive !== undefined) {
        conditions.push(eq(serviceRates.isActive, isActive ? 1 : 0));
      }

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        conditions.push(
          or(
            like(serviceRates.name, searchTerm),
            like(serviceRates.description, searchTerm)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(serviceRates)
        .where(whereClause)
        .orderBy(serviceRates.category, serviceRates.name)
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceRates)
        .where(whereClause);
      
      const totalCount = Number(countResult[0]?.count || 0);

      return {
        items,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }),

  getServiceRateById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db
        .select()
        .from(serviceRates)
        .where(eq(serviceRates.id, input.id))
        .limit(1);

      if (!result || result.length === 0) {
        throw new Error('Service rate not found');
      }

      return result[0];
    }),

  createServiceRate: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.enum(['tuning', 'maintenance', 'regulation', 'repair', 'restoration', 'inspection', 'other']),
        basePrice: z.number().min(0),
        taxRate: z.number().min(0).max(100).default(21),
        estimatedDuration: z.number().min(0).optional(), // en minutos
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.insert(serviceRates).values({
        odId: nanoid(),
        name: input.name,
        description: input.description || '',
        category: input.category,
        basePrice: input.basePrice.toString(),
        taxRate: input.taxRate,
        estimatedDuration: input.estimatedDuration || null,
        isActive: input.isActive ? 1 : 0,
        partnerId: 1,
        organizationId: null,
      });

      return {
        id: Number(result.insertId),
      };
    }),

  updateServiceRate: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        category: z.enum(['tuning', 'maintenance', 'regulation', 'repair', 'restoration', 'inspection', 'other']).optional(),
        basePrice: z.number().min(0).optional(),
        taxRate: z.number().min(0).max(100).optional(),
        estimatedDuration: z.number().min(0).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updates } = input;
      const dbUpdates: any = {};

      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.basePrice !== undefined) dbUpdates.basePrice = updates.basePrice.toString();
      if (updates.taxRate !== undefined) dbUpdates.taxRate = updates.taxRate;
      if (updates.estimatedDuration !== undefined) dbUpdates.estimatedDuration = updates.estimatedDuration;
      if (updates.isActive !== undefined) dbUpdates.isActive = updates.isActive ? 1 : 0;

      await db.update(serviceRates).set(dbUpdates).where(eq(serviceRates.id, id));

      return { success: true };
    }),

  deleteServiceRate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(serviceRates).where(eq(serviceRates.id, input.id));

      return { success: true };
    }),

  // ============================================================================
  // SERVICE TASKS (Tareas/checklist por tipo de servicio)
  // ============================================================================
  
  getServiceTasks: publicProcedure
    .input(z.object({ serviceTypeId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const tasks = await db
        .select()
        .from(serviceTasks)
        .where(eq(serviceTasks.serviceTypeId, input.serviceTypeId))
        .orderBy(serviceTasks.orderIndex);

      return tasks;
    }),

  createServiceTask: publicProcedure
    .input(
      z.object({
        serviceTypeId: z.number(),
        description: z.string().min(1).max(500),
        orderIndex: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.insert(serviceTasks).values({
        serviceTypeId: input.serviceTypeId,
        description: input.description,
        orderIndex: input.orderIndex,
      });

      return {
        id: Number(result.insertId),
      };
    }),

  updateServiceTask: publicProcedure
    .input(
      z.object({
        id: z.number(),
        description: z.string().min(1).max(500).optional(),
        orderIndex: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updates } = input;

      await db.update(serviceTasks).set(updates).where(eq(serviceTasks.id, id));

      return { success: true };
    }),

  deleteServiceTask: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(serviceTasks).where(eq(serviceTasks.id, input.id));

      return { success: true };
    }),

  // ============================================================================
  // ESTADÍSTICAS
  // ============================================================================
  
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Total de tarifas activas
    const activeRatesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRates)
      .where(eq(serviceRates.isActive, 1));
    const activeRates = Number(activeRatesResult[0]?.count || 0);

    // Por categoría
    const byCategoryResult = await db
      .select({
        category: serviceRates.category,
        count: sql<number>`count(*)`,
      })
      .from(serviceRates)
      .where(eq(serviceRates.isActive, 1))
      .groupBy(serviceRates.category);

    const byCategory = byCategoryResult.reduce((acc, row) => {
      acc[row.category] = Number(row.count);
      return acc;
    }, {} as Record<string, number>);

    return {
      activeRates,
      byCategory,
    };
  }),
});
