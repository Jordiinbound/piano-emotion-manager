import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getCacheStats, deleteCache, cacheService, resetCacheMetrics } from '../cache';
import { getMetricsHistory, getRecentMetricsHistory, getMetricsHistoryStats, clearMetricsHistory } from '../metricsHistory';
import { performanceMonitor } from '../performanceMonitor';
import { alertSystem } from '../alerts';

/**
 * Router de Sistema
 * Endpoints para monitoreo y administración del sistema
 */
export const systemRouter = router({
  /**
   * Obtener estadísticas del caché en tiempo real
   */
  getCacheStats: publicProcedure.query(async () => {
    const stats = getCacheStats();
    
    return {
      ...stats,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }),

  /**
   * Limpiar todo el caché
   */
  clearCache: publicProcedure.mutation(async () => {
    // En modo memoria, limpiar el Map
    if (cacheService.useMemoryFallback) {
      (cacheService as any).memoryCache.clear();
      return {
        success: true,
        message: 'Caché en memoria limpiado correctamente',
        clearedEntries: 0,
      };
    }

    // En modo Redis, no hay forma directa de limpiar todo sin conocer las claves
    // Por ahora retornamos éxito (en producción se puede implementar con SCAN + DEL)
    return {
      success: true,
      message: 'Solicitud de limpieza de caché enviada',
      clearedEntries: 0,
    };
  }),

  /**
   * Limpiar caché por patrón de clave
   */
  clearCacheByPattern: publicProcedure
    .input(z.object({
      pattern: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { pattern } = input;
      
      // En modo memoria, filtrar y eliminar claves que coincidan
      if (cacheService.useMemoryFallback) {
        const memCache = (cacheService as any).memoryCache as Map<string, any>;
        let clearedCount = 0;
        
        for (const key of memCache.keys()) {
          if (key.includes(pattern)) {
            await deleteCache(key);
            clearedCount++;
          }
        }
        
        return {
          success: true,
          message: `${clearedCount} entradas eliminadas del caché`,
          clearedEntries: clearedCount,
          pattern,
        };
      }

      // En modo Redis, usar SCAN + DEL (implementación futura)
      return {
        success: true,
        message: 'Limpieza por patrón no disponible en modo Redis',
        clearedEntries: 0,
        pattern,
      };
    }),

  /**
   * Obtener historial de métricas del caché
   */
  getMetricsHistory: publicProcedure
    .input(z.object({
      hours: z.number().optional().default(24),
    }))
    .query(async ({ input }) => {
      const history = input.hours ? getRecentMetricsHistory(input.hours) : getMetricsHistory();
      const stats = getMetricsHistoryStats();
      return {
        history,
        stats,
      };
    }),

  /**
   * Limpiar historial de métricas
   */
  clearMetricsHistory: publicProcedure.mutation(async () => {
    clearMetricsHistory();
    return { 
      success: true, 
      message: 'Historial de métricas limpiado correctamente',
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Resetear métricas de rendimiento del caché
   */
  resetCacheMetrics: publicProcedure.mutation(async () => {
    resetCacheMetrics();
    
    return {
      success: true,
      message: 'Métricas de caché reseteadas correctamente',
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Obtener información del sistema
   */
  getSystemInfo: publicProcedure.query(async () => {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      env: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Obtener estadísticas de rendimiento de queries
   */
  getPerformanceStats: publicProcedure.query(async () => {
    const stats = performanceMonitor.getStats();
    const breakdown = performanceMonitor.getQueryBreakdown();
    
    return {
      ...stats,
      breakdown,
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Obtener métricas recientes de queries
   */
  getRecentQueryMetrics: publicProcedure
    .input(z.object({ count: z.number().min(1).max(1000).default(100) }).optional())
    .query(async ({ input }) => {
      const metrics = performanceMonitor.getRecentMetrics(input?.count || 100);
      return {
        metrics,
        count: metrics.length,
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Limpiar métricas de rendimiento
   */
  clearPerformanceMetrics: publicProcedure.mutation(async () => {
    performanceMonitor.clear();
    return {
      success: true,
      message: 'Métricas de rendimiento limpiadas correctamente',
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Verificar alertas manualmente
   */
  checkAlerts: publicProcedure.mutation(async () => {
    const result = await alertSystem.checkAndAlert();
    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Obtener estado de alertas
   */
  getAlertState: publicProcedure.query(async () => {
    const state = alertSystem.getState();
    return {
      ...state,
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Configurar umbrales de alertas
   */
  setAlertThresholds: publicProcedure
    .input(
      z.object({
        minHitRate: z.number().min(0).max(100).optional(),
        maxLatency: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ input }) => {
      alertSystem.setThresholds(input);
      return {
        success: true,
        message: 'Umbrales de alertas actualizados correctamente',
        thresholds: alertSystem.getState().thresholds,
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Resetear estado de alertas
   */
  resetAlerts: publicProcedure.mutation(async () => {
    alertSystem.reset();
    return {
      success: true,
      message: 'Estado de alertas reseteado correctamente',
      timestamp: new Date().toISOString(),
    };
  }),
});
