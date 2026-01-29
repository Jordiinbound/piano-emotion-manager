/**
 * Sistema de caché distribuido con Upstash Redis
 * Con fallback automático a caché en memoria si Redis no está disponible
 * Soporta hasta 2500 usuarios concurrentes con caché distribuido
 */

import { Redis } from '@upstash/redis';
import { monitoring } from './monitoring.js';

/**
 * Servicio de caché distribuido usando Upstash Redis
 * Con fallback a caché en memoria si Redis no está disponible
 */
class CacheService {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private useMemoryFallback: boolean = false;
  private memoryCache: Map<string, { value: any; expiry: number }> = new Map();
  private connectPromise: Promise<void> | null = null;

  constructor() {
    console.log('[Cache Service] 🚀 Service initialized', {
      nodeEnv: process.env.NODE_ENV,
      hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN
    });
  }

  /**
   * Verificar si las variables de entorno están disponibles
   */
  private hasRedisEnvVars(): boolean {
    return !!(process.env.UPSTASH_REDIS_REST_URL?.trim() && 
              process.env.UPSTASH_REDIS_REST_TOKEN?.trim());
  }

  /**
   * Inicializar conexión a Upstash Redis
   */
  async connect(): Promise<void> {
    console.log('[Cache Service] 🔌 Attempting to connect to Redis');
    
    try {
      // En desarrollo, usar memoria por defecto para evitar latencia de red
      if (process.env.NODE_ENV === 'development') {
        console.log('🟡 [Cache Service] Development mode: using memory cache for fast performance');
        console.log('🔵 [Cache Service] Production will use Upstash Redis (configured)');
        this.useMemoryFallback = true;
        this.isConnected = true;
        return;
      }

      // Verificar variables de entorno
      if (!this.hasRedisEnvVars()) {
        console.warn('⚠️  [Cache Service] Redis env vars not available, using memory fallback');
        this.useMemoryFallback = true;
        this.isConnected = true;
        return;
      }

      const redisUrl = process.env.UPSTASH_REDIS_REST_URL!.trim();
      const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN!.trim();

      // Crear cliente de Upstash Redis (REST API)
      this.client = new Redis({
        url: redisUrl,
        token: redisToken,
      });

      // Verificar conexión con un ping
      try {
        console.log('[Cache Service] Pinging Redis...');
        const pingResult = await this.client.ping();
        console.log('✅ [Cache Service] Redis connected successfully', { pingResult });
        this.isConnected = true;
        this.useMemoryFallback = false;
      } catch (pingError) {
        console.error('❌ [Cache Service] Redis ping failed, using memory fallback', {
          error: pingError instanceof Error ? pingError.message : String(pingError)
        });
        this.client = null;
        this.useMemoryFallback = true;
        this.isConnected = true;
      }
    } catch (error) {
      console.error('❌ [Cache Service] Failed to connect to Redis', {
        error: error instanceof Error ? error.message : String(error)
      });
      this.client = null;
      this.useMemoryFallback = true;
      this.isConnected = true;
    }
  }

  /**
   * Asegurar que está conectado (lazy initialization)
   */
  private async ensureConnected(): Promise<void> {
    // Si ya está usando memory fallback, no reintentar
    if (this.useMemoryFallback) {
      return;
    }
    
    // Si ya está conectado con cliente activo, verificar env vars
    if (this.isConnected && this.client) {
      // Verificar que las env vars sigan disponibles
      if (!this.hasRedisEnvVars()) {
        console.warn('⚠️  [Cache Service] Redis env vars disappeared, switching to memory fallback');
        this.client = null;
        this.useMemoryFallback = true;
      }
      return;
    }
    
    // Si hay una conexión en progreso, esperarla
    if (this.connectPromise) {
      return this.connectPromise;
    }
    
    // Intentar conectar
    this.connectPromise = this.connect();
    await this.connectPromise;
    this.connectPromise = null;
  }

