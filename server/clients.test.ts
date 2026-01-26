import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('Clients Router', () => {
  const caller = appRouter.createCaller({
    user: undefined,
    req: {} as any,
    res: {} as any,
  });

  describe('getStats', () => {
    it('should return client statistics', async () => {
      const stats = await caller.clients.getStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('vip');
      expect(stats).toHaveProperty('withPianos');
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.active).toBe('number');
      expect(typeof stats.vip).toBe('number');
      expect(typeof stats.withPianos).toBe('number');
    });
  });

  describe('getClients', () => {
    it('should return paginated clients list', async () => {
      const result = await caller.clients.getClients({
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveProperty('clients');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('pageSize');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.clients)).toBe(true);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should filter clients by search term', async () => {
      const result = await caller.clients.getClients({
        page: 1,
        pageSize: 10,
        search: 'test',
      });

      expect(result).toHaveProperty('clients');
      expect(Array.isArray(result.clients)).toBe(true);
    });

    it('should filter clients by region', async () => {
      const result = await caller.clients.getClients({
        page: 1,
        pageSize: 10,
        region: 'Madrid',
      });

      expect(result).toHaveProperty('clients');
      expect(Array.isArray(result.clients)).toBe(true);
    });
  });

  describe('getFilterOptions', () => {
    it('should return unique filter options', async () => {
      const options = await caller.clients.getFilterOptions();

      expect(options).toHaveProperty('regions');
      expect(options).toHaveProperty('cities');
      expect(options).toHaveProperty('routeGroups');
      expect(Array.isArray(options.regions)).toBe(true);
      expect(Array.isArray(options.cities)).toBe(true);
      expect(Array.isArray(options.routeGroups)).toBe(true);
    });
  });

  describe('createClient', () => {
    it('should create a new client', async () => {
      const result = await caller.clients.createClient({
        odId: `test-${Date.now()}`,
        name: 'Test Client',
        email: 'test@example.com',
        phone: '+34 123 456 789',
        address: 'Calle Test 123',
        city: 'Madrid',
        region: 'Comunidad de Madrid',
        clientType: 'particular',
        partnerId: 1,
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('clientId');
      expect(result.success).toBe(true);
      expect(typeof result.clientId).toBe('number');
    });
  });
});
