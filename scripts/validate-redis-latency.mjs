/**
 * Script de Validación de Latencia de Redis en Producción
 * 
 * Este script realiza pruebas exhaustivas de latencia contra el endpoint
 * de monitoreo de caché en producción para validar el rendimiento de Redis.
 */

import https from 'https';
import { performance } from 'perf_hooks';

const PRODUCTION_URL = 'https://piano-emotion-nextjs.vercel.app';
const ITERATIONS = 50; // Número de pruebas a realizar
const DELAY_BETWEEN_TESTS = 100; // ms entre pruebas

/**
 * Realiza una petición HTTP y mide la latencia
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            latency,
            statusCode: res.statusCode,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            latency,
            statusCode: res.statusCode,
            error: 'Failed to parse JSON',
          });
        }
      });
    }).on('error', (error) => {
      const endTime = performance.now();
      reject({
        latency: endTime - startTime,
        error: error.message,
      });
    });
  });
}

/**
 * Espera un tiempo determinado
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calcula estadísticas de un array de números
 */
function calculateStats(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / numbers.length;
  
  const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    mean: mean,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    stdDev: stdDev,
  };
}

/**
 * Ejecuta la validación completa
 */
async function runValidation() {
  console.log('🚀 Iniciando validación de latencia de Redis en producción\\n');
  console.log(`📍 URL: ${PRODUCTION_URL}`);
  console.log(`🔢 Iteraciones: ${ITERATIONS}`);
  console.log(`⏱️  Delay entre pruebas: ${DELAY_BETWEEN_TESTS}ms\\n`);
  console.log('─'.repeat(80));
  
  const results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    latencies: [],
    redisLatencies: [],
    errors: [],
  };
  
  // Realizar pruebas
  for (let i = 0; i < ITERATIONS; i++) {
    try {
      const result = await makeRequest(`${PRODUCTION_URL}/api/trpc/systemMonitor.getCacheStats`);
      results.totalRequests++;
      
      if (result.statusCode === 200 && result.data) {
        results.successfulRequests++;
        results.latencies.push(result.latency);
        
        // Extraer latencia de Redis si está disponible
        if (result.data.result?.data?.metrics?.avgLatency) {
          results.redisLatencies.push(result.data.result.data.metrics.avgLatency);
        }
        
        // Mostrar progreso cada 10 iteraciones
        if ((i + 1) % 10 === 0) {
          console.log(`✓ Completadas ${i + 1}/${ITERATIONS} pruebas`);
        }
      } else {
        results.failedRequests++;
        results.errors.push({
          iteration: i + 1,
          statusCode: result.statusCode,
          error: result.error || 'Unknown error',
        });
        console.log(`✗ Error en iteración ${i + 1}: ${result.statusCode}`);
      }
    } catch (error) {
      results.failedRequests++;
      results.errors.push({
        iteration: i + 1,
        error: error.error || error.message,
      });
      console.log(`✗ Excepción en iteración ${i + 1}: ${error.error || error.message}`);
    }
    
    // Esperar antes de la siguiente prueba
    if (i < ITERATIONS - 1) {
      await sleep(DELAY_BETWEEN_TESTS);
    }
  }
  
  console.log('\\n' + '─'.repeat(80));
  console.log('\\n📊 RESULTADOS DE LA VALIDACIÓN\\n');
  
  // Resumen general
  console.log('📈 Resumen General:');
  console.log(`   Total de peticiones: ${results.totalRequests}`);
  console.log(`   Exitosas: ${results.successfulRequests} (${(results.successfulRequests / results.totalRequests * 100).toFixed(2)}%)`);
  console.log(`   Fallidas: ${results.failedRequests} (${(results.failedRequests / results.totalRequests * 100).toFixed(2)}%)\\n`);
  
  // Estadísticas de latencia HTTP
  if (results.latencies.length > 0) {
    const httpStats = calculateStats(results.latencies);
    console.log('🌐 Latencia HTTP (End-to-End):');
    console.log(`   Mínima: ${httpStats.min.toFixed(2)} ms`);
    console.log(`   Máxima: ${httpStats.max.toFixed(2)} ms`);
    console.log(`   Promedio: ${httpStats.mean.toFixed(2)} ms`);
    console.log(`   Mediana: ${httpStats.median.toFixed(2)} ms`);
    console.log(`   P95: ${httpStats.p95.toFixed(2)} ms`);
    console.log(`   P99: ${httpStats.p99.toFixed(2)} ms`);
    console.log(`   Desviación estándar: ${httpStats.stdDev.toFixed(2)} ms\\n`);
  }
  
  // Estadísticas de latencia de Redis
  if (results.redisLatencies.length > 0) {
    const redisStats = calculateStats(results.redisLatencies);
    console.log('🔴 Latencia de Redis (Operaciones internas):');
    console.log(`   Mínima: ${redisStats.min.toFixed(2)} ms`);
    console.log(`   Máxima: ${redisStats.max.toFixed(2)} ms`);
    console.log(`   Promedio: ${redisStats.mean.toFixed(2)} ms`);
    console.log(`   Mediana: ${redisStats.median.toFixed(2)} ms`);
    console.log(`   P95: ${redisStats.p95.toFixed(2)} ms`);
    console.log(`   P99: ${redisStats.p99.toFixed(2)} ms`);
    console.log(`   Desviación estándar: ${redisStats.stdDev.toFixed(2)} ms\\n`);
    
    // Validación de objetivos
    console.log('🎯 Validación de Objetivos:');
    const targetLatency = 100; // ms
    const targetP95 = 35; // ms para Redis
    
    if (redisStats.mean <= targetLatency) {
      console.log(`   ✅ Latencia promedio de Redis (${redisStats.mean.toFixed(2)} ms) está dentro del objetivo (<${targetLatency} ms)`);
    } else {
      console.log(`   ❌ Latencia promedio de Redis (${redisStats.mean.toFixed(2)} ms) excede el objetivo (<${targetLatency} ms)`);
    }
    
    if (redisStats.p95 <= targetP95) {
      console.log(`   ✅ P95 de Redis (${redisStats.p95.toFixed(2)} ms) está dentro del objetivo (<${targetP95} ms)`);
    } else {
      console.log(`   ⚠️  P95 de Redis (${redisStats.p95.toFixed(2)} ms) excede el objetivo (<${targetP95} ms)`);
    }
  } else {
    console.log('⚠️  No se pudieron obtener métricas de latencia de Redis');
  }
  
  // Errores
  if (results.errors.length > 0) {
    console.log(`\\n❌ Errores encontrados (${results.errors.length}):`);
    results.errors.slice(0, 5).forEach((error, index) => {
      console.log(`   ${index + 1}. Iteración ${error.iteration}: ${error.error || `Status ${error.statusCode}`}`);
    });
    if (results.errors.length > 5) {
      console.log(`   ... y ${results.errors.length - 5} errores más`);
    }
  }
  
  console.log('\\n' + '─'.repeat(80));
  console.log('\\n✅ Validación completada\\n');
  
  // Retornar código de salida basado en resultados
  const successRate = results.successfulRequests / results.totalRequests;
  if (successRate < 0.95) {
    console.log('⚠️  ADVERTENCIA: Tasa de éxito menor al 95%');
    process.exit(1);
  }
  
  if (results.redisLatencies.length > 0) {
    const redisStats = calculateStats(results.redisLatencies);
    if (redisStats.mean > 100) {
      console.log('⚠️  ADVERTENCIA: Latencia promedio de Redis excede 100ms');
      process.exit(1);
    }
  }
  
  console.log('🎉 Todas las validaciones pasaron exitosamente');
  process.exit(0);
}

// Ejecutar validación
runValidation().catch((error) => {
  console.error('\\n❌ Error fatal durante la validación:', error);
  process.exit(1);
});
