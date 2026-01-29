/**
 * Tests para Notifications Router
 * Piano Emotion Manager
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers';
import type { inferProcedureInput } from '@trpc/server';
import type { AppRouter } from '../routers';
import { getDb } from '../db';
import { notifications, users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Notifications Router', () => {
  let testUserId: number;
  let testNotificationId: number;

  beforeAll(async () => {
    // Usar ID de usuario existente para evitar problemas de schema
    testUserId = 1; // Asumimos que existe un usuario con ID 1
  });

  it('debe crear una notificación', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    
    type CreateInput = inferProcedureInput<AppRouter['notifications']['create']>;
    const input: CreateInput = {
      userId: testUserId,
      type: 'approval_pending',
      title: 'Test Notification',
      message: 'This is a test notification',
      data: { test: true },
      actionUrl: '/test',
    };

    const result = await caller.notifications.create(input);
    
    expect(result.success).toBe(true);
    expect(result.notificationId).toBeGreaterThan(0);
    
    testNotificationId = result.notificationId;
  });

  it('debe listar notificaciones del usuario', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    
    type ListInput = inferProcedureInput<AppRouter['notifications']['list']>;
    const input: ListInput = {
      userId: testUserId,
      limit: 10,
    };

    const result = await caller.notifications.list(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('type');
  });

  it('debe contar notificaciones no leídas', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    
    type CountInput = inferProcedureInput<AppRouter['notifications']['countUnread']>;
    const input: CountInput = {
      userId: testUserId,
    };

    const result = await caller.notifications.countUnread(input);
    
    expect(result).toHaveProperty('count');
    expect(typeof result.count).toBe('number');
    expect(result.count).toBeGreaterThan(0);
  });

  it('debe marcar notificación como leída', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    
    type MarkAsReadInput = inferProcedureInput<AppRouter['notifications']['markAsRead']>;
    const input: MarkAsReadInput = {
      id: testNotificationId,
    };

    const result = await caller.notifications.markAsRead(input);
    
    expect(result.success).toBe(true);

    // Verificar que se marcó como leída
    const db = await getDb();
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, testNotificationId))
      .limit(1);

    expect(notification.isRead).toBe(1);
    expect(notification.readAt).not.toBeNull();
  });

  it('debe marcar todas las notificaciones como leídas', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    
    // Crear otra notificación no leída
    await caller.notifications.create({
      userId: testUserId,
      type: 'system',
      title: 'Another Test Notification',
    });

    type MarkAllInput = inferProcedureInput<AppRouter['notifications']['markAllAsRead']>;
    const input: MarkAllInput = {
      userId: testUserId,
    };

    const result = await caller.notifications.markAllAsRead(input);
    
    expect(result.success).toBe(true);

    // Verificar que no hay notificaciones no leídas
    const countResult = await caller.notifications.countUnread({ userId: testUserId });
    expect(countResult.count).toBe(0);
  });

  it('debe eliminar una notificación', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    
    type DeleteInput = inferProcedureInput<AppRouter['notifications']['delete']>;
    const input: DeleteInput = {
      id: testNotificationId,
    };

    const result = await caller.notifications.delete(input);
    
    expect(result.success).toBe(true);

    // Verificar que se eliminó
    const db = await getDb();
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, testNotificationId))
      .limit(1);

    expect(notification).toBeUndefined();
  });

  it('debe filtrar solo notificaciones no leídas', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    
    // Crear notificación no leída
    await caller.notifications.create({
      userId: testUserId,
      type: 'workflow_completed',
      title: 'Unread Notification',
    });

    type ListInput = inferProcedureInput<AppRouter['notifications']['list']>;
    const input: ListInput = {
      userId: testUserId,
      unreadOnly: true,
      limit: 10,
    };

    const result = await caller.notifications.list(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.every(n => n.isRead === 0)).toBe(true);
  });
});
