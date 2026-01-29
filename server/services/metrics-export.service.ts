/**
 * Servicio de Exportación de Métricas
 * 
 * Proporciona funcionalidades para exportar métricas de caché a CSV y PDF
 */

import { getCacheStats } from '../cache';
import { getMetricsHistory, getRecentMetricsHistory } from '../metricsHistory';

/**
 * Interfaz para los datos de exportación
 */
export interface ExportMetricsData {
  timestamp: string;
  cacheStats: ReturnType<typeof getCacheStats>;
  history: ReturnType<typeof getRecentMetricsHistory>;
  timeRange: number;
}

/**
 * Genera un archivo CSV con las métricas de caché
 */
export function generateMetricsCSV(data: ExportMetricsData): string {
  const { cacheStats, history, timeRange } = data;
  
  // Header del CSV
  let csv = 'Piano Emotion Manager - Reporte de Métricas de Caché\n';
  csv += `Generado: ${new Date(data.timestamp).toLocaleString('es-ES')}\n`;
  csv += `Rango temporal: ${timeRange} horas\n`;
  csv += '\n';
  
  // Sección: Resumen General
  csv += 'RESUMEN GENERAL\n';
  csv += 'Métrica,Valor\n';
  csv += `Estado de Conexión,${cacheStats.isConnected ? 'Conectado' : 'Desconectado'}\n`;
  csv += `Modo,${cacheStats.useMemoryFallback ? 'Memoria (Desarrollo)' : 'Redis (Producción)'}\n`;
  csv += `Entradas en Caché,${cacheStats.memoryCacheSize || 0}\n`;
  csv += `Entorno,${cacheStats.environment || 'N/A'}\n`;
  csv += '\n';
  
  // Sección: Métricas de Rendimiento
  if (cacheStats.metrics) {
    csv += 'MÉTRICAS DE RENDIMIENTO\n';
    csv += 'Métrica,Valor\n';
    csv += `Cache Hits,${cacheStats.metrics.hits}\n`;
    csv += `Cache Misses,${cacheStats.metrics.misses}\n`;
    csv += `Hit Rate,${cacheStats.metrics.hitRate.toFixed(2)}%\n`;
    csv += `Latencia Promedio,${cacheStats.metrics.avgLatency.toFixed(2)} ms\n`;
    csv += `Total Operaciones,${cacheStats.metrics.totalOperations}\n`;
    csv += `Sets,${cacheStats.metrics.sets}\n`;
    csv += `Deletes,${cacheStats.metrics.deletes}\n`;
    csv += `Uptime,${Math.floor(cacheStats.metrics.uptime / 60)} minutos\n`;
    csv += '\n';
  }
  
  // Sección: Historial de Snapshots
  if (history && history.length > 0) {
    csv += 'HISTORIAL DE SNAPSHOTS\n';
    csv += 'Timestamp,Hit Rate (%),Latencia (ms),Total Operaciones,Hits,Misses,Sets,Deletes\n';
    
    history.forEach((snapshot: any) => {
      const date = new Date(snapshot.timestamp).toLocaleString('es-ES');
      csv += `${date},`;
      csv += `${snapshot.hitRate.toFixed(2)},`;
      csv += `${snapshot.avgLatency.toFixed(2)},`;
      csv += `${snapshot.totalOperations},`;
      csv += `${snapshot.hits},`;
      csv += `${snapshot.misses},`;
      csv += `${snapshot.sets},`;
      csv += `${snapshot.deletes}\n`;
    });
  }
  
  return csv;
}

/**
 * Genera contenido HTML para el reporte PDF
 */
