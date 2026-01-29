/**
 * Sistema de caché en memoria para optimizar consultas frecuentes
 * Especialmente útil para previsiones que se calculan en cada carga del dashboard
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Obtener dato del caché
   * @param key Clave única del dato
   * @returns Dato si existe y no ha expirado, null si no existe o expiró
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Si el dato expiró, eliminarlo y retornar null
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Guardar dato en el caché
   * @param key Clave única del dato
   * @param data Dato a guardar
   * @param ttl Time to live en milisegundos (default: 5 minutos)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidar (eliminar) un dato específico del caché
   * @param key Clave del dato a invalidar
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidar todos los datos que coincidan con un patrón
   * @param pattern Patrón regex o string para buscar claves
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Instancia singleton del caché
export const cache = new MemoryCache();

/**
 * Helper para usar caché en procedimientos tRPC
 * @param key Clave única del caché
 * @param fn Función que genera el dato si no está en caché
 * @param ttl Time to live en milisegundos (default: 5 minutos)
 * @returns Dato del caché o resultado de la función
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Intentar obtener del caché
  const cached = cache.get<T>(key);
  if (cached !== null) {
    console.log(`[Cache] HIT: ${key}`);
    return cached;
  }

  // Si no está en caché, ejecutar función
  console.log(`[Cache] MISS: ${key}`);
  const result = await fn();

  // Guardar en caché
  cache.set(key, result, ttl);

  return result;
}
