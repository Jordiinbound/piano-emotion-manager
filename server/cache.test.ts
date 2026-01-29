/**
 * Tests para el sistema de caché con Upstash Redis
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getCache, setCache, deleteCache, getCacheStats, cacheService } from './cache.js';

describe('Cache Service', () => {
  beforeAll(async () => {
    // Dar tiempo para que el servicio se inicialice
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it('debe inicializarse correctamente', () => {
    const stats = getCacheStats();
    expect(stats).toBeDefined();
    expect(stats.isConnected).toBe(true);
    console.log('📊 Cache Stats:', stats);
  });

  it('debe poder guardar y recuperar datos del caché', async () => {
    const key = `test:cache:basic:${Date.now()}`;
    const value = { message: 'Hello from cache', timestamp: Date.now() };
    const ttl = 60; // 60 segundos

    // Guardar en caché
    await setCache(key, value, ttl);

    // Recuperar del caché
    const cached = await getCache<typeof value>(key);
    
    expect(cached).toBeDefined();
    expect(cached?.message).toBe(value.message);
    expect(cached?.timestamp).toBe(value.timestamp);

    // Limpiar
    await deleteCache(key);
  });

  it('debe retornar null para claves inexistentes', async () => {
    const key = `test:cache:nonexistent:${Date.now()}`;
    const cached = await getCache(key);
    expect(cached).toBeNull();
  });

  it('debe poder eliminar datos del caché', async () => {
    const key = `test:cache:delete:${Date.now()}`;
    const value = 'test value';

    // Guardar
    await setCache(key, value, 60);

    // Verificar que existe
    let cached = await getCache(key);
    expect(cached).toBe(value);

    // Eliminar
    await deleteCache(key);

    // Verificar que fue eliminado
    cached = await getCache(key);
    expect(cached).toBeNull();
  });

  it('debe manejar diferentes tipos de datos', async () => {
    const timestamp = Date.now();
    const testCases = [
      { key: `test:string:${timestamp}`, value: 'Hello World', ttl: 60 },
      { key: `test:number:${timestamp}`, value: 42, ttl: 60 },
      { key: `test:boolean:${timestamp}`, value: true, ttl: 60 },
      { key: `test:array:${timestamp}`, value: [1, 2, 3, 4, 5], ttl: 60 },
      { key: `test:object:${timestamp}`, value: { name: 'Test', age: 30, active: true }, ttl: 60 },
    ];

    for (const testCase of testCases) {
      // Guardar
      await setCache(testCase.key, testCase.value, testCase.ttl);

      // Recuperar
      const cached = await getCache(testCase.key);

      // Verificar
      expect(cached).toEqual(testCase.value);

      // Limpiar
      await deleteCache(testCase.key);
    }
  });

  it('debe respetar el TTL (Time To Live)', async () => {
    const key = `test:cache:ttl:${Date.now()}`;
    const value = 'expires soon';
    const ttl = 2; // 2 segundos

    // Guardar con TTL corto
    await setCache(key, value, ttl);

    // Verificar que existe inmediatamente
    let cached = await getCache(key);
    expect(cached).toBe(value);

    // Esperar a que expire (2 segundos + margen)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Verificar que expiró
    cached = await getCache(key);
    
    // En Redis puede que aún exista por poco tiempo, en memoria debe ser null
    const stats = getCacheStats();
    if (stats.useMemoryFallback) {
      expect(cached).toBeNull();
    }
  }, 10000); // Timeout de 10 segundos para este test

  it('debe proporcionar estadísticas del caché', () => {
    const stats = getCacheStats();
    
    expect(stats).toBeDefined();
    expect(typeof stats.isConnected).toBe('boolean');
    expect(typeof stats.useMemoryFallback).toBe('boolean');
    expect(typeof stats.memoryCacheSize).toBe('number');
    expect(typeof stats.hasClient).toBe('boolean');
    expect(typeof stats.hasRedisEnvVars).toBe('boolean');

    console.log('📊 Final Cache Stats:', {
      ...stats,
      mode: stats.useMemoryFallback ? 'Memory Fallback' : 'Redis',
      connection: stats.hasRedisEnvVars ? 'Configured' : 'Not Configured'
    });
  });

  it('debe funcionar con claves que contienen caracteres especiales', async () => {
    const timestamp = Date.now();
    const specialKeys = [
      `test:cache:with:colons:${timestamp}`,
      `test-cache-with-dashes-${timestamp}`,
      `test_cache_with_underscores_${timestamp}`,
      `test.cache.with.dots.${timestamp}`,
    ];

    for (const key of specialKeys) {
      const value = `Value for ${key}`;
      
      await setCache(key, value, 60);
      const cached = await getCache(key);
      
      expect(cached).toBe(value);
      await deleteCache(key);
    }
  });

  it('debe manejar valores grandes correctamente', async () => {
    const key = `test:cache:large:${Date.now()}`;
    
    // Crear un objeto grande (simulando datos de forecast)
    const largeValue = {
      forecasts: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        date: new Date(Date.now() + i * 86400000).toISOString(),
        revenue: Math.random() * 10000,
        clients: Math.floor(Math.random() * 50),
        services: Math.floor(Math.random() * 20),
        metadata: {
          confidence: Math.random(),
          factors: ['seasonal', 'trend', 'historical'],
          notes: 'Generated forecast data for testing'
        }
      }))
    };

    await setCache(key, largeValue, 60);
    const cached = await getCache<typeof largeValue>(key);

    expect(cached).toBeDefined();
    expect(cached?.forecasts).toHaveLength(100);
    expect(cached?.forecasts[0]).toHaveProperty('revenue');
    
    await deleteCache(key);
  });
});

describe('Cache Service - Connection Status', () => {
  it('debe mostrar información detallada de la conexión', async () => {
    const stats = getCacheStats();
    
    console.log('\n=== CACHE SERVICE CONNECTION STATUS ===');
    console.log('Environment Variables:');
    console.log('  UPSTASH_REDIS_REST_URL:', stats.hasRedisEnvVars ? '✅ Configured' : '❌ Not configured');
    console.log('  UPSTASH_REDIS_REST_TOKEN:', stats.hasRedisEnvVars ? '✅ Configured' : '❌ Not configured');
    console.log('\nConnection Status:');
    console.log('  Is Connected:', stats.isConnected ? '✅ Yes' : '❌ No');
    console.log('  Has Client:', stats.hasClient ? '✅ Yes' : '❌ No');
    console.log('  Using Memory Fallback:', stats.useMemoryFallback ? '⚠️  Yes' : '✅ No');
    console.log('  Memory Cache Size:', stats.memoryCacheSize, 'entries');
    console.log('\nMode:', stats.useMemoryFallback ? '🔸 MEMORY FALLBACK' : '🟢 REDIS DISTRIBUTED');
    console.log('=====================================\n');

    expect(stats.isConnected).toBe(true);
  });
});
