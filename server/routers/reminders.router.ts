/**
 * Reminders Router
 * Gestión de recordatorios de seguimiento y captación de clientes
 * Piano Emotion Manager - Manus
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";

const { reminders, clients, pianos } = schema;
import { eq, and, gte, lte, asc, desc, count, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// ============================================================================
// ESQUEMAS DE VALIDACIÓN
// ============================================================================

/**
 * Tipos de recordatorio
 */
const reminderTypeSchema = z.enum([
  "call",
  "visit",
  "email",
  "whatsapp",
  "follow_up"
]);

/**
 * Esquema de paginación y filtros
 */
const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(30),
  cursor: z.number().optional(),
  sortBy: z.enum(["dueDate", "title", "reminderType", "createdAt"]).default("dueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  clientId: z.number().optional(),
  pianoId: z.number().optional(),
  reminderType: reminderTypeSchema.optional(),
  isCompleted: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  overdue: z.boolean().optional(),
});

/**
 * Esquema base de recordatorio
 */
const reminderBaseSchema = z.object({
  clientId: z.number().int().positive(),
  pianoId: z.number().int().positive().optional().nullable(),
  reminderType: reminderTypeSchema,
  dueDate: z.string().or(z.date()),
  title: z.string().min(1, "El título es obligatorio").max(255),
  notes: z.string().max(2000).optional().nullable(),
  isCompleted: z.number().int().min(0).max(1).default(0),
  completedAt: z.string().or(z.date()).optional().nullable(),
});

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Marca recordatorios como vencidos
 */
function markOverdueReminders(remindersList: any[]): any[] {
  const now = new Date();
  return remindersList.map(reminder => ({
    ...reminder,
    isOverdue: !reminder.isCompleted && new Date(reminder.dueDate) < now,
  }));
}

/**
 * Calcula estadísticas de recordatorios
 */
