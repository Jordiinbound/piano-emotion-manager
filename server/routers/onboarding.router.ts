import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { onboardingProgress } from "../../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

const ONBOARDING_STEPS = [
  'welcome',
  'profile_setup',
  'organization_setup',
  'first_client',
  'first_piano',
  'first_service',
  'complete',
] as const;

export const onboardingRouter = router({
  // Obtener progreso de onboarding del usuario
  getProgress: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const progress = await db
        .select()
        .from(onboardingProgress)
        .where(eq(onboardingProgress.userId, ctx.user.id));

      const completedSteps = new Set(
        progress.filter(p => p.completed === 1).map(p => p.step)
      );

      const steps = ONBOARDING_STEPS.map(step => ({
        step,
        completed: completedSteps.has(step),
        completedAt: progress.find(p => p.step === step)?.completedAt,
      }));

      const totalSteps = ONBOARDING_STEPS.length;
      const completedCount = completedSteps.size;
      const percentage = Math.round((completedCount / totalSteps) * 100);

      return {
        steps,
        totalSteps,
        completedCount,
        percentage,
        isComplete: completedSteps.has('complete'),
      };
    }),

  // Marcar un paso como completado
  completeStep: protectedProcedure
    .input(z.object({
      step: z.enum(ONBOARDING_STEPS),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar si ya existe
      const [existing] = await db
        .select()
        .from(onboardingProgress)
        .where(
          and(
            eq(onboardingProgress.userId, ctx.user.id),
            eq(onboardingProgress.step, input.step)
          )
        )
        .limit(1);

      if (existing) {
        // Actualizar
        await db
          .update(onboardingProgress)
          .set({
            completed: 1,
            completedAt: new Date(),
          })
          .where(eq(onboardingProgress.id, existing.id));
      } else {
        // Insertar
        await db
          .insert(onboardingProgress)
          .values({
            userId: ctx.user.id,
            step: input.step,
            completed: 1,
            completedAt: new Date(),
          });
      }

      return { success: true };
    }),

  // Reiniciar onboarding
  resetProgress: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .delete(onboardingProgress)
        .where(eq(onboardingProgress.userId, ctx.user.id));

      return { success: true };
    }),
});