  /**
   * Obtener valor del caché
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      await this.ensureConnected();

      if (this.useMemoryFallback || !this.client) {
        return this.getFromMemory<T>(key);
      }

      const value = await this.client.get<T>(key);
      const duration = Date.now() - startTime;
      
      if (value !== null) {
        console.log(`[Cache Service] GET HIT: ${key} (${duration}ms)`);
        monitoring.trackCacheOperation('hit', key, duration);
      } else {
        monitoring.trackCacheOperation('miss', key, duration);
      }
      
      return value;
    } catch (error) {
      console.error('[Cache Service] GET error, falling back to memory', {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      return this.getFromMemory<T>(key);
    }
  }

  /**
   * Establecer valor en el caché
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const startTime = Date.now();
    
    try {
      await this.ensureConnected();

      if (this.useMemoryFallback || !this.client) {
        return this.setInMemory(key, value, ttlSeconds);
      }

      await this.client.set(key, value, { ex: ttlSeconds });
      const duration = Date.now() - startTime;
      console.log(`[Cache Service] SET: ${key} (${duration}ms, TTL: ${ttlSeconds}s)`);
      monitoring.trackCacheOperation('set', key, duration);
    } catch (error) {
      console.error('[Cache Service] SET error, falling back to memory', {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      return this.setInMemory(key, value, ttlSeconds);
    }
  }

  /**
   * Eliminar valor del caché
   */
  async del(key: string): Promise<void> {
    try {
      await this.ensureConnected();

      if (this.useMemoryFallback || !this.client) {
        this.memoryCache.delete(key);
        return;
      }

      await this.client.del(key);
      console.log(`[Cache Service] DEL: ${key}`);
    } catch (error) {
      console.error('[Cache Service] DEL error', {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      this.memoryCache.delete(key);
    }
  }

  /**
   * Limpiar todo el caché
   */
  async clear(): Promise<void> {
    try {
      await this.ensureConnected();

      if (this.useMemoryFallback || !this.client) {
        this.memoryCache.clear();
        console.log('[Cache Service] Memory cache cleared');
        return;
      }

      // Para Upstash Redis, solo limpiamos memoria local
      // FLUSHDB requiere permisos especiales
      this.memoryCache.clear();
      console.log('[Cache Service] Cache cleared (memory only)');
    } catch (error) {
      console.error('[Cache Service] CLEAR error', {
        error: error instanceof Error ? error.message : String(error)
      });
      this.memoryCache.clear();
    }
  }

  /**
   * Obtener valor del caché en memoria
   */
  private getFromMemory<T>(key: string): T | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;

    // Verificar si ha expirado
    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  /**
   * Establecer valor en el caché en memoria
   */
  private setInMemory(key: string, value: any, ttlSeconds: number): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.memoryCache.set(key, { value, expiry });
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    return {
      isConnected: this.isConnected,
      useMemoryFallback: this.useMemoryFallback,
      memoryCacheSize: this.memoryCache.size,
      hasClient: !!this.client,
      hasRedisEnvVars: this.hasRedisEnvVars()
    };
  }
}

// Exportar instancia singleton
const cacheService = new CacheService();

// ============================================================================
// API PÚBLICA - Funciones helper para compatibilidad con código existente
// ============================================================================

/**
 * Obtener dato del caché (Redis o memoria)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  return cacheService.get<T>(key);
}

/**
 * Guardar dato en caché (Redis o memoria)
 */
export async function setCache<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  return cacheService.set(key, data, ttlSeconds);
}

/**
 * Eliminar dato del caché (Redis o memoria)
 */
export async function deleteCache(key: string): Promise<void> {
  return cacheService.del(key);
}

/**
 * Limpiar todo el caché (solo memoria, Redis requiere flush manual)
 */
export async function clearCache(): Promise<void> {
  return cacheService.clear();
}

/**
 * Helper para envolver funciones con caché automático
 */
export function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): () => Promise<T> {
  return async () => {
    // Intentar obtener del caché
    const cached = await getCache<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Si no está en caché, ejecutar función
    const result = await fn();

    // Guardar en caché
    await setCache(key, result, ttlSeconds);

    return result;
  };
}

/**
 * Obtener estadísticas del caché
 */
export function getCacheStats() {
  return cacheService.getStats();
}

// Exportar también el servicio para uso avanzado
export { cacheService };
