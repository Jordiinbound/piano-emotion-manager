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

  // TODO: add more feature routers here
});

export type AppRouter = typeof appRouter;
