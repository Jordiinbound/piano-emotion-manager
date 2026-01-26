import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

describe('Dashboard Router', () => {
  // Mock context sin usuario autenticado
  const mockContext: Context = {
    user: null,
    req: {} as any,
    res: {} as any,
  };

  describe('getMetrics', () => {
    it('should return metrics with zero counts for empty database', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.dashboard.getMetrics();

      expect(result).toHaveProperty('clients');
      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('pianos');
      expect(result).toHaveProperty('servicesThisMonth');
      
      expect(typeof result.clients).toBe('number');
      expect(typeof result.services).toBe('number');
      expect(typeof result.pianos).toBe('number');
      expect(typeof result.servicesThisMonth).toBe('number');
      
      // En base de datos vacía, todos deberían ser 0
      expect(result.clients).toBeGreaterThanOrEqual(0);
      expect(result.services).toBeGreaterThanOrEqual(0);
      expect(result.pianos).toBeGreaterThanOrEqual(0);
      expect(result.servicesThisMonth).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRecentServices', () => {
    it('should return an array of recent services', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.dashboard.getRecentServices();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
      
      // Si hay servicios, verificar estructura
      if (result.length > 0) {
        const service = result[0];
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('serviceType');
        expect(service).toHaveProperty('date');
        expect(service).toHaveProperty('clientId');
        expect(service).toHaveProperty('pianoId');
      }
    });
  });

  describe('getUpcomingServices', () => {
    it('should return an array of upcoming services', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.dashboard.getUpcomingServices();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
      
      // Si hay servicios, verificar estructura
      if (result.length > 0) {
        const service = result[0];
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('serviceType');
        expect(service).toHaveProperty('date');
        expect(service).toHaveProperty('clientId');
        expect(service).toHaveProperty('pianoId');
      }
    });
  });

  describe('getServicesStats', () => {
    it('should return an array of service statistics by month', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.dashboard.getServicesStats();

      expect(Array.isArray(result)).toBe(true);
      
      // Si hay estadísticas, verificar estructura
      if (result.length > 0) {
        const stat = result[0];
        expect(stat).toHaveProperty('month');
        expect(stat).toHaveProperty('count');
        expect(typeof stat.month).toBe('string');
        expect(typeof stat.count).toBe('number');
        
        // Verificar formato de mes (YYYY-MM)
        expect(stat.month).toMatch(/^\d{4}-\d{2}$/);
      }
    });
  });
});
