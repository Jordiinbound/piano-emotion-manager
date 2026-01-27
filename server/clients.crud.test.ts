import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from './db.js';
import { clients } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

describe('Clients CRUD Operations with TiDB', () => {
  let testClientId: number;
  const testClient = {
    name: 'Test CRUD Client',
    email: 'crud@test.com',
    phone: '+34 999 888 777',
    address: 'Test Street 123',
    clientType: 'particular' as const,
    notes: 'Test client for CRUD operations',
    region: 'Test Region',
    city: 'Test City',
    postalCode: '99999',
    routeGroup: 'Test Route',
  };

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    // Limpiar cualquier cliente de prueba previo
    await db.delete(clients).where(eq(clients.email, testClient.email));
  });

  it('CREATE: should create a new client', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const odId = `CLI-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    await db.insert(clients).values({
      odId,
      ...testClient,
      partnerId: 1,
    } as any);

    // Obtener el ID del cliente recién creado
    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.email, testClient.email));

    expect(result).toHaveLength(1);
    testClientId = result[0].id;
    expect(testClientId).toBeGreaterThan(0);
  });

  it('READ: should read the created client', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.id, testClientId));

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe(testClient.name);
    expect(result[0].email).toBe(testClient.email);
    expect(result[0].phone).toBe(testClient.phone);
    expect(result[0].clientType).toBe(testClient.clientType);
  });

  it('UPDATE: should update the client', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const updatedData = {
      name: 'Updated CRUD Client',
      phone: '+34 111 222 333',
      notes: 'Updated notes for CRUD test',
    };

    await db
      .update(clients)
      .set(updatedData)
      .where(eq(clients.id, testClientId));

    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.id, testClientId));

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe(updatedData.name);
    expect(result[0].phone).toBe(updatedData.phone);
    expect(result[0].notes).toBe(updatedData.notes);
    // Email should remain unchanged
    expect(result[0].email).toBe(testClient.email);
  });

  it('DELETE: should delete the client', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    await db.delete(clients).where(eq(clients.id, testClientId));

    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.id, testClientId));

    expect(result).toHaveLength(0);
  });

  it('VERIFY: should confirm client no longer exists', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.email, testClient.email));

    expect(result).toHaveLength(0);
  });
});
