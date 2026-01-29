/**
 * Performance Monitor
 * 
 * Sistema de monitoreo de rendimiento para queries y operaciones de caché
 */

interface QueryMetrics {
  queryName: string;
  executionTime: number;
  timestamp: Date;
  success: boolean;
}

interface PerformanceStats {
  averageQueryTime: number;
  slowestQuery: { name: string; time: number } | null;
  fastestQuery: { name: string; time: number } | null;
  totalQueries: number;
  failedQueries: number;
  successRate: number;
}

class PerformanceMonitor {
  private queryMetrics: QueryMetrics[] = [];
  private maxMetrics = 1000; // Guardar últimas 1000 queries

  /**
   * Registrar métrica de query
   */
  recordQuery(queryName: string, executionTime: number, success: boolean = true) {
    this.queryMetrics.push({
      queryName,
      executionTime,
      timestamp: new Date(),
      success,
    });

    // Mantener solo las últimas N métricas
    if (this.queryMetrics.length > this.maxMetrics) {
      this.queryMetrics.shift();
    }
  }

  /**
   * Obtener estadísticas de rendimiento
   */
  getStats(): PerformanceStats {
    if (this.queryMetrics.length === 0) {
      return {
        averageQueryTime: 0,
        slowestQuery: null,
        fastestQuery: null,
        totalQueries: 0,
        failedQueries: 0,
        successRate: 100,
      };
    }

    const executionTimes = this.queryMetrics.map((m) => m.executionTime);
    const averageQueryTime =
      executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;

    const sortedMetrics = [...this.queryMetrics].sort(
      (a, b) => b.executionTime - a.executionTime
    );

    const slowest = sortedMetrics[0];
    const fastest = sortedMetrics[sortedMetrics.length - 1];

    const failedQueries = this.queryMetrics.filter((m) => !m.success).length;
    const successRate = ((this.queryMetrics.length - failedQueries) / this.queryMetrics.length) * 100;

    return {
      averageQueryTime: Math.round(averageQueryTime * 100) / 100,
      slowestQuery: { name: slowest.queryName, time: slowest.executionTime },
      fastestQuery: { name: fastest.queryName, time: fastest.executionTime },
      totalQueries: this.queryMetrics.length,
      failedQueries,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  /**
   * Obtener métricas por query
   */
  getQueryBreakdown(): Record<string, { count: number; avgTime: number; successRate: number }> {
    const breakdown: Record<string, { times: number[]; successes: number; total: number }> = {};

    for (const metric of this.queryMetrics) {
      if (!breakdown[metric.queryName]) {
        breakdown[metric.queryName] = { times: [], successes: 0, total: 0 };
      }

      breakdown[metric.queryName].times.push(metric.executionTime);
      breakdown[metric.queryName].total++;
      if (metric.success) {
        breakdown[metric.queryName].successes++;
      }
    }

    const result: Record<string, { count: number; avgTime: number; successRate: number }> = {};

    for (const [queryName, data] of Object.entries(breakdown)) {
      const avgTime = data.times.reduce((sum, time) => sum + time, 0) / data.times.length;
      const successRate = (data.successes / data.total) * 100;

      result[queryName] = {
        count: data.total,
        avgTime: Math.round(avgTime * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
      };
    }

    return result;
  }

  /**
   * Limpiar métricas
   */
  clear() {
    this.queryMetrics = [];
  }

  /**
   * Obtener métricas recientes (últimas N)
   */
  getRecentMetrics(count: number = 100): QueryMetrics[] {
    return this.queryMetrics.slice(-count);
  }
}

// Singleton
export const performanceMonitor = new PerformanceMonitor();

/**
 * Wrapper para medir tiempo de ejecución de funciones
 */
export async function measurePerformance<T>(
  queryName: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  let success = true;

  try {
    const result = await fn();
    return result;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const executionTime = performance.now() - startTime;
    performanceMonitor.recordQuery(queryName, executionTime, success);
  }
}
