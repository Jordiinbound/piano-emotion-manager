import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { services, clients, pianos } from "../../drizzle/schema.js";
import { eq, and, like, or, sql, desc } from "drizzle-orm";

export const servicesRouter = router({
  /**
   * Get statistics by service type
   */
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(services);
    const total = Number(totalResult[0]?.count || 0);
    
    // Get count by type
    const byTypeResult = await db
      .select({
        serviceType: services.serviceType,
        count: sql<number>`count(*)`,
      })
      .from(services)
      .groupBy(services.serviceType);
    
    const byType = byTypeResult.map((row) => ({
      serviceType: row.serviceType,
      count: Number(row.count),
    }));
    
    return {
      total,
      byType,
    };
  }),

  /**
   * Get paginated list of services with filters
   */
  getServices: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        search: z.string().optional(),
        serviceType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { page, limit, search, serviceType } = input;
      const offset = (page - 1) * limit;

      let query = db
        .select({
          id: services.id,
          clientId: services.clientId,
          pianoId: services.pianoId,
          serviceType: services.serviceType,
          date: services.date,
          cost: services.cost,
          duration: services.duration,
          notes: services.notes,
          createdAt: services.createdAt,
          updatedAt: services.updatedAt,
          // Include client and piano info for display
          clientName: clients.name,
          pianoInfo: sql<string>`CONCAT(${pianos.brand}, ' ', ${pianos.model})`,
        })
        .from(services)
        .leftJoin(clients, eq(services.clientId, clients.id))
        .leftJoin(pianos, eq(services.pianoId, pianos.id))
        .orderBy(desc(services.date))
        .limit(limit)
        .offset(offset);

      // Apply filters
      const conditions = [];
      
      // Only apply serviceType filter if it's not "all" and is a valid enum value
      const validServiceTypes = ['tuning','repair','regulation','maintenance_basic','maintenance_complete','maintenance_premium','inspection','restoration','other'];
      if (serviceType && serviceType !== "all" && validServiceTypes.includes(serviceType)) {
        conditions.push(eq(services.serviceType, serviceType as any));
      }
      
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        conditions.push(
          or(
            like(clients.name, searchTerm),
            like(pianos.brand, searchTerm),
            like(pianos.model, searchTerm),
            like(services.notes, searchTerm)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query;
      
      return results;
    }),

  /**
   * Get service by ID
   */
  getServiceById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db
        .select()
        .from(services)
        .where(eq(services.id, input.id))
        .limit(1);
      
      return result[0] || null;
    }),

  /**
   * Create a new service
   */
  createService: publicProcedure
    .input(
      z.object({
        clientId: z.number(),
        pianoId: z.number(),
        serviceType: z.enum(['tuning','repair','regulation','maintenance_basic','maintenance_complete','maintenance_premium','inspection','restoration','other']),
        date: z.string(),
        cost: z.number().optional(),
        duration: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Generate odId (unique identifier)
      const odId = `SRV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await db.insert(services).values({
        odId,
        clientId: input.clientId,
        pianoId: input.pianoId,
        serviceType: input.serviceType,
        date: new Date(input.date),
        cost: input.cost,
        duration: input.duration,
        notes: input.notes,
      } as any);
      
      return { 
        success: true,
        serviceId: (result as any).insertId || 0,
      };
    }),

  /**
   * Update an existing service
   */
  updateService: publicProcedure
    .input(
      z.object({
        id: z.number(),
        clientId: z.number().optional(),
        pianoId: z.number().optional(),
        serviceType: z.enum(['tuning','repair','regulation','maintenance_basic','maintenance_complete','maintenance_premium','inspection','restoration','other']).optional(),
        date: z.string().optional(),
        cost: z.number().optional(),
        duration: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const { id, date, ...updateData } = input;
      
      const dataToUpdate: any = { ...updateData };
      if (date) {
        dataToUpdate.date = new Date(date);
      }
      
      await db
        .update(services)
        .set(dataToUpdate)
        .where(eq(services.id, id));
      
      return { success: true };
    }),

  /**
   * Delete a service
   */
  deleteService: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.delete(services).where(eq(services.id, input.id));
      return { success: true };
    }),
});
