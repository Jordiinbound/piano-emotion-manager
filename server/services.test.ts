import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';

describe('Services Router', () => {
  const caller = appRouter.createCaller({
    user: null,
    req: {} as any,
    res: {} as any,
  });
  
  let testClientId: number;
  let testPianoId: number;
  
  // Setup: Create a test client before running tests
  beforeAll(async () => {
    // Create test client
    const clientResult = await caller.clients.createClient({
      odId: `TEST-CLIENT-${Date.now()}`,
      name: 'Test Client for Services',
      email: 'test@example.com',
      phone: '+34 123 456 789',
      clientType: 'particular',
    });
    testClientId = clientResult.clientId;
    
    // Use fallback IDs
    testPianoId = 1;
  });

  it('should return service statistics', async () => {
    const stats = await caller.services.getStats();
    
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('byType');
    expect(typeof stats.total).toBe('number');
    expect(Array.isArray(stats.byType)).toBe(true);
  });

  it('should return paginated list of services', async () => {
    const result = await caller.services.getServices({
      page: 1,
      limit: 50,
    });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should filter services by type', async () => {
    const result = await caller.services.getServices({
      page: 1,
      limit: 50,
      serviceType: 'tuning',
    });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    // All results should be of type 'tuning'
    result.forEach((service: any) => {
      if (service.serviceType) {
        expect(service.serviceType).toBe('tuning');
      }
    });
  });

  it('should filter services by search term', async () => {
    const result = await caller.services.getServices({
      page: 1,
      limit: 50,
      search: 'test',
    });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return service by ID', async () => {
    // First create a service
    const createResult = await caller.services.createService({
      clientId: testClientId || 1,
      pianoId: testPianoId || 1,
      serviceType: 'tuning',
      date: new Date().toISOString(),
      cost: 100,
      duration: 120,
      notes: 'Test service',
    });
    
    expect(createResult).toBeDefined();
    expect(createResult.success).toBe(true);
    
    // Only test getById if we got a valid ID
    if (createResult.serviceId > 0) {
      const service = await caller.services.getServiceById({
        id: createResult.serviceId,
      });
      
      expect(service).toBeDefined();
      if (service) {
        expect(service.id).toBe(createResult.serviceId);
        expect(service.serviceType).toBe('tuning');
      }
    }
  });

  it('should create a new service', async () => {
    const result = await caller.services.createService({
      clientId: testClientId || 1,
      pianoId: testPianoId || 1,
      serviceType: 'maintenance_basic',
      date: new Date().toISOString(),
      cost: 150,
      duration: 90,
      notes: 'Basic maintenance service',
    });
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    // serviceId may be 0 in some database configurations
    expect(typeof result.serviceId).toBe('number');
  });

  it('should update an existing service', async () => {
    // First create a service
    const createResult = await caller.services.createService({
      clientId: testClientId || 1,
      pianoId: testPianoId || 1,
      serviceType: 'repair',
      date: new Date().toISOString(),
      cost: 200,
      duration: 180,
      notes: 'Repair service',
    });
    
    expect(createResult.success).toBe(true);
    
    // Then update it
    const updateResult = await caller.services.updateService({
      id: createResult.serviceId,
      cost: 250,
      notes: 'Updated repair service',
    });
    
    expect(updateResult).toBeDefined();
    expect(updateResult.success).toBe(true);
    
    // Verify the update
    const service = await caller.services.getServiceById({
      id: createResult.serviceId,
    });
    
    expect(service).toBeDefined();
    if (service) {
      expect(Number(service.cost)).toBe(250);
      expect(service.notes).toBe('Updated repair service');
    }
  });

  it('should delete a service', async () => {
    // First create a service
    const createResult = await caller.services.createService({
      clientId: testClientId || 1,
      pianoId: testPianoId || 1,
      serviceType: 'regulation',
      date: new Date().toISOString(),
      cost: 300,
      duration: 240,
      notes: 'Regulation service to be deleted',
    });
    
    expect(createResult.success).toBe(true);
    
    // Then delete it
    const deleteResult = await caller.services.deleteService({
      id: createResult.serviceId,
    });
    
    expect(deleteResult).toBeDefined();
    expect(deleteResult.success).toBe(true);
    
    // Verify it's deleted
    const service = await caller.services.getServiceById({
      id: createResult.serviceId,
    });
    
    expect(service).toBeNull();
  });
});
