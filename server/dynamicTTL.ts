/**
 * Sistema de TTL Dinámico para Caché
 * Ajusta automáticamente el TTL basado en la frecuencia de actualización de entidades
 */

interface EntityMetadata {
  updateCount: number;
  lastUpdatedAt: number;
  firstTrackedAt: number;
  calculatedTTL: number;
}

/**
 * Configuración de rangos de TTL por tipo de entidad (en segundos)
 */
const TTL_CONFIG = {
  client: {
    min: 60,      // 1 minuto (actualizaciones muy frecuentes)
    max: 600,     // 10 minutos (actualizaciones poco frecuentes)
    default: 300, // 5 minutos
  },
  piano: {
    min: 120,     // 2 minutos
    max: 1200,    // 20 minutos
    default: 600, // 10 minutos
  },
  service: {
    min: 30,      // 30 segundos
    max: 300,     // 5 minutos
    default: 120, // 2 minutos
  },
  forecast: {
    min: 300,     // 5 minutos
    max: 3600,    // 1 hora
    default: 1800, // 30 minutos
  },
} as const;

type EntityType = keyof typeof TTL_CONFIG;

/**
 * Almacenamiento en memoria de metadata de entidades
 */
class DynamicTTLService {
  private metadata: Map<string, EntityMetadata> = new Map();

  /**
   * Genera clave única para una entidad
   */
  private getKey(entityType: EntityType, entityId: string | number): string {
    return `${entityType}:${entityId}`;
  }

  /**
   * Registra una actualización de entidad
   */
  trackUpdate(entityType: EntityType, entityId: string | number): void {
    const key = this.getKey(entityType, entityId);
    const now = Date.now();
    const existing = this.metadata.get(key);

    if (existing) {
      // Incrementar contador de actualizaciones
      existing.updateCount++;
      existing.lastUpdatedAt = now;
      
      // Recalcular TTL basado en frecuencia
      existing.calculatedTTL = this.calculateTTL(entityType, existing);
      
      this.metadata.set(key, existing);
    } else {
      // Primera vez que se trackea esta entidad
      this.metadata.set(key, {
        updateCount: 1,
        lastUpdatedAt: now,
        firstTrackedAt: now,
        calculatedTTL: TTL_CONFIG[entityType].default,
      });
    }
  }

  /**
   * Calcula TTL dinámico basado en frecuencia de actualización
   * 
   * Lógica:
   * - Alta frecuencia de actualización → TTL bajo (datos cambian rápido)
   * - Baja frecuencia de actualización → TTL alto (datos estables)
   */
  private calculateTTL(entityType: EntityType, metadata: EntityMetadata): number {
    const config = TTL_CONFIG[entityType];
    const now = Date.now();
    const ageInSeconds = (now - metadata.firstTrackedAt) / 1000;
    
    // Si la entidad es muy nueva (< 1 hora), usar TTL default
    if (ageInSeconds < 3600) {
      return config.default;
    }
    
    // Calcular frecuencia: actualizaciones por día
    const ageInDays = ageInSeconds / 86400;
    const updatesPerDay = metadata.updateCount / ageInDays;
    
    // Mapear frecuencia a TTL
    // Alta frecuencia (>5 updates/día) → TTL mínimo
    // Baja frecuencia (<1 update/día) → TTL máximo
    if (updatesPerDay > 5) {
      return config.min;
    } else if (updatesPerDay < 1) {
      return config.max;
    } else {
      // Interpolación lineal entre min y max
      const ratio = (5 - updatesPerDay) / 4; // 0 a 1
      return Math.round(config.min + (config.max - config.min) * ratio);
    }
  }

  /**
   * Obtiene el TTL recomendado para una entidad
   */
  getTTL(entityType: EntityType, entityId: string | number): number {
    const key = this.getKey(entityType, entityId);
    const metadata = this.metadata.get(key);
    
    if (!metadata) {
      // Si no hay metadata, usar TTL default
      return TTL_CONFIG[entityType].default;
    }
    
    return metadata.calculatedTTL;
  }

  /**
   * Obtiene estadísticas del sistema de TTL dinámico
   */
  getStats() {
    const stats = {
      totalEntities: this.metadata.size,
      byType: {} as Record<EntityType, number>,
      avgTTL: {} as Record<EntityType, number>,
    };

    // Inicializar contadores
    for (const type of Object.keys(TTL_CONFIG) as EntityType[]) {
      stats.byType[type] = 0;
      stats.avgTTL[type] = 0;
    }

    // Calcular estadísticas
    const ttlSums: Record<EntityType, number> = {
      client: 0,
      piano: 0,
      service: 0,
      forecast: 0,
    };

    for (const [key, metadata] of this.metadata.entries()) {
      const entityType = key.split(':')[0] as EntityType;
      stats.byType[entityType]++;
      ttlSums[entityType] += metadata.calculatedTTL;
    }

    // Calcular promedios
    for (const type of Object.keys(TTL_CONFIG) as EntityType[]) {
      if (stats.byType[type] > 0) {
        stats.avgTTL[type] = Math.round(ttlSums[type] / stats.byType[type]);
      }
    }

    return stats;
  }

  /**
   * Limpia metadata de entidades antiguas (> 30 días sin actualizar)
   */
  cleanup(): number {
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días en ms
    let cleaned = 0;

    for (const [key, metadata] of this.metadata.entries()) {
      if (now - metadata.lastUpdatedAt > maxAge) {
        this.metadata.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Exportar instancia singleton
export const dynamicTTLService = new DynamicTTLService();

/**
 * Helper para obtener TTL dinámico
 */
export function getDynamicTTL(entityType: EntityType, entityId: string | number): number {
  return dynamicTTLService.getTTL(entityType, entityId);
}

/**
 * Helper para trackear actualización
 */
export function trackEntityUpdate(entityType: EntityType, entityId: string | number): void {
  dynamicTTLService.trackUpdate(entityType, entityId);
}
