import { getDb } from "../db.js";
import { rolePermissions, userPermissions, users } from "../../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

export type Permission = 
  // Admin permissions
  | 'manage_users'
  | 'manage_roles'
  | 'manage_partners'
  | 'manage_licenses'
  | 'view_analytics'
  | 'manage_organizations'
  | 'manage_all_data'
  // Partner permissions
  | 'view_partner_dashboard'
  | 'manage_activation_codes'
  | 'view_partner_licenses'
  | 'view_partner_stats'
  // Technician permissions
  | 'manage_clients'
  | 'manage_pianos'
  | 'manage_services'
  | 'view_own_data'
  | 'manage_inventory'
  // User permissions
  | 'view_own_profile'
  | 'edit_own_profile';

export type Role = 'user' | 'admin' | 'partner' | 'technician';

/**
 * Verifica si un usuario tiene un permiso específico
 * Considera tanto los permisos del rol como los permisos específicos del usuario
 */
export async function hasPermission(userId: number, permission: Permission): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Obtener el usuario
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return false;

  // Admin siempre tiene todos los permisos
  if (user.role === 'admin') return true;

  // Verificar permisos específicos del usuario (pueden sobreescribir permisos del rol)
  const [userPerm] = await db
    .select()
    .from(userPermissions)
    .where(
      and(
        eq(userPermissions.userId, userId),
        eq(userPermissions.permission, permission)
      )
    )
    .limit(1);

  if (userPerm) {
    return userPerm.granted === 1;
  }

  // Verificar permisos del rol
  const [rolePerm] = await db
    .select()
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.role, user.role as Role),
        eq(rolePermissions.permission, permission)
      )
    )
    .limit(1);

  return !!rolePerm;
}

/**
 * Verifica si un usuario tiene alguno de los permisos especificados
 */
export async function hasAnyPermission(userId: number, permissions: Permission[]): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Verifica si un usuario tiene todos los permisos especificados
 */
export async function hasAllPermissions(userId: number, permissions: Permission[]): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission))) {
      return false;
    }
  }
  return true;
}

/**
 * Obtiene todos los permisos de un usuario
 */
export async function getUserPermissions(userId: number): Promise<Permission[]> {
  const db = await getDb();
  if (!db) return [];

  // Obtener el usuario
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return [];

  // Si es admin, devolver todos los permisos
  if (user.role === 'admin') {
    return [
      'manage_users',
      'manage_roles',
      'manage_partners',
      'manage_licenses',
      'view_analytics',
      'manage_organizations',
      'manage_all_data',
      'view_partner_dashboard',
      'manage_activation_codes',
      'view_partner_licenses',
      'view_partner_stats',
      'manage_clients',
      'manage_pianos',
      'manage_services',
      'view_own_data',
      'manage_inventory',
      'view_own_profile',
      'edit_own_profile',
    ];
  }

  // Obtener permisos del rol
  const rolePerms = await db
    .select()
    .from(rolePermissions)
    .where(eq(rolePermissions.role, user.role as Role));

  // Obtener permisos específicos del usuario
  const userPerms = await db
    .select()
    .from(userPermissions)
    .where(eq(userPermissions.userId, userId));

  // Combinar permisos
  const permissionsMap = new Map<string, boolean>();

  // Agregar permisos del rol
  rolePerms.forEach(p => permissionsMap.set(p.permission, true));

  // Aplicar permisos específicos del usuario (pueden sobreescribir)
  userPerms.forEach(p => permissionsMap.set(p.permission, p.granted === 1));

  // Filtrar solo los permisos granted
  return Array.from(permissionsMap.entries())
    .filter(([_, granted]) => granted)
    .map(([permission]) => permission as Permission);
}
