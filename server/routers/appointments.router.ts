/**
 * Appointments Router - tRPC
 * Piano Emotion Manager
 * 
 * Endpoints para gestión de citas/appointments
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { triggerWorkflowEvent } from '../workflow-triggers';
import { appointments } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export const appointmentsRouter = router({
  // Obtener estadísticas de citas
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Contar total de citas
    const totalResult = await db.execute(sql`SELECT COUNT(*) as count FROM appointments`);
    const total = (totalResult as any)[0]?.[0]?.count || 0;

    // Contar por estado
    const scheduledResult = await db.execute(sql`SELECT COUNT(*) as count FROM appointments WHERE status = 'scheduled'`);
    const scheduled = (scheduledResult as any)[0]?.[0]?.count || 0;

    const confirmedResult = await db.execute(sql`SELECT COUNT(*) as count FROM appointments WHERE status = 'confirmed'`);
    const confirmed = (confirmedResult as any)[0]?.[0]?.count || 0;

    const completedResult = await db.execute(sql`SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'`);
    const completed = (completedResult as any)[0]?.[0]?.count || 0;

    const cancelledResult = await db.execute(sql`SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'`);
    const cancelled = (cancelledResult as any)[0]?.[0]?.count || 0;

    return {
      total,
      scheduled,
      confirmed,
      completed,
      cancelled,
    };
  }),

  // Obtener lista de citas con paginación y filtros
  getAppointments: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(50),
        search: z.string().optional(),
        status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).optional(),
        startDate: z.string().optional(), // ISO date string
        endDate: z.string().optional(), // ISO date string
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { page, pageSize, search, status, startDate, endDate } = input;
      const offset = (page - 1) * pageSize;

      // Construir query base
      let baseQuery = `
        SELECT 
          a.id, a.odId, a.clientId, a.pianoId, a.title, a.date, a.duration, 
          a.serviceType, a.status, a.notes, a.address, a.createdAt, a.updatedAt,
          c.name as clientName,
          p.brand as pianoBrand, p.model as pianoModel
        FROM appointments a
        LEFT JOIN clients c ON a.clientId = c.id
        LEFT JOIN pianos p ON a.pianoId = p.id
        WHERE 1=1
      `;

      if (search) {
        baseQuery += ` AND (c.name LIKE '%${search}%' OR a.title LIKE '%${search}%' OR a.notes LIKE '%${search}%')`;
      }

      if (status) {
        baseQuery += ` AND a.status = '${status}'`;
      }

      if (startDate) {
        baseQuery += ` AND a.date >= '${startDate}'`;
      }

      if (endDate) {
        baseQuery += ` AND a.date <= '${endDate}'`;
      }

      baseQuery += ` ORDER BY a.date DESC, a.id DESC LIMIT ${pageSize} OFFSET ${offset}`;

      const result = await db.execute(sql.raw(baseQuery));
      const appointmentsList = (result as any)[0] || [];

      // Contar total
      let countQuery = `SELECT COUNT(*) as count FROM appointments a LEFT JOIN clients c ON a.clientId = c.id WHERE 1=1`;

      if (search) {
        countQuery += ` AND (c.name LIKE '%${search}%' OR a.title LIKE '%${search}%' OR a.notes LIKE '%${search}%')`;
      }

      if (status) {
        countQuery += ` AND a.status = '${status}'`;
      }

      if (startDate) {
        countQuery += ` AND a.date >= '${startDate}'`;
      }

      if (endDate) {
        countQuery += ` AND a.date <= '${endDate}'`;
      }

      const countResult = await db.execute(sql.raw(countQuery));
      const total = (countResult as any)[0]?.[0]?.count || 0;

      return {
        appointments: appointmentsList,
        total,
        page,
        pageSize,
      };
    }),

  // Obtener cita por ID
  getAppointmentById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const query = `
        SELECT 
          a.id, a.odId, a.clientId, a.pianoId, a.title, a.date, a.duration, 
          a.serviceType, a.status, a.notes, a.address, a.createdAt, a.updatedAt,
          c.name as clientName,
          p.brand as pianoBrand, p.model as pianoModel
        FROM appointments a
        LEFT JOIN clients c ON a.clientId = c.id
        LEFT JOIN pianos p ON a.pianoId = p.id
        WHERE a.id = ${input.id}
      `;

      const result = await db.execute(sql.raw(query));
      const appointment = (result as any)[0]?.[0] || null;

      return appointment;
    }),

  // Obtener próximas citas agrupadas por fecha
  getUpcomingAppointments: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const today = new Date().toISOString().split('T')[0];

    const query = `
      SELECT 
        a.id, a.odId, a.clientId, a.pianoId, a.title, a.date, a.duration, 
        a.serviceType, a.status, a.notes, a.address,
        c.name as clientName,
        p.brand as pianoBrand, p.model as pianoModel
      FROM appointments a
      LEFT JOIN clients c ON a.clientId = c.id
      LEFT JOIN pianos p ON a.pianoId = p.id
      WHERE a.date >= '${today}' AND a.status != 'cancelled'
      ORDER BY a.date ASC, a.id ASC
      LIMIT 50
    `;

    const result = await db.execute(sql.raw(query));
    const appointmentsList = (result as any)[0] || [];

    return appointmentsList;
  }),

  // Crear nueva cita
  createAppointment: publicProcedure
    .input(
      z.object({
        clientId: z.number(),
        pianoId: z.number().optional(),
        title: z.string(),
        date: z.string(), // ISO timestamp string
        duration: z.number().default(60),
        serviceType: z.string().optional(),
        status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).default('scheduled'),
        notes: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const odId = `APPT-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const result = await db.insert(appointments).values({ ...input, odId, partnerId: 1 } as any);

      const appointmentId = (result as any).insertId || 0;

      // Disparar trigger de cita programada
      await triggerWorkflowEvent('appointment_scheduled', {
        appointment_id: appointmentId,
        appointment_title: input.title,
        appointment_date: input.date,
        appointment_duration: input.duration,
        client_id: input.clientId,
        service_type: input.serviceType || '',
      });

      return {
        success: true,
        appointmentId,
      };
    }),

  // Actualizar cita
  updateAppointment: publicProcedure
    .input(
      z.object({
        id: z.number(),
        clientId: z.number().optional(),
        pianoId: z.number().optional(),
        title: z.string().optional(),
        date: z.string().optional(),
        duration: z.number().optional(),
        serviceType: z.string().optional(),
        status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).optional(),
        notes: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updateData } = input;
      const result = await db.update(appointments).set(updateData as any).where(eq(appointments.id, id));

      return {
        success: true,
        updated: (result as any).rowsAffected || 0,
      };
    }),

  // Eliminar cita
  deleteAppointment: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.delete(appointments).where(eq(appointments.id, input.id));

      return {
        success: true,
        deleted: (result as any).rowsAffected || 0,
      };
    }),

  // Optimizar ruta para múltiples citas
  optimizeRoute: publicProcedure
    .input(z.object({
      appointmentIds: z.array(z.number()),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener las citas con sus ubicaciones
      const appointmentsData = await Promise.all(
        input.appointmentIds.map(async (id) => {
          const appointment = await db.query.appointments.findFirst({
            where: eq(appointments.id, id),
            with: {
              client: true,
            },
          });
          return appointment;
        })
      );

      // Filtrar citas válidas con ubicación
      const validAppointments = appointmentsData.filter(
        (apt) => apt && apt.client && apt.client.address
      );

      if (validAppointments.length === 0) {
        throw new Error('No appointments with valid addresses found');
      }

      // Retornar datos para que el frontend haga la optimización con Google Maps
      return {
        appointments: validAppointments.map((apt) => ({
          id: apt!.id,
          clientName: apt!.client.name,
          address: apt!.client.address,
          scheduledDate: apt!.scheduledDate,
          serviceType: apt!.serviceType,
        })),
      };
    }),
});
