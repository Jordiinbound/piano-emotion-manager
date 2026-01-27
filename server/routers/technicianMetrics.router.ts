import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { technicianMetrics, organizationMembers, users, services, appointments } from "../../drizzle/schema.js";
import { eq, and, or, desc, asc, like, count, between, gte, lte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const technicianMetricsRouter = router({
  // Obtener métricas de un técnico
  getMetrics: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        memberId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
      // Verificar acceso a la organización
      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a esta organización" });
      }

      // Obtener métricas
      const metrics = await db
        .select()
        .from(technicianMetrics)
        .where(
          and(
            eq(technicianMetrics.organizationId, input.organizationId),
            eq(technicianMetrics.memberId, input.memberId),
            between(technicianMetrics.date, input.startDate, input.endDate)
          )
        )
        .orderBy(asc(technicianMetrics.date));

      return metrics;
    }),

  // Obtener métricas agregadas de todos los técnicos
  getAllMetrics: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar acceso
      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a esta organización" });
      }

      // Obtener métricas agregadas por técnico
      const metrics = await db
        .select({
          memberId: technicianMetrics.memberId,
          totalAppointmentsScheduled: sql<number>`SUM(${technicianMetrics.appointmentsScheduled})`,
          totalAppointmentsCompleted: sql<number>`SUM(${technicianMetrics.appointmentsCompleted})`,
          totalAppointmentsCancelled: sql<number>`SUM(${technicianMetrics.appointmentsCancelled})`,
          totalServicesCompleted: sql<number>`SUM(${technicianMetrics.servicesCompleted})`,
          totalWorkMinutes: sql<number>`SUM(${technicianMetrics.totalWorkMinutes})`,
          totalTravelMinutes: sql<number>`SUM(${technicianMetrics.totalTravelMinutes})`,
          avgServiceDuration: sql<number>`AVG(${technicianMetrics.averageServiceDuration})`,
          totalRevenue: sql<string>`SUM(${technicianMetrics.totalRevenue})`,
          totalMaterialsCost: sql<string>`SUM(${technicianMetrics.totalMaterialsCost})`,
          avgRating: sql<string>`AVG(${technicianMetrics.averageRating})`,
          totalRatings: sql<number>`SUM(${technicianMetrics.ratingsCount})`,
          totalComplaints: sql<number>`SUM(${technicianMetrics.complaintsCount})`,
          totalOnTimeArrivals: sql<number>`SUM(${technicianMetrics.onTimeArrivals})`,
          totalLateArrivals: sql<number>`SUM(${technicianMetrics.lateArrivals})`,
        })
        .from(technicianMetrics)
        .where(
          and(
            eq(technicianMetrics.organizationId, input.organizationId),
            between(technicianMetrics.date, input.startDate, input.endDate)
          )
        )
        .groupBy(technicianMetrics.memberId);

      return metrics;
    }),

  // Calcular y guardar métricas de un técnico para una fecha
  calculateMetrics: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        memberId: z.number(),
        date: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar acceso
      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a esta organización" });
      }

      const permissions = typeof member.permissions === 'string' 
        ? JSON.parse(member.permissions) 
        : member.permissions;

      if (!permissions.canViewAnalytics) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para calcular métricas" });
      }

      // Obtener citas del día
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      const dayAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.technicianId, input.memberId),
            between(appointments.date, startOfDay.toISOString(), endOfDay.toISOString())
          )
        );

      const appointmentsScheduled = dayAppointments.length;
      const appointmentsCompleted = dayAppointments.filter(a => a.status === 'completed').length;
      const appointmentsCancelled = dayAppointments.filter(a => a.status === 'cancelled').length;

      // Obtener servicios completados del día
      const dayServices = await db
        .select()
        .from(services)
        .where(
          and(
            eq(services.technicianId, input.memberId),
            between(services.date, startOfDay.toISOString(), endOfDay.toISOString()),
            eq(services.status, 'completed')
          )
        );

      const servicesCompleted = dayServices.length;
      const totalWorkMinutes = dayServices.reduce((sum, s) => sum + (s.duration || 0), 0);
      const totalRevenue = dayServices.reduce((sum, s) => sum + Number(s.price || 0), 0);
      const totalMaterialsCost = dayServices.reduce((sum, s) => sum + Number(s.materialsCost || 0), 0);
      const averageServiceDuration = servicesCompleted > 0 ? Math.round(totalWorkMinutes / servicesCompleted) : 0;

      // Calcular puntualidad (simplificado - en producción usar timestamps reales)
      const onTimeArrivals = Math.floor(appointmentsCompleted * 0.9); // 90% puntual
      const lateArrivals = appointmentsCompleted - onTimeArrivals;

      // Verificar si ya existe métrica para esta fecha
      const [existing] = await db
        .select()
        .from(technicianMetrics)
        .where(
          and(
            eq(technicianMetrics.organizationId, input.organizationId),
            eq(technicianMetrics.memberId, input.memberId),
            eq(technicianMetrics.date, input.date)
          )
        )
        .limit(1);

      const metricsData = {
        organizationId: input.organizationId,
        memberId: input.memberId,
        date: input.date,
        appointmentsScheduled,
        appointmentsCompleted,
        appointmentsCancelled,
        servicesCompleted,
        totalWorkMinutes,
        totalTravelMinutes: 0, // TODO: calcular desde ubicaciones
        averageServiceDuration,
        totalRevenue: totalRevenue.toFixed(2),
        totalMaterialsCost: totalMaterialsCost.toFixed(2),
        onTimeArrivals,
        lateArrivals,
      };

      if (existing) {
        // Actualizar
        await db
          .update(technicianMetrics)
          .set(metricsData)
          .where(eq(technicianMetrics.id, existing.id));
      } else {
        // Crear
        await db.insert(technicianMetrics).values(metricsData);
      }

      return { success: true, metrics: metricsData };
    }),

  // Obtener ranking de técnicos
  getRanking: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        sortBy: z.enum(['revenue', 'services', 'rating', 'efficiency']).default('revenue'),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar acceso
      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a esta organización" });
      }

      // Obtener métricas agregadas
      const metrics = await db
        .select({
          memberId: technicianMetrics.memberId,
          totalRevenue: sql<string>`SUM(${technicianMetrics.totalRevenue})`,
          totalServices: sql<number>`SUM(${technicianMetrics.servicesCompleted})`,
          avgRating: sql<string>`AVG(${technicianMetrics.averageRating})`,
          completionRate: sql<number>`
            CASE 
              WHEN SUM(${technicianMetrics.appointmentsScheduled}) > 0 
              THEN (SUM(${technicianMetrics.appointmentsCompleted}) * 100.0 / SUM(${technicianMetrics.appointmentsScheduled}))
              ELSE 0 
            END
          `,
        })
        .from(technicianMetrics)
        .where(
          and(
            eq(technicianMetrics.organizationId, input.organizationId),
            between(technicianMetrics.date, input.startDate, input.endDate)
          )
        )
        .groupBy(technicianMetrics.memberId);

      // Ordenar según criterio
      let sorted = [...metrics];
      switch (input.sortBy) {
        case 'revenue':
          sorted.sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue));
          break;
        case 'services':
          sorted.sort((a, b) => b.totalServices - a.totalServices);
          break;
        case 'rating':
          sorted.sort((a, b) => Number(b.avgRating || 0) - Number(a.avgRating || 0));
          break;
        case 'efficiency':
          sorted.sort((a, b) => b.completionRate - a.completionRate);
          break;
      }

      return sorted;
    }),

  // Obtener comparativa de técnicos
  getComparison: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        memberIds: z.array(z.number()),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Verificar acceso
      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a esta organización" });
      }

      // Obtener métricas de cada técnico
      const comparison = await Promise.all(
        input.memberIds.map(async (memberId) => {
          const [metrics] = await db
            .select({
              memberId: technicianMetrics.memberId,
              totalRevenue: sql<string>`SUM(${technicianMetrics.totalRevenue})`,
              totalServices: sql<number>`SUM(${technicianMetrics.servicesCompleted})`,
              totalWorkHours: sql<number>`SUM(${technicianMetrics.totalWorkMinutes}) / 60`,
              avgRating: sql<string>`AVG(${technicianMetrics.averageRating})`,
              completionRate: sql<number>`
                CASE 
                  WHEN SUM(${technicianMetrics.appointmentsScheduled}) > 0 
                  THEN (SUM(${technicianMetrics.appointmentsCompleted}) * 100.0 / SUM(${technicianMetrics.appointmentsScheduled}))
                  ELSE 0 
                END
              `,
              punctualityRate: sql<number>`
                CASE 
                  WHEN SUM(${technicianMetrics.onTimeArrivals}) + SUM(${technicianMetrics.lateArrivals}) > 0 
                  THEN (SUM(${technicianMetrics.onTimeArrivals}) * 100.0 / (SUM(${technicianMetrics.onTimeArrivals}) + SUM(${technicianMetrics.lateArrivals})))
                  ELSE 0 
                END
              `,
            })
            .from(technicianMetrics)
            .where(
              and(
                eq(technicianMetrics.organizationId, input.organizationId),
                eq(technicianMetrics.memberId, memberId),
                between(technicianMetrics.date, input.startDate, input.endDate)
              )
            )
            .groupBy(technicianMetrics.memberId);

          return metrics || {
            memberId,
            totalRevenue: '0',
            totalServices: 0,
            totalWorkHours: 0,
            avgRating: '0',
            completionRate: 0,
            punctualityRate: 0,
          };
        })
      );

      return comparison;
    }),
});
