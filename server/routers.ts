import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
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

  // TODO: add more feature routers here
});

export type AppRouter = typeof appRouter;
