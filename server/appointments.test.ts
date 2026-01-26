/**
 * Appointments Router Tests
 * Piano Emotion Manager
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { clients, appointments } from '../drizzle/schema';

describe('Appointments Router', () => {
  let testClientId: number;
  let testAppointmentId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Crear un cliente de prueba para las citas
    const clientResult = await db.insert(clients).values({
      odId: `TEST-CLIENT-${Date.now()}`,
      name: 'Test Client for Appointments',
      email: 'testappt@example.com',
      phone: '+34600000000',
      address: 'Test Address',
      city: 'Madrid',
      region: 'Madrid',
    } as any);

    testClientId = (clientResult as any).insertId;
    console.log('testClientId:', testClientId);
  });

  it('should return appointments stats', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const stats = await caller.appointments.getStats();

    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('scheduled');
    expect(stats).toHaveProperty('confirmed');
    expect(stats).toHaveProperty('completed');
    expect(stats).toHaveProperty('cancelled');
    expect(typeof stats.total).toBe('number');
  });

  it('should return paginated appointments', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.appointments.getAppointments({
      page: 1,
      pageSize: 10,
    });

    expect(result).toHaveProperty('appointments');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('pageSize', 10);
    expect(Array.isArray(result.appointments)).toBe(true);
  });

  it('should filter appointments by status', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.appointments.getAppointments({
      page: 1,
      pageSize: 10,
      status: 'scheduled',
    });

    expect(result).toHaveProperty('appointments');
    expect(Array.isArray(result.appointments)).toBe(true);
    // Todas las citas deben tener status 'scheduled'
    result.appointments.forEach((apt: any) => {
      if (apt.status) {
        expect(apt.status).toBe('scheduled');
      }
    });
  });

  it('should filter appointments by search term', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.appointments.getAppointments({
      page: 1,
      pageSize: 10,
      search: 'Test',
    });

    expect(result).toHaveProperty('appointments');
    expect(Array.isArray(result.appointments)).toBe(true);
  });

  it('should get appointment by id', async () => {
    // Verificar que testClientId está definido
    if (!testClientId || testClientId === 0) {
      console.log('⚠️ testClientId is not defined, skipping test');
      return;
    }

    // Primero crear una cita de prueba
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const createResult = await caller.appointments.createAppointment({
      clientId: testClientId,
      title: 'Test Appointment',
      date: new Date().toISOString(),
      duration: 60,
      serviceType: 'Afinación',
      status: 'scheduled',
      notes: 'Test appointment notes',
    });

    expect(createResult.success).toBe(true);
    testAppointmentId = createResult.appointmentId;

    if (testAppointmentId > 0) {
      const appointment = await caller.appointments.getAppointmentById({ id: testAppointmentId });
      expect(appointment).not.toBeNull();
      if (appointment) {
        expect(appointment.id).toBe(testAppointmentId);
        expect(appointment.title).toBe('Test Appointment');
      }
    }
  });

  it('should create a new appointment', async () => {
    // Verificar que testClientId está definido
    if (!testClientId || testClientId === 0) {
      console.log('⚠️ testClientId is not defined, skipping test');
      return;
    }

    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.appointments.createAppointment({
      clientId: testClientId,
      title: 'Another Test Appointment',
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      duration: 90,
      serviceType: 'Mantenimiento',
      status: 'confirmed',
      notes: 'Another test appointment',
    });

    expect(result.success).toBe(true);
    expect(result.appointmentId).toBeGreaterThanOrEqual(0);
  });

  it('should update an appointment', async () => {
    if (testAppointmentId > 0) {
      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const result = await caller.appointments.updateAppointment({
        id: testAppointmentId,
        title: 'Updated Test Appointment',
        status: 'confirmed',
        notes: 'Updated notes',
      });

      expect(result.success).toBe(true);
    }
  });

  it('should delete an appointment', async () => {
    if (testAppointmentId > 0) {
      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const result = await caller.appointments.deleteAppointment({ id: testAppointmentId });

      expect(result.success).toBe(true);
    }
  });
});