export function generateMetricsPDFHTML(data: ExportMetricsData): string {
  const { cacheStats, history, timeRange } = data;
  
  // Calcular estadísticas del historial
  let avgHitRate = 0;
  let avgLatency = 0;
  let totalOps = 0;
  
  if (history && history.length > 0) {
    avgHitRate = history.reduce((sum: number, s: any) => sum + s.hitRate, 0) / history.length;
    avgLatency = history.reduce((sum: number, s: any) => sum + s.avgLatency, 0) / history.length;
    totalOps = history.reduce((sum: number, s: any) => sum + s.totalOperations, 0);
  }
  
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Métricas de Caché - Piano Emotion Manager</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: #fff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    
    .header h1 {
      font-size: 28px;
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .header .subtitle {
      font-size: 16px;
      color: #64748b;
    }
    
    .meta-info {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #3b82f6;
    }
    
    .meta-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section h2 {
      font-size: 20px;
      color: #1e40af;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .metric-card {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .metric-card .label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .metric-card .value {
      font-size: 28px;
      font-weight: bold;
      color: #1e293b;
    }
    
    .metric-card .value.success {
      color: #10b981;
    }
    
    .metric-card .value.warning {
      color: #f59e0b;
    }
    
    .metric-card .value.danger {
      color: #ef4444;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 13px;
    }
    
    table thead {
      background: #1e40af;
      color: white;
    }
    
    table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    
    table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    table tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .status-badge.success {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-badge.warning {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-badge.danger {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    
    .summary-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    
    .summary-box h3 {
      font-size: 18px;
      margin-bottom: 15px;
    }
    
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 20px;
    }
    
    .summary-stat {
      text-align: center;
    }
    
    .summary-stat .label {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    
    .summary-stat .value {
      font-size: 24px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎹 Piano Emotion Manager</h1>
    <p class="subtitle">Reporte de Métricas de Caché</p>
  </div>
  
  <div class="meta-info">
    <p><strong>Fecha de generación:</strong> ${new Date(data.timestamp).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' })}</p>
    <p><strong>Rango temporal:</strong> ${timeRange === 1 ? 'Última hora' : timeRange === 6 ? 'Últimas 6 horas' : timeRange === 24 ? 'Últimas 24 horas' : 'Últimos 7 días'}</p>
    <p><strong>Modo de caché:</strong> ${cacheStats.useMemoryFallback ? 'Memoria (Desarrollo)' : 'Redis Distribuido (Producción)'}</p>
  </div>
  
  ${history && history.length > 0 ? `
  <div class="summary-box">
    <h3>📊 Resumen del Período</h3>
    <div class="summary-stats">
      <div class="summary-stat">
        <div class="label">Hit Rate Promedio</div>
        <div class="value">${avgHitRate.toFixed(1)}%</div>
      </div>
      <div class="summary-stat">
        <div class="label">Latencia Promedio</div>
        <div class="value">${avgLatency.toFixed(1)} ms</div>
      </div>
      <div class="summary-stat">
        <div class="label">Total Operaciones</div>
        <div class="value">${totalOps.toLocaleString()}</div>
      </div>
    </div>
  </div>
  ` : ''}
  
  <div class="section">
    <h2>Estado Actual del Sistema</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="label">Estado de Conexión</div>
        <div class="value ${cacheStats.isConnected ? 'success' : 'danger'}">
          ${cacheStats.isConnected ? '✓ Conectado' : '✗ Desconectado'}
        </div>
      </div>
      
      <div class="metric-card">
        <div class="label">Entradas en Caché</div>
        <div class="value">${cacheStats.memoryCacheSize || 0}</div>
      </div>
    </div>
  </div>
  
  ${cacheStats.metrics ? `
  <div class="section">
    <h2>Métricas de Rendimiento</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="label">Cache Hits</div>
        <div class="value success">${cacheStats.metrics.hits.toLocaleString()}</div>
      </div>
      
      <div class="metric-card">
        <div class="label">Cache Misses</div>
        <div class="value warning">${cacheStats.metrics.misses.toLocaleString()}</div>
      </div>
      
      <div class="metric-card">
        <div class="label">Hit Rate</div>
        <div class="value ${cacheStats.metrics.hitRate >= 80 ? 'success' : 'warning'}">
          ${cacheStats.metrics.hitRate.toFixed(2)}%
        </div>
      </div>
      
      <div class="metric-card">
        <div class="label">Latencia Promedio</div>
        <div class="value ${cacheStats.metrics.avgLatency <= 100 ? 'success' : 'warning'}">
          ${cacheStats.metrics.avgLatency.toFixed(2)} ms
        </div>
      </div>
      
      <div class="metric-card">
        <div class="label">Total Operaciones</div>
        <div class="value">${cacheStats.metrics.totalOperations.toLocaleString()}</div>
      </div>
      
      <div class="metric-card">
        <div class="label">Uptime</div>
        <div class="value">${Math.floor(cacheStats.metrics.uptime / 60)} min</div>
      </div>
    </div>
  </div>
  ` : ''}
  
  ${history && history.length > 0 ? `
  <div class="section">
    <h2>Historial de Snapshots (${history.length} registros)</h2>
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Hit Rate</th>
          <th>Latencia</th>
          <th>Operaciones</th>
          <th>Hits</th>
          <th>Misses</th>
        </tr>
      </thead>
      <tbody>
        ${history.map((snapshot: any) => `
          <tr>
            <td>${new Date(snapshot.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
            <td>
              <span class="status-badge ${snapshot.hitRate >= 80 ? 'success' : 'warning'}">
                ${snapshot.hitRate.toFixed(1)}%
              </span>
            </td>
            <td>
              <span class="status-badge ${snapshot.avgLatency <= 100 ? 'success' : 'warning'}">
                ${snapshot.avgLatency.toFixed(1)} ms
              </span>
            </td>
            <td>${snapshot.totalOperations.toLocaleString()}</td>
            <td>${snapshot.hits.toLocaleString()}</td>
            <td>${snapshot.misses.toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Piano Emotion Manager - Sistema de Gestión de Pianos Acústicos</p>
    <p>Reporte generado automáticamente por el sistema de monitoreo de caché</p>
  </div>
</body>
</html>
  `;
  
  return html;
}
