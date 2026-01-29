/**
 * Sistema de tracking histórico de métricas de caché
 * Guarda snapshots cada hora para análisis de tendencias
 * Datos almacenados en memoria (se pierden al reiniciar el servidor)
 */

interface MetricsSnapshot {
  timestamp: number;
  hits: number;
  misses: number;
  hitRate: number;
  avgLatency: number;
  totalOperations: number;
  sets: number;
  deletes: number;
  memoryCacheSize: number;
  mode: 'memory' | 'redis';
  isConnected: boolean;
}

class MetricsHistoryService {
  private history: MetricsSnapshot[] = [];
  private maxSnapshots = 168; // 7 días de snapshots horarios
  private lastSnapshotTime = 0;
  private snapshotInterval = 60 * 60 * 1000; // 1 hora en milisegundos

  /**
   * Guardar snapshot de métricas actuales
   */
  saveSnapshot(metrics: Omit<MetricsSnapshot, 'timestamp'>): void {
    const now = Date.now();
    
    // Solo guardar si ha pasado el intervalo mínimo
    if (now - this.lastSnapshotTime < this.snapshotInterval) {
      return;
    }

    const snapshot: MetricsSnapshot = {
      ...metrics,
      timestamp: now,
    };

    this.history.push(snapshot);
    this.lastSnapshotTime = now;

    // Mantener solo los últimos N snapshots
    if (this.history.length > this.maxSnapshots) {
      this.history.shift();
    }

    console.log(`[MetricsHistory] Snapshot guardado: ${this.history.length} snapshots en historial`);
  }

  /**
   * Obtener historial completo
   */
  getHistory(): MetricsSnapshot[] {
    return [...this.history];
  }

  /**
   * Obtener historial de las últimas N horas
   */
  getRecentHistory(hours: number): MetricsSnapshot[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    return this.history.filter(s => s.timestamp >= cutoffTime);
  }

  /**
   * Obtener estadísticas del historial
   */
  getHistoryStats() {
    if (this.history.length === 0) {
      return null;
    }

    const avgHitRate = this.history.reduce((sum, s) => sum + s.hitRate, 0) / this.history.length;
    const avgLatency = this.history.reduce((sum, s) => sum + s.avgLatency, 0) / this.history.length;
    const totalOps = this.history.reduce((sum, s) => sum + s.totalOperations, 0);

    return {
      snapshotCount: this.history.length,
      oldestSnapshot: new Date(this.history[0].timestamp),
      newestSnapshot: new Date(this.history[this.history.length - 1].timestamp),
      avgHitRate: parseFloat(avgHitRate.toFixed(2)),
      avgLatency: parseFloat(avgLatency.toFixed(2)),
      totalOperations: totalOps,
    };
  }

  /**
   * Limpiar historial
   */
  clearHistory(): void {
    this.history = [];
    this.lastSnapshotTime = 0;
    console.log('[MetricsHistory] Historial limpiado');
  }
}

// Instancia singleton
const metricsHistoryService = new MetricsHistoryService();

// Exportar funciones
export const saveMetricsSnapshot = (metrics: Omit<MetricsSnapshot, 'timestamp'>) => 
  metricsHistoryService.saveSnapshot(metrics);

export const getMetricsHistory = () => 
  metricsHistoryService.getHistory();

export const getRecentMetricsHistory = (hours: number) => 
  metricsHistoryService.getRecentHistory(hours);

export const getMetricsHistoryStats = () => 
  metricsHistoryService.getHistoryStats();

export const clearMetricsHistory = () => 
  metricsHistoryService.clearHistory();
