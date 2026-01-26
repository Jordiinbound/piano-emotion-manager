import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { clients, services, pianos } from "../../drizzle/schema";
import { count, desc, gte, sql } from "drizzle-orm";

export const dashboardRouter = router({
  /**
   * Obtener métricas generales del dashboard
   */
  getMetrics: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Contar clientes
    const clientsCount = await db.select({ count: count() }).from(clients);
    
    // Contar servicios
    const servicesCount = await db.select({ count: count() }).from(services);
    
    // Contar pianos
    const pianosCount = await db.select({ count: count() }).from(pianos);

    // Contar servicios del mes actual
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const servicesThisMonth = await db
      .select({ count: count() })
      .from(services)
      .where(gte(services.date, currentMonth));

    return {
      clients: clientsCount[0]?.count ?? 0,
      services: servicesCount[0]?.count ?? 0,
      pianos: pianosCount[0]?.count ?? 0,
      servicesThisMonth: servicesThisMonth[0]?.count ?? 0,
    };
  }),

  /**
   * Obtener servicios recientes
   */
  getRecentServices: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const recentServices = await db
      .select({
        id: services.id,
        serviceType: services.serviceType,
        date: services.date,
        cost: services.cost,
        clientId: services.clientId,
        pianoId: services.pianoId,
      })
      .from(services)
      .orderBy(desc(services.date))
      .limit(5);

    return recentServices;
  }),

  /**
   * Obtener próximos servicios programados
   */
  getUpcomingServices: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const now = new Date();
    
    const upcomingServices = await db
      .select({
        id: services.id,
        serviceType: services.serviceType,
        date: services.date,
        clientId: services.clientId,
        pianoId: services.pianoId,
      })
      .from(services)
      .where(gte(services.date, now))
      .orderBy(services.date)
      .limit(5);

    return upcomingServices;
  }),

  /**
   * Obtener estadísticas de servicios por mes (últimos 6 meses)
   */
  getServicesStats: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Calcular fecha de hace 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const stats = await db
      .select({
        month: sql<string>`DATE_FORMAT(${services.date}, '%Y-%m') as month`,
        count: count(),
      })
      .from(services)
      .where(gte(services.date, sixMonthsAgo))
      .groupBy(sql`month`)
      .orderBy(sql`month`);

    return stats;
  }),
});
