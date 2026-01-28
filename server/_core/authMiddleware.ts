import { TRPCError } from "@trpc/server";
import { middleware } from "./trpc.js";
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission } from "./permissions.js";

/**
 * Middleware que verifica si el usuario tiene un permiso específico
 */
export const requirePermission = (permission: Permission) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Debes iniciar sesión para acceder a este recurso",
      });
    }

    const hasAccess = await hasPermission(ctx.user.id, permission);

    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `No tienes permiso para: ${permission}`,
      });
    }

    return next({ ctx });
  });

/**
 * Middleware que verifica si el usuario tiene al menos uno de los permisos especificados
 */
export const requireAnyPermission = (permissions: Permission[]) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Debes iniciar sesión para acceder a este recurso",
      });
    }

    const hasAccess = await hasAnyPermission(ctx.user.id, permissions);

    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Necesitas al menos uno de estos permisos: ${permissions.join(', ')}`,
      });
    }

    return next({ ctx });
  });

/**
 * Middleware que verifica si el usuario tiene todos los permisos especificados
 */
export const requireAllPermissions = (permissions: Permission[]) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Debes iniciar sesión para acceder a este recurso",
      });
    }

    const hasAccess = await hasAllPermissions(ctx.user.id, permissions);

    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Necesitas todos estos permisos: ${permissions.join(', ')}`,
      });
    }

    return next({ ctx });
  });

/**
 * Middleware que verifica si el usuario tiene un rol específico
 */
export const requireRole = (role: 'user' | 'admin' | 'partner' | 'technician') =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Debes iniciar sesión para acceder a este recurso",
      });
    }

    if (ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Este recurso requiere rol: ${role}`,
      });
    }

    return next({ ctx });
  });

/**
 * Middleware que verifica si el usuario es admin
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware que verifica si el usuario es partner
 */
export const requirePartner = requireRole('partner');

/**
 * Middleware que verifica si el usuario es technician
 */
export const requireTechnician = requireRole('technician');
