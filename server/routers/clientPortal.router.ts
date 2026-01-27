/**
 * Client Portal Router
 * Piano Emotion Manager
 * 
 * Endpoints para autenticación y gestión del portal del cliente
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { clientPortalUsers, clientPortalSessions, clients, invoices } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Helper para generar token de sesión
function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

// Helper para verificar sesión
async function verifySession(token: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const sessions = await db
    .select()
    .from(clientPortalSessions)
    .where(
      and(
        eq(clientPortalSessions.token, token),
        // Verificar que no haya expirado
      )
    )
    .limit(1);

  if (!sessions || sessions.length === 0) {
    return null;
  }

  const session = sessions[0];

  // Verificar expiración
  if (new Date(session.expiresAt) < new Date()) {
    // Sesión expirada, eliminarla
    await db.delete(clientPortalSessions).where(eq(clientPortalSessions.id, session.id));
    return null;
  }

  // Obtener usuario
  const users = await db
    .select()
    .from(clientPortalUsers)
    .where(eq(clientPortalUsers.id, session.clientPortalUserId))
    .limit(1);

  if (!users || users.length === 0 || users[0].isActive !== 1) {
    return null;
  }

  return {
    session,
    user: users[0],
  };
}

export const clientPortalRouter = router({
  // Registro de nuevo cliente
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar si el email ya existe
      const existingUsers = await db
        .select()
        .from(clientPortalUsers)
        .where(eq(clientPortalUsers.email, input.email))
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('El email ya está registrado');
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Crear cliente en la tabla clients
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const odId = `od_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await db.insert(clients).values({
        odId,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        address: input.address || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Obtener el ID del cliente recién creado
      const newClients = await db
        .select()
        .from(clients)
        .where(eq(clients.email, input.email))
        .limit(1);

      if (!newClients || newClients.length === 0) {
        throw new Error('Error al crear el cliente');
      }

      const newClient = newClients[0];

      // Crear usuario del portal
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await db.insert(clientPortalUsers).values({
        id: userId,
        clientId: newClient.id.toString(),
        email: input.email,
        passwordHash,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Crear sesión
      const sessionToken = generateSessionToken();
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

      await db.insert(clientPortalSessions).values({
        id: sessionId,
        clientPortalUserId: userId,
        token: sessionToken,
        expiresAt,
        createdAt: new Date(),
      });

      return {
        success: true,
        token: sessionToken,
        user: {
          id: userId,
          email: input.email,
          clientId: newClient.id.toString(),
        },
      };
    }),

  // Login
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Buscar usuario
      const users = await db
        .select()
        .from(clientPortalUsers)
        .where(eq(clientPortalUsers.email, input.email))
        .limit(1);

      if (!users || users.length === 0) {
        throw new Error('Email o contraseña incorrectos');
      }

      const user = users[0];

      // Verificar que el usuario esté activo
      if (user.isActive !== 1) {
        throw new Error('Tu cuenta ha sido desactivada');
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

      if (!isValidPassword) {
        throw new Error('Email o contraseña incorrectos');
      }

      // Actualizar último login
      await db
        .update(clientPortalUsers)
        .set({ lastLoginAt: new Date() })
        .where(eq(clientPortalUsers.id, user.id));

      // Crear sesión
      const sessionToken = generateSessionToken();
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

      await db.insert(clientPortalSessions).values({
        id: sessionId,
        clientPortalUserId: user.id,
        token: sessionToken,
        expiresAt,
        createdAt: new Date(),
      });

      return {
        success: true,
        token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          clientId: user.clientId,
        },
      };
    }),

  // Verificar sesión
  verifySession: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const result = await verifySession(input.token);

      if (!result) {
        throw new Error('Sesión inválida o expirada');
      }

      return {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          clientId: result.user.clientId,
        },
      };
    }),

  // Logout
  logout: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(clientPortalSessions).where(eq(clientPortalSessions.token, input.token));

      return { success: true };
    }),

  // Obtener facturas del cliente
  getInvoices: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const result = await verifySession(input.token);

      if (!result) {
        throw new Error('Sesión inválida o expirada');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener cliente
      const clientsData = await db
        .select()
        .from(clients)
        .where(eq(clients.id, parseInt(result.user.clientId)))
        .limit(1);

      if (!clientsData || clientsData.length === 0) {
        return { invoices: [] };
      }

      const client = clientsData[0];

      // Obtener facturas del cliente
      const clientInvoices = await db
        .select()
        .from(invoices)
        .where(eq(invoices.clientId, client.id))
        .orderBy(desc(invoices.date));

      return {
        invoices: clientInvoices.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          dueDate: invoice.dueDate,
          status: invoice.status,
          subtotal: invoice.subtotal,
          taxAmount: invoice.taxAmount,
          total: invoice.total,
          items: invoice.items,
          notes: invoice.notes,
          paymentToken: invoice.paymentToken,
        })),
      };
    }),
});
