import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { userLicenses, userLicenseTransactions, users, partnersV2, partnerActivationCodes } from "../../drizzle/schema.js";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { requirePermission } from "../_core/authMiddleware.js";

export const analyticsRouter = router({
  // Dashboard global con métricas clave
  getGlobalMetrics: protectedProcedure
    .use(requirePermission('view_analytics'))
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Total de licencias activas
      const [activeLicensesResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userLicenses)
        .where(eq(userLicenses.status, 'active'));

      const activeLicenses = activeLicensesResult?.count || 0;

      // Total de usuarios
      const [totalUsersResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users);

      const totalUsers = totalUsersResult?.count || 0;

      // Total de partners
      const [totalPartnersResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(partnersV2)
        .where(eq(partnersV2.status, 'active'));

      const totalPartners = totalPartnersResult?.count || 0;

      // MRR (Monthly Recurring Revenue) - Asumiendo precio de 29€/mes por licencia
      const pricePerLicense = 29;
      const mrr = activeLicenses * pricePerLicense;

      // Nuevas licencias en los últimos 30 días
      const [newLicensesResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userLicenses)
        .where(gte(userLicenses.startDate, thirtyDaysAgo));

      const newLicenses = newLicensesResult?.count || 0;

      // Licencias canceladas en los últimos 30 días
      const [canceledLicensesResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userLicenses)
        .where(
          and(
            eq(userLicenses.status, 'expired'),
            gte(userLicenses.endDate, thirtyDaysAgo)
          )
        );

      const canceledLicenses = canceledLicensesResult?.count || 0;

      // Churn Rate = (Licencias canceladas / Licencias activas al inicio del período) * 100
      const churnRate = activeLicenses > 0 ? (canceledLicenses / activeLicenses) * 100 : 0;

      // LTV (Lifetime Value) - Estimación simple: MRR / Churn Rate mensual
      const monthlyChurnRate = churnRate / 100;
      const ltv = monthlyChurnRate > 0 ? pricePerLicense / monthlyChurnRate : pricePerLicense * 12;

      // Ingresos totales (últimos 30 días)
      const [revenueResult] = await db
        .select({ total: sql<number>`SUM(${userLicenseTransactions.amount})` })
        .from(userLicenseTransactions)
        .where(
          and(
            eq(userLicenseTransactions.status, 'completed'),
            gte(userLicenseTransactions.createdAt, thirtyDaysAgo)
          )
        );

      const revenue30Days = revenueResult?.total || 0;

      // Tasa de conversión de códigos de activación
      const [totalCodesResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(partnerActivationCodes);

      const totalCodes = totalCodesResult?.count || 0;

      const [usedCodesResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(partnerActivationCodes)
        .where(eq(partnerActivationCodes.status, 'used'));

      const usedCodes = usedCodesResult?.count || 0;

      const conversionRate = totalCodes > 0 ? (usedCodes / totalCodes) * 100 : 0;

      return {
        activeLicenses,
        totalUsers,
        totalPartners,
        mrr,
        newLicenses,
        canceledLicenses,
        churnRate: parseFloat(churnRate.toFixed(2)),
        ltv: parseFloat(ltv.toFixed(2)),
        revenue30Days: parseFloat(revenue30Days.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      };
    }),

  // Tendencias temporales (últimos 6 meses)
  getTimeTrends: protectedProcedure
    .use(requirePermission('view_analytics'))
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

      // Licencias creadas por mes
      const licensesByMonth = await db
        .select({
          month: sql<string>`DATE_FORMAT(${userLicenses.startDate}, '%Y-%m')`,
          count: sql<number>`COUNT(*)`,
        })
        .from(userLicenses)
        .where(gte(userLicenses.startDate, sixMonthsAgo))
        .groupBy(sql`DATE_FORMAT(${userLicenses.startDate}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${userLicenses.startDate}, '%Y-%m')`);

      // Ingresos por mes
      const revenueByMonth = await db
        .select({
          month: sql<string>`DATE_FORMAT(${userLicenseTransactions.createdAt}, '%Y-%m')`,
          total: sql<number>`SUM(${userLicenseTransactions.amount})`,
        })
        .from(userLicenseTransactions)
        .where(
          and(
            eq(userLicenseTransactions.status, 'completed'),
            gte(userLicenseTransactions.createdAt, sixMonthsAgo)
          )
        )
        .groupBy(sql`DATE_FORMAT(${userLicenseTransactions.createdAt}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${userLicenseTransactions.createdAt}, '%Y-%m')`);

      return {
        licensesByMonth,
        revenueByMonth,
      };
    }),

  // Distribución por tipo de licencia
  getLicenseDistribution: protectedProcedure
    .use(requirePermission('view_analytics'))
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const distribution = await db
        .select({
          type: userLicenses.type,
          count: sql<number>`COUNT(*)`,
        })
        .from(userLicenses)
        .where(eq(userLicenses.status, 'active'))
        .groupBy(userLicenses.type);

      return distribution;
    }),

  // Top partners por licencias activas
  getTopPartners: protectedProcedure
    .use(requirePermission('view_analytics'))
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const topPartners = await db
        .select({
          partnerId: userLicenses.partnerId,
          partnerName: partnersV2.name,
          count: sql<number>`COUNT(*)`,
        })
        .from(userLicenses)
        .leftJoin(partnersV2, eq(userLicenses.partnerId, partnersV2.id))
        .where(eq(userLicenses.status, 'active'))
        .groupBy(userLicenses.partnerId, partnersV2.name)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(input.limit);

      return topPartners;
    }),
});
