import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = 'session';
import { dashboardRouter } from "./routers/dashboard.router";
import { clientsRouter } from "./routers/clients.router";
import { servicesRouter } from "./routers/services.router";
import { pianosRouter } from "./routers/pianos.router";
import { appointmentsRouter } from "./routers/appointments.router";
import { invoicesRouter } from "./routers/invoices.router";
import { inventoryRouter } from "./routers/inventory.router";
import { stripeRouter } from "./routers/stripe.router";
import { clientPortalRouter } from "./routers/clientPortal.router";
import { usersRouter } from "./routers/users.router";
import { emailConfigRouter } from "./routers/emailConfig.router";
import { alertsRouter } from "./routers/alerts.router";
import { quotesRouter } from "./routers/quotes.router";
import { serviceTypesRouter } from "./routers/serviceTypes.router";
import { organizationsRouter } from "./routers/organizations.router";
// TEMPORARILY COMMENTED - Will be rewritten for new multi-tenant model
// import { partnersRouter } from "./routers/partners.router";
// import { technicianMetricsRouter } from "./routers/technicianMetrics.router";
import { partnersV2Router } from "./routers/partnersV2.router";
import { licensesRouter } from "./routers/licenses.router";
import { activationCodesRouter } from "./routers/activationCodes.router";
import { licenseNotificationsRouter } from "./routers/licenseNotifications.router";
import { licenseRenewalRouter } from "./routers/licenseRenewal.router";
import { licenseRemindersRouter } from "./routers/licenseReminders.router";
import { rolesRouter } from "./routers/roles.router";
import { analyticsRouter } from "./routers/analytics.router";
import { onboardingRouter } from "./routers/onboarding.router";
import { aiAssistantRouter } from "./routers/aiAssistant.router";
import { alertSettingsRouter } from "./routers/alertSettings.router";
import { languageRouter } from "./routers/language.router";
import { translationsRouter } from "./routers/translations.router";
import { exportRouter } from "./routers/export.router";
import { whatsappRouter } from "./routers/whatsapp.router";
import { whatsappNotificationsRouter } from "./routers/whatsappNotifications.router";
import { remindersRouter } from "./routers/reminders.router";
import { marketingRouter } from "./routers/marketing.router";
import { pianoTechnicalRouter } from "./routers/pianoTechnical.router";
import { workflowsRouter } from "./routers/workflows.router";
import { settingsRouter } from "./routers/settings.router";
import { notificationsRouter } from "./routers/notifications.router";
import { forecastsRouter } from "./routers/forecasts.router";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    updateProfile: publicProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        country: z.string().optional(),
        province: z.string().optional(),
        city: z.string().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error('Not authenticated');
        }
        
        const db = await getDb();
        await db.update(users)
          .set({
            name: input.name,
            phone: input.phone,
            country: input.country,
            province: input.province,
            city: input.city,
            address: input.address,
          })
          .where(eq(users.id, ctx.user.id));
        
        return { success: true };
      }),
    
    // Notification preferences
    getNotificationPreferences: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }
      
      const db = await getDb();
      const [user] = await db.select({
        notificationSound: users.notificationSound,
        notificationVibration: users.notificationVibration,
        notificationApprovalPending: users.notificationApprovalPending,
        notificationWorkflowCompleted: users.notificationWorkflowCompleted,
        notificationWorkflowFailed: users.notificationWorkflowFailed,
        notificationSystem: users.notificationSystem,
        notificationEmailEnabled: users.notificationEmailEnabled,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id));
      
      return user;
    }),
    
    updateNotificationPreferences: publicProcedure
      .input(z.object({
        notificationSound: z.boolean(),
        notificationVibration: z.boolean(),
        notificationApprovalPending: z.boolean(),
        notificationWorkflowCompleted: z.boolean(),
        notificationWorkflowFailed: z.boolean(),
        notificationSystem: z.boolean(),
        notificationEmailEnabled: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error('Not authenticated');
        }
        
        const db = await getDb();
        await db.update(users)
          .set({
            notificationSound: input.notificationSound ? 1 : 0,
            notificationVibration: input.notificationVibration ? 1 : 0,
            notificationApprovalPending: input.notificationApprovalPending ? 1 : 0,
            notificationWorkflowCompleted: input.notificationWorkflowCompleted ? 1 : 0,
            notificationWorkflowFailed: input.notificationWorkflowFailed ? 1 : 0,
            notificationSystem: input.notificationSystem ? 1 : 0,
            notificationEmailEnabled: input.notificationEmailEnabled ? 1 : 0,
          })
          .where(eq(users.id, ctx.user.id));
        
        return { success: true };
      }),
  }),

  // Feature routers
  dashboard: dashboardRouter,
  clients: clientsRouter,
  services: servicesRouter,
  pianos: pianosRouter,
  appointments: appointmentsRouter,
  invoices: invoicesRouter,
  inventory: inventoryRouter,
  stripe: stripeRouter,
  clientPortal: clientPortalRouter,
  users: usersRouter,
  emailConfig: emailConfigRouter,
  alerts: alertsRouter,
  quotes: quotesRouter,
  serviceTypes: serviceTypesRouter,
  organizations: organizationsRouter,
  // TEMPORARILY COMMENTED - Will be rewritten for new multi-tenant model
  // partners: partnersRouter,
  // technicianMetrics: technicianMetricsRouter,
  
  // New multi-tenant system
  partnersV2: partnersV2Router,
  licenses: licensesRouter,
  activationCodes: activationCodesRouter,
  licenseNotifications: licenseNotificationsRouter,
  licenseRenewal: licenseRenewalRouter,
  licenseReminders: licenseRemindersRouter,
  roles: rolesRouter,
  analytics: analyticsRouter,
  onboarding: onboardingRouter,
  aiAssistant: aiAssistantRouter,
  alertSettings: alertSettingsRouter,
  language: languageRouter,
  translations: translationsRouter,
  export: exportRouter,
  whatsapp: whatsappRouter,
  whatsappNotifications: whatsappNotificationsRouter,
  reminders: remindersRouter,
  marketing: marketingRouter,
  pianoTechnical: pianoTechnicalRouter,
  workflows: workflowsRouter,
  settings: settingsRouter,
  notifications: notificationsRouter,
  forecasts: forecastsRouter,
}); // TODO: add more feature routers here

export type AppRouter = typeof appRouter;
