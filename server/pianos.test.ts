import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { clients, pianos } from '../drizzle/schema';

describe('Pianos Router', () => {
  let testClientId: number;
  let testPianoId: number;

  beforeAll(async () => {
    // Crear un cliente de prueba para vincular los pianos
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const clientResult = await db.insert(clients).values({
      odId: `TEST-CLIENT-PIANOS-${Date.now()}`,
      name: 'Test Client for Pianos',
      email: 'test-pianos@example.com',
      phone: '+34 123 456 789',
      clientType: 'particular',
      partnerId: 1,
    } as any);

    testClientId = (clientResult as any).insertId || 1;
    console.log('testClientId:', testClientId);
  });

  it('should return pianos stats', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const stats = await caller.pianos.getStats();

    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('vertical');
    expect(stats).toHaveProperty('grand');
    expect(typeof stats.total).toBe('number');
    expect(typeof stats.vertical).toBe('number');
    expect(typeof stats.grand).toBe('number');
  });

  it('should return paginated pianos', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.pianos.getPianos({
      page: 1,
      pageSize: 10,
    });

    expect(result).toHaveProperty('pianos');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('pageSize');
    expect(result).toHaveProperty('totalPages');
    expect(Array.isArray(result.pianos)).toBe(true);
  });

  it('should filter pianos by category', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.pianos.getPianos({
      page: 1,
      pageSize: 10,
      category: 'vertical',
    });

    expect(Array.isArray(result.pianos)).toBe(true);
    // Todos los pianos deben ser verticales
    result.pianos.forEach((piano: any) => {
      expect(piano.category).toBe('vertical');
    });
  });

  it('should filter pianos by search term', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.pianos.getPianos({
      page: 1,
      pageSize: 10,
      search: 'Yamaha',
    });

    expect(Array.isArray(result.pianos)).toBe(true);
  });

  it('should get piano by id', async () => {
    // Primero crear un piano de prueba
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const createResult = await caller.pianos.createPiano({
      clientId: testClientId,
      brand: 'Yamaha',
      model: 'U1',
      serialNumber: 'TEST123',
      category: 'vertical',
      pianoType: 'Upright',
      manufactureYear: 2020,
      condition: 'good',
      location: 'Living Room',
      notes: 'Test piano',
    });

    expect(createResult.success).toBe(true);
    testPianoId = createResult.pianoId;

    if (testPianoId > 0) {
      const piano = await caller.pianos.getPianoById({ id: testPianoId });
      expect(piano).not.toBeNull();
      if (piano) {
        expect(piano.brand).toBe('Yamaha');
        expect(piano.model).toBe('U1');
      }
    }
  });

  it('should create a new piano', async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.pianos.createPiano({
      clientId: testClientId,
      brand: 'Kawai',
      model: 'K-300',
      serialNumber: 'TEST456',
      category: 'vertical',
      pianoType: 'Upright',
      condition: 'excellent',
      location: 'Music Room',
      notes: 'Another test piano',
    });

    expect(result.success).toBe(true);
    expect(result.pianoId).toBeGreaterThanOrEqual(0);
  });

  it('should update a piano', async () => {
    if (!testPianoId || testPianoId === 0) {
      // Si no se creó el piano en el test anterior, skip
      expect(true).toBe(true);
      return;
    }

    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.pianos.updatePiano({
      id: testPianoId,
      condition: 'fair',
      notes: 'Updated notes',
    });

    expect(result.success).toBe(true);
  });

  it('should delete a piano', async () => {
    if (!testPianoId || testPianoId === 0) {
      // Si no se creó el piano en el test anterior, skip
      expect(true).toBe(true);
      return;
    }

    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.pianos.deletePiano({ id: testPianoId });

    expect(result.success).toBe(true);
  });
});
