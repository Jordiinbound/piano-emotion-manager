import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { clients, services, pianos } from "../../drizzle/schema";
import { count } from "drizzle-orm";

export const dashboardRouter = router({
  /**
   * Obtener métricas del dashboard
   */
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
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

    return {
      clients: clientsCount[0]?.count ?? 0,
      services: servicesCount[0]?.count ?? 0,
      pianos: pianosCount[0]?.count ?? 0,
    };
  }),
});
