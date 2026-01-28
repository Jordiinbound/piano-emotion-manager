import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { userLicenses, users } from "../../drizzle/schema.js";
import { eq, and, lte, gte } from "drizzle-orm";
import { notifyOwner } from "../_core/notification.js";

export const licenseRemindersRouter = router({
  // Verificar y enviar recordatorios de licencias próximas a expirar
  checkAndSendReminders: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const now = new Date();
      const reminders = [
        { days: 30, label: '30 días' },
        { days: 15, label: '15 días' },
        { days: 7, label: '7 días' },
      ];

      let totalSent = 0;

      for (const reminder of reminders) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + reminder.days);
        
        // Rango de 1 día para capturar licencias que expiran en X días
        const startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);

        // Buscar licencias que expiran en X días
        const expiringLicenses = await db
          .select({
            license: userLicenses,
            user: users,
          })
          .from(userLicenses)
          .innerJoin(users, eq(userLicenses.userId, users.id))
          .where(
            and(
              eq(userLicenses.status, 'active'),
              gte(userLicenses.expiresAt, startDate.toISOString()),
              lte(userLicenses.expiresAt, endDate.toISOString())
            )
          );

        // Enviar notificación al owner por cada licencia
        for (const { license, user } of expiringLicenses) {
          const title = `Licencia próxima a expirar (${reminder.label})`;
          const content = `
**Usuario:** ${user.name || user.email}
**Email:** ${user.email}
**Licencia ID:** #${license.id}
**Tipo:** ${license.licenseType === 'direct' ? 'Directa' : 'Partner'}
**Ciclo:** ${license.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
**Precio:** ${license.price} ${license.currency}
**Expira:** ${new Date(license.expiresAt!).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}

La licencia del usuario ${user.name || user.email} expirará en ${reminder.days} días. 
Es recomendable contactar al usuario para recordarle renovar su licencia.
          `.trim();

          const sent = await notifyOwner({ title, content });
          if (sent) {
            totalSent++;
          }
        }
      }

      return {
        success: true,
        remindersSent: totalSent,
        message: `Se enviaron ${totalSent} recordatorios al owner`,
      };
    }),

  // Obtener resumen de licencias que necesitan recordatorios
  getRemindersSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const now = new Date();
      const reminders = [
        { days: 30, label: '30 días' },
        { days: 15, label: '15 días' },
        { days: 7, label: '7 días' },
      ];

      const summary = [];

      for (const reminder of reminders) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + reminder.days);
        
        const startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);

        const licenses = await db
          .select()
          .from(userLicenses)
          .where(
            and(
              eq(userLicenses.status, 'active'),
              gte(userLicenses.expiresAt, startDate.toISOString()),
              lte(userLicenses.expiresAt, endDate.toISOString())
            )
          );

        summary.push({
          days: reminder.days,
          label: reminder.label,
          count: licenses.length,
          licenses: licenses.map(l => ({
            id: l.id,
            userId: l.userId,
            expiresAt: l.expiresAt,
            price: l.price,
            currency: l.currency,
          })),
        });
      }

      return summary;
    }),
});
