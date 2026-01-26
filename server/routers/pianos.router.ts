import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { pianos } from '../../drizzle/schema';
import { eq, like, or, and, sql, desc } from 'drizzle-orm';

export const pianosRouter = router({
  // Obtener estadísticas de pianos
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [result] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        vertical: sql<number>`SUM(CASE WHEN ${pianos.category} = 'vertical' THEN 1 ELSE 0 END)`,
        grand: sql<number>`SUM(CASE WHEN ${pianos.category} = 'grand' THEN 1 ELSE 0 END)`,
      })
      .from(pianos);

    return {
      total: Number(result?.total || 0),
      vertical: Number(result?.vertical || 0),
      grand: Number(result?.grand || 0),
    };
  }),

  // Obtener lista de pianos con paginación y filtros
  getPianos: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(50),
        search: z.string().optional(),
        category: z.enum(['vertical', 'grand']).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { page, pageSize, search, category } = input;
      const offset = (page - 1) * pageSize;

      // Construir condiciones de filtrado
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            like(pianos.brand, `%${search}%`),
            like(pianos.model, `%${search}%`),
            like(pianos.serialNumber, `%${search}%`)
          )
        );
      }

      if (category) {
        conditions.push(eq(pianos.category, category));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Obtener pianos con paginación
      const result = await db
        .select()
        .from(pianos)
        .where(whereClause)
        .orderBy(desc(pianos.createdAt))
        .limit(pageSize)
        .offset(offset);

      // Contar total de pianos
      const [countResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pianos)
        .where(whereClause);

      const total = Number(countResult?.count || 0);

      return {
        pianos: result,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  // Obtener piano por ID
  getPianoById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [piano] = await db
        .select()
        .from(pianos)
        .where(eq(pianos.id, input.id))
        .limit(1);

      return piano || null;
    }),

  // Crear nuevo piano
  createPiano: publicProcedure
    .input(
      z.object({
        clientId: z.number(),
        brand: z.string(),
        model: z.string(),
        serialNumber: z.string().optional(),
        category: z.enum(['vertical', 'grand']),
        pianoType: z.string(),
        manufactureYear: z.number().optional(),
        condition: z.string().optional(),
        location: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const odId = `PIANO-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const result = await db.insert(pianos).values({ ...input, odId } as any);

      return {
        success: true,
        pianoId: (result as any).insertId || 0,
      };
    }),

  // Actualizar piano
  updatePiano: publicProcedure
    .input(
      z.object({
        id: z.number(),
        clientId: z.number().optional(),
        brand: z.string().optional(),
        model: z.string().optional(),
        serialNumber: z.string().optional(),
        category: z.enum(['vertical', 'grand']).optional(),
        manufactureYear: z.number().optional(),
        condition: z.string().optional(),
        location: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updateData } = input;

      await db
        .update(pianos)
        .set(updateData as any)
        .where(eq(pianos.id, id));

      return { success: true };
    }),

  // Eliminar piano
  deletePiano: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(pianos).where(eq(pianos.id, input.id));

      return { success: true };
    }),
});