function calculateReminderStats(remindersList: any[]) {
  const now = new Date();
  const marked = markOverdueReminders(remindersList);
  
  const total = marked.length;
  const completed = marked.filter(r => r.isCompleted).length;
  const pending = marked.filter(r => !r.isCompleted).length;
  const overdue = marked.filter(r => r.isOverdue).length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const dueToday = marked.filter(r => {
    if (r.isCompleted) return false;
    const due = new Date(r.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  }).length;
  
  const dueThisWeek = marked.filter(r => {
    if (r.isCompleted) return false;
    const due = new Date(r.dueDate);
    return due >= today && due < nextWeek;
  }).length;
  
  const byType: Record<string, number> = {};
  reminderTypeSchema.options.forEach(type => {
    byType[type] = marked.filter(r => r.reminderType === type).length;
  });

  return {
    total,
    completed,
    pending,
    overdue,
    dueToday,
    dueThisWeek,
    byType,
  };
}

// ============================================================================
// ROUTER
// ============================================================================

export const remindersRouter = router({
  /**
   * Lista de recordatorios con paginación y filtros
   */
  list: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      const { 
        limit = 30, 
        cursor, 
        sortBy = "dueDate", 
        sortOrder = "asc", 
        clientId,
        pianoId,
        reminderType,
        isCompleted,
        dateFrom,
        dateTo,
        overdue
      } = input || {};
      
      const database = await getDb();

      // Construir condiciones WHERE
      const whereClauses = [];
      
      if (clientId !== undefined) {
        whereClauses.push(eq(reminders.clientId, clientId));
      }
      
      if (pianoId !== undefined) {
        whereClauses.push(eq(reminders.pianoId, pianoId));
      }
      
      if (reminderType !== undefined) {
        whereClauses.push(eq(reminders.reminderType, reminderType));
      }
      
      if (isCompleted !== undefined) {
        whereClauses.push(eq(reminders.isCompleted, isCompleted ? 1 : 0));
      }
      
      if (dateFrom) {
        whereClauses.push(gte(reminders.dueDate, dateFrom));
      }
      
      if (dateTo) {
        whereClauses.push(lte(reminders.dueDate, dateTo));
      }

      // Construir ORDER BY
      const sortColumn = reminders[sortBy as keyof typeof reminders] || reminders.dueDate;
      const orderByClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

      // Consulta principal con paginación
      const offset = cursor || 0;
      let items = await database
        .select({
          id: reminders.id,
          odId: reminders.odId,
          clientId: reminders.clientId,
          clientName: clients.name,
          pianoId: reminders.pianoId,
          pianoModel: pianos.model,
          reminderType: reminders.reminderType,
          dueDate: reminders.dueDate,
          title: reminders.title,
          notes: reminders.notes,
          isCompleted: reminders.isCompleted,
          completedAt: reminders.completedAt,
          createdAt: reminders.createdAt,
          updatedAt: reminders.updatedAt,
        })
        .from(reminders)
        .leftJoin(clients, eq(reminders.clientId, clients.id))
        .leftJoin(pianos, eq(reminders.pianoId, pianos.id))
        .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      // Marcar vencidos y aplicar filtro de overdue si se especificó
      items = markOverdueReminders(items);
      if (overdue !== undefined) {
        items = items.filter(r => overdue ? r.isOverdue : !r.isOverdue);
      }

      // Contar total
      const [{ total }] = await database
        .select({ total: count() })
        .from(reminders)
        .where(whereClauses.length > 0 ? and(...whereClauses) : undefined);

      // Calcular estadísticas
      const allReminders = await database
        .select()
        .from(reminders);

      const stats = calculateReminderStats(allReminders);

      let nextCursor: number | undefined = undefined;
      if (items.length === limit) {
        nextCursor = offset + limit;
      }

      return { items, nextCursor, total, stats };
    }),
  
  /**
   * Lista completa sin paginación (para selects)
   */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    
    const items = await database
      .select()
      .from(reminders)
      .orderBy(asc(reminders.dueDate));

    return markOverdueReminders(items);
  }),
  
  /**
   * Obtener recordatorio por ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await getDb();

      const [reminder] = await database
        .select({
          id: reminders.id,
          odId: reminders.odId,
          clientId: reminders.clientId,
          clientName: clients.name,
          pianoId: reminders.pianoId,
          pianoModel: pianos.model,
          reminderType: reminders.reminderType,
          dueDate: reminders.dueDate,
          title: reminders.title,
          notes: reminders.notes,
          isCompleted: reminders.isCompleted,
          completedAt: reminders.completedAt,
          createdAt: reminders.createdAt,
          updatedAt: reminders.updatedAt,
        })
        .from(reminders)
        .leftJoin(clients, eq(reminders.clientId, clients.id))
        .leftJoin(pianos, eq(reminders.pianoId, pianos.id))
        .where(eq(reminders.id, input.id));

      if (!reminder) throw new Error("Recordatorio no encontrado");
      
      const [marked] = markOverdueReminders([reminder]);
      return marked;
    }),
  
  /**
   * Obtener recordatorios de un cliente
   */
  byClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await getDb();

      const items = await database
        .select()
        .from(reminders)
        .where(eq(reminders.clientId, input.clientId))
        .orderBy(asc(reminders.dueDate));

      return markOverdueReminders(items);
    }),
  
  /**
   * Obtener recordatorios de un piano
   */
  byPiano: protectedProcedure
    .input(z.object({ pianoId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await getDb();

      const items = await database
        .select()
        .from(reminders)
        .where(eq(reminders.pianoId, input.pianoId))
        .orderBy(asc(reminders.dueDate));

      return markOverdueReminders(items);
    }),
  
  /**
   * Obtener recordatorios pendientes
   */
  getPending: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();

    const items = await database
      .select({
        id: reminders.id,
        odId: reminders.odId,
        clientId: reminders.clientId,
        clientName: clients.name,
        pianoId: reminders.pianoId,
        pianoModel: pianos.model,
        reminderType: reminders.reminderType,
        dueDate: reminders.dueDate,
        title: reminders.title,
        notes: reminders.notes,
        isCompleted: reminders.isCompleted,
        completedAt: reminders.completedAt,
        createdAt: reminders.createdAt,
        updatedAt: reminders.updatedAt,
      })
      .from(reminders)
      .leftJoin(clients, eq(reminders.clientId, clients.id))
      .leftJoin(pianos, eq(reminders.pianoId, pianos.id))
      .where(eq(reminders.isCompleted, 0))
      .orderBy(asc(reminders.dueDate));

    return markOverdueReminders(items);
  }),
  
  /**
   * Obtener recordatorios vencidos
   */
  getOverdue: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const items = await database
      .select({
        id: reminders.id,
        odId: reminders.odId,
        clientId: reminders.clientId,
        clientName: clients.name,
        pianoId: reminders.pianoId,
        pianoModel: pianos.model,
        reminderType: reminders.reminderType,
        dueDate: reminders.dueDate,
        title: reminders.title,
        notes: reminders.notes,
        isCompleted: reminders.isCompleted,
        completedAt: reminders.completedAt,
        createdAt: reminders.createdAt,
        updatedAt: reminders.updatedAt,
      })
      .from(reminders)
      .leftJoin(clients, eq(reminders.clientId, clients.id))
      .leftJoin(pianos, eq(reminders.pianoId, pianos.id))
      .where(
        and(
          eq(reminders.isCompleted, 0),
          lte(reminders.dueDate, now)
        )
      )
      .orderBy(asc(reminders.dueDate));

    return markOverdueReminders(items);
  }),
  
  /**
   * Obtener recordatorios próximos (siguientes N días)
   */
  getUpcoming: protectedProcedure
    .input(z.object({
      daysAhead: z.number().int().min(1).max(30).default(7),
    }).optional())
    .query(async ({ ctx, input }) => {
      const database = await getDb();

      const daysAhead = input?.daysAhead || 7;
      const now = new Date();
      const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
      const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
      const cutoffStr = cutoff.toISOString().slice(0, 19).replace('T', ' ');

      const items = await database
        .select({
          id: reminders.id,
          odId: reminders.odId,
          clientId: reminders.clientId,
          clientName: clients.name,
          pianoId: reminders.pianoId,
          pianoModel: pianos.model,
          reminderType: reminders.reminderType,
          dueDate: reminders.dueDate,
          title: reminders.title,
          notes: reminders.notes,
          isCompleted: reminders.isCompleted,
          completedAt: reminders.completedAt,
          createdAt: reminders.createdAt,
          updatedAt: reminders.updatedAt,
        })
        .from(reminders)
        .leftJoin(clients, eq(reminders.clientId, clients.id))
        .leftJoin(pianos, eq(reminders.pianoId, pianos.id))
        .where(
          and(
            eq(reminders.isCompleted, 0),
            gte(reminders.dueDate, nowStr),
            lte(reminders.dueDate, cutoffStr)
          )
        )
        .orderBy(asc(reminders.dueDate));

      return markOverdueReminders(items);
    }),
  
  /**
   * Obtener estadísticas de recordatorios
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();

    const allReminders = await database
      .select()
      .from(reminders);

    return calculateReminderStats(allReminders);
  }),
  
  /**
   * Crear recordatorio
   */
  create: protectedProcedure
    .input(reminderBaseSchema)
    .mutation(async ({ ctx, input }) => {
      const database = await getDb();

      const odId = createId();
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const formatDate = (date: string | Date | null | undefined): string | null => {
        if (!date) return null;
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toISOString().slice(0, 19).replace('T', ' ');
      };

      const [result] = await database
        .insert(reminders)
        .values({
          odId,
          clientId: input.clientId,
          pianoId: input.pianoId || null,
          reminderType: input.reminderType,
          dueDate: formatDate(input.dueDate)!,
          title: input.title,
          notes: input.notes || null,
          isCompleted: input.isCompleted,
          completedAt: formatDate(input.completedAt),
          createdAt: now,
          updatedAt: now,
          partnerId: 1,
          organizationId: null,
        });

      return { id: result.insertId, odId };
    }),
  
  /**
   * Actualizar recordatorio
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: reminderBaseSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = await getDb();

      const formatDate = (date: string | Date | null | undefined): string | null => {
        if (!date) return null;
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toISOString().slice(0, 19).replace('T', ' ');
      };

      const updateData: any = {
        ...input.data,
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };

      if (updateData.dueDate) {
        updateData.dueDate = formatDate(updateData.dueDate);
      }

      if (updateData.completedAt) {
        updateData.completedAt = formatDate(updateData.completedAt);
      }

      await database
        .update(reminders)
        .set(updateData)
        .where(eq(reminders.id, input.id));

      return { success: true };
    }),
  
  /**
   * Marcar recordatorio como completado
   */
  markCompleted: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = await getDb();

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await database
        .update(reminders)
        .set({
          isCompleted: 1,
          completedAt: now,
          updatedAt: now,
        })
        .where(eq(reminders.id, input.id));

      return { success: true };
    }),
  
  /**
   * Eliminar recordatorio
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = await getDb();

      await database
        .delete(reminders)
        .where(eq(reminders.id, input.id));

      return { success: true };
    }),
});
