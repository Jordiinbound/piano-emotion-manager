/**
 * Sistema de Alertas Automáticas
 * 
 * Monitorea métricas de caché y notifica al owner cuando se detectan problemas
 */

import { getCacheStats } from './cache';
import { notifyOwner } from './_core/notification';

interface AlertThresholds {
  minHitRate: number; // Porcentaje mínimo de hit rate
  maxLatency: number; // Latencia máxima en ms
}

interface AlertState {
  lastAlertTime: Date | null;
  alertCount: number;
  isInAlertState: boolean;
}

class AlertSystem {
  private thresholds: AlertThresholds = {
    minHitRate: 80, // 80%
    maxLatency: 100, // 100ms
  };

  private state: AlertState = {
    lastAlertTime: null,
    alertCount: 0,
    isInAlertState: false,
  };

  private cooldownPeriod = 5 * 60 * 1000; // 5 minutos entre alertas

  /**
   * Verificar métricas y enviar alertas si es necesario
   */
  async checkAndAlert(): Promise<{ alertsSent: number; issues: string[] }> {
    const stats = getCacheStats();
    const issues: string[] = [];
    let alertsSent = 0;

    // Verificar hit rate
    if (stats.hitRate !== undefined && stats.hitRate < this.thresholds.minHitRate) {
      issues.push(`Hit rate bajo: ${stats.hitRate.toFixed(2)}% (mínimo: ${this.thresholds.minHitRate}%)`);
    }

    // Verificar latencia promedio
    if (stats.avgLatency !== undefined && stats.avgLatency > this.thresholds.maxLatency) {
      issues.push(`Latencia alta: ${stats.avgLatency.toFixed(2)}ms (máximo: ${this.thresholds.maxLatency}ms)`);
    }

    // Si hay problemas, enviar alerta (respetando cooldown)
    if (issues.length > 0) {
      const now = new Date();
      const canSendAlert =
        !this.state.lastAlertTime ||
        now.getTime() - this.state.lastAlertTime.getTime() > this.cooldownPeriod;

      if (canSendAlert) {
        const success = await this.sendAlert(issues, stats);
        if (success) {
          this.state.lastAlertTime = now;
          this.state.alertCount++;
          this.state.isInAlertState = true;
          alertsSent = 1;
        }
      }
    } else {
      // Si no hay problemas, resetear estado de alerta
      if (this.state.isInAlertState) {
        this.state.isInAlertState = false;
        // Opcional: notificar que el sistema se recuperó
        await notifyOwner({
          title: '✅ Sistema de Caché Recuperado',
          content: 'Las métricas del sistema de caché han vuelto a niveles normales.',
        });
      }
    }

    return { alertsSent, issues };
  }

  /**
   * Enviar alerta al owner
   */
  private async sendAlert(issues: string[], stats: any): Promise<boolean> {
    const title = '⚠️ Alerta de Rendimiento del Caché';
    const content = `
Se han detectado problemas de rendimiento en el sistema de caché:

${issues.map((issue) => `• ${issue}`).join('\n')}

**Estadísticas actuales:**
- Hit Rate: ${stats.hitRate?.toFixed(2)}%
- Latencia Promedio: ${stats.avgLatency?.toFixed(2)}ms
- Operaciones Totales: ${stats.totalOperations || 0}
- Modo: ${stats.useMemoryFallback ? 'Memoria (Fallback)' : 'Redis Distribuido'}

**Acciones recomendadas:**
1. Verificar conectividad con Upstash Redis
2. Revisar logs del servidor para errores
3. Considerar aumentar TTL si hit rate es bajo
4. Verificar latencia de red si latencia es alta

Puedes ver más detalles en el dashboard de monitoreo: /monitor-cache
    `.trim();

    return await notifyOwner({ title, content });
  }

  /**
   * Obtener estado actual de alertas
   */
  getState(): AlertState & { thresholds: AlertThresholds } {
    return {
      ...this.state,
      thresholds: this.thresholds,
    };
  }

  /**
   * Configurar umbrales de alerta
   */
  setThresholds(thresholds: Partial<AlertThresholds>) {
    this.thresholds = {
      ...this.thresholds,
      ...thresholds,
    };
  }

  /**
   * Resetear estado de alertas
   */
  reset() {
    this.state = {
      lastAlertTime: null,
      alertCount: 0,
      isInAlertState: false,
    };
  }
}

// Singleton
export const alertSystem = new AlertSystem();

/**
 * Iniciar monitoreo automático de alertas
 * Se ejecuta cada 5 minutos
 */
let alertInterval: NodeJS.Timeout | null = null;

export function startAlertMonitoring() {
  if (alertInterval) {
    return; // Ya está iniciado
  }

  // Ejecutar inmediatamente
  alertSystem.checkAndAlert().catch((error) => {
    console.error('[Alerts] Error en verificación inicial:', error);
  });

  // Ejecutar cada 5 minutos
  alertInterval = setInterval(() => {
    alertSystem.checkAndAlert().catch((error) => {
      console.error('[Alerts] Error en verificación periódica:', error);
    });
  }, 5 * 60 * 1000);

  console.log('[Alerts] Monitoreo automático iniciado (cada 5 minutos)');
}

export function stopAlertMonitoring() {
  if (alertInterval) {
    clearInterval(alertInterval);
    alertInterval = null;
    console.log('[Alerts] Monitoreo automático detenido');
  }
}
