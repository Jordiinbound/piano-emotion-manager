import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import * as schema from '../../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getDb } from '../db';

const { clients } = schema;

/**
 * Router de Clientes
 * Endpoints para gestión de clientes
 */
export const clientsRouter = router({
  /**
   * Obtener estadísticas de clientes
   */
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Total de clientes
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients);
    const total = Number(totalResult[0]?.count || 0);

    // Clientes activos (asumimos que todos son activos por ahora, ya que no hay campo status)
    const active = total;

    // Clientes VIP (no existe campo isVip, así que retornamos 0)
    const vip = 0;

    // Clientes con pianos
    const withPianosResult = await db.execute(sql`
      SELECT COUNT(DISTINCT clientId) as count
      FROM pianos
      WHERE clientId IS NOT NULL
    `);
    const withPianos = Number((withPianosResult as any)[0]?.count || 0);

    return {
      total,
      active,
      vip,
      withPianos,
    };
  }),

  /**
   * Obtener lista de clientes con paginación y filtros
   */
  getClients: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(50),
        search: z.string().optional(),
        region: z.string().optional(),
        city: z.string().optional(),
        routeGroup: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { page, pageSize, search, region, city, routeGroup } = input;
      const offset = (page - 1) * pageSize;

      // Construir condiciones de filtrado
      const conditions = [];

      if (search) {
        conditions.push(
          sql`(
            name LIKE ${`%${search}%`} OR
            email LIKE ${`%${search}%`} OR
            phone LIKE ${`%${search}%`} OR
            address LIKE ${`%${search}%`}
          )`
        );
      }

      if (region && region !== 'Todas') {
        conditions.push(eq(clients.region, region));
      }

      if (city && city !== 'Todas') {
        conditions.push(eq(clients.city, city));
      }

      if (routeGroup && routeGroup !== 'Todos') {
        conditions.push(eq(clients.routeGroup, routeGroup));
      }

      // Obtener clientes con filtros
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const clientsList = await db
        .select()
        .from(clients)
        .where(whereClause)
        .orderBy(desc(clients.createdAt))
        .limit(pageSize)
        .offset(offset);

      // Contar total de clientes que coinciden con los filtros
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(clients)
        .where(whereClause);
      const totalCount = Number(countResult[0]?.count || 0);

      return {
        clients: clientsList,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        hasMore: offset + clientsList.length < totalCount,
      };
    }),

  /**
   * Obtener cliente por ID
   */
  getClientById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const client = await db
        .select()
        .from(clients)
        .where(eq(clients.id, input.id))
        .limit(1);

      if (!client || client.length === 0) {
        throw new Error('Cliente no encontrado');
      }

      return client[0];
    }),

  /**
   * Crear nuevo cliente
   */
  createClient: publicProcedure
    .input(
      z.object({
        odId: z.string(),
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        region: z.string().optional(),
        notes: z.string().optional(),
        clientType: z.enum(['particular','student','professional','music_school','conservatory','concert_hall']).default('particular'),
        routeGroup: z.string().optional(),
        partnerId: z.number().default(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(clients).values({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        clientId: (result as any).insertId || 0,
      };
    }),

  /**
   * Actualizar cliente existente
   */
  updateClient: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        region: z.string().optional(),
        notes: z.string().optional(),
        clientType: z.enum(['particular','student','professional','music_school','conservatory','concert_hall']).optional(),
        routeGroup: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...updateData } = input;

      await db
        .update(clients)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(clients.id, id));

      return {
        success: true,
      };
    }),

  /**
   * Eliminar cliente
   */
  deleteClient: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.delete(clients).where(eq(clients.id, input.id));

      return {
        success: true,
      };
    }),

  /**
   * Obtener valores únicos para filtros
   */
  getFilterOptions: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Obtener regiones únicas usando SQL raw
    const regionsResult = await db.execute(sql`
      SELECT DISTINCT region
      FROM clients
      WHERE region IS NOT NULL AND region != ''
      ORDER BY region
    `);
    const regions = (regionsResult as any[]).map((r: any) => r.region).filter((r: string) => !!r);

    // Obtener ciudades únicas usando SQL raw
    const citiesResult = await db.execute(sql`
      SELECT DISTINCT city
      FROM clients
      WHERE city IS NOT NULL AND city != ''
      ORDER BY city
    `);
    const cities = (citiesResult as any[]).map((c: any) => c.city).filter((c: string) => !!c);

    // Obtener grupos de ruta únicos usando SQL raw
    const routeGroupsResult = await db.execute(sql`
      SELECT DISTINCT routeGroup
      FROM clients
      WHERE routeGroup IS NOT NULL AND routeGroup != ''
      ORDER BY routeGroup
    `);
    const routeGroups = (routeGroupsResult as any[]).map((rg: any) => rg.routeGroup).filter((rg: string) => !!rg);

    return {
      regions,
      cities,
      routeGroups,
    };
  }),
});
