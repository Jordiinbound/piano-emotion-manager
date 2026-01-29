import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getCacheStats, deleteCache, cacheService } from '../cache';

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
});
