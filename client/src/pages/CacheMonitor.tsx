import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Trash2, Database, Server, Clock, Activity, Wifi, WifiOff, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CacheMonitor() {
  const [pattern, setPattern] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const serviceWorker = useServiceWorker();
  
  // Nota: Esta página es solo para el gestor principal del sistema
  // En producción, agregar autenticación adecuada
  
  const { data: cacheStats, refetch, isLoading } = trpc.systemMonitor.getCacheStats.useQuery(undefined, {
    refetchInterval: autoRefresh ? 5000 : false, // Auto-refresh cada 5 segundos si está activado
  });
  
  const { data: systemInfo } = trpc.systemMonitor.getSystemInfo.useQuery();
  
  const clearCacheMutation = trpc.systemMonitor.clearCache.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al limpiar caché: ${error.message}`);
    },
  });
  
  const clearByPatternMutation = trpc.systemMonitor.clearCacheByPattern.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setPattern('');
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al limpiar caché: ${error.message}`);
    },
  });
  
  const resetMetricsMutation = trpc.systemMonitor.resetCacheMetrics.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al resetear métricas: ${error.message}`);
    },
  });
  
  const handleResetMetrics = () => {
    if (confirm('¿Estás seguro de que deseas resetear las métricas de rendimiento?')) {
      resetMetricsMutation.mutate();
    }
  };
  
  const handleClearAll = () => {
    if (confirm('¿Estás seguro de que deseas limpiar todo el caché?')) {
      clearCacheMutation.mutate();
    }
  };
  
  const handleClearByPattern = () => {
    if (!pattern.trim()) {
      toast.error('Por favor ingresa un patrón');
      return;
    }
    
    if (confirm(`¿Deseas eliminar todas las entradas que contengan "${pattern}"?`)) {
      clearByPatternMutation.mutate({ pattern });
    }
  };
  
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoreo de Caché</h1>
          <p className="text-muted-foreground mt-2">
            Visualiza y administra el sistema de caché en tiempo real
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Detener' : 'Auto-actualizar'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>
      
      {/* Métricas de Rendimiento */}
      {cacheStats?.metrics && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Métricas de Rendimiento</CardTitle>
                <CardDescription>
                  Estadísticas de uso y rendimiento del caché
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetMetrics}
                disabled={resetMetricsMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${resetMetricsMutation.isPending ? 'animate-spin' : ''}`} />
                Resetear Métricas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-sm font-medium">Cache Hits</Label>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {cacheStats.metrics.hits.toLocaleString()}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Cache Misses</Label>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {cacheStats.metrics.misses.toLocaleString()}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Hit Rate</Label>
                <p className="text-2xl font-bold mt-1">
                  {cacheStats.metrics.hitRate.toFixed(2)}%
                </p>
                {cacheStats.metrics.hitRate < 80 && cacheStats.metrics.totalOperations > 10 && (
                  <Badge variant="destructive" className="mt-2">
                    Hit rate bajo
                  </Badge>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium">Latencia Promedio</Label>
                <p className="text-2xl font-bold mt-1">
                  {cacheStats.metrics.avgLatency.toFixed(2)}ms
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Total Operaciones</Label>
                <p className="text-2xl font-bold mt-1">
                  {cacheStats.metrics.totalOperations.toLocaleString()}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Sets</Label>
                <p className="text-2xl font-bold mt-1">
                  {cacheStats.metrics.sets.toLocaleString()}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Deletes</Label>
                <p className="text-2xl font-bold mt-1">
                  {cacheStats.metrics.deletes.toLocaleString()}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Uptime Métricas</Label>
                <p className="text-2xl font-bold mt-1">
                  {formatUptime(cacheStats.metrics.uptime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Estado del Caché */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de Conexión</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats?.isConnected ? (
                <Badge variant="default" className="bg-green-500">Conectado</Badge>
              ) : (
                <Badge variant="destructive">Desconectado</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Modo: {cacheStats?.mode || 'Desconocido'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipo de Caché</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats?.useMemoryFallback ? 'Memoria' : 'Redis'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {cacheStats?.useMemoryFallback 
                ? 'Desarrollo (local)' 
                : 'Producción (distribuido)'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas en Caché</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats?.memoryCacheSize || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {cacheStats?.useMemoryFallback ? 'En memoria local' : 'En Redis'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime del Sistema</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemInfo ? formatUptime(systemInfo.uptime) : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tiempo activo
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Detalles del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
          <CardDescription>
            Detalles técnicos del entorno de ejecución
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Entorno</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {cacheStats?.environment || 'N/A'}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Versión de Node.js</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {systemInfo?.nodeVersion || 'N/A'}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Plataforma</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {systemInfo?.platform || 'N/A'} ({systemInfo?.arch || 'N/A'})
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Uso de Memoria</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {systemInfo ? formatBytes(systemInfo.memoryUsage.heapUsed) : 'N/A'} / {systemInfo ? formatBytes(systemInfo.memoryUsage.heapTotal) : 'N/A'}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-sm font-medium">Configuración de Redis</Label>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                Variables de entorno: {cacheStats?.hasRedisEnvVars ? '✅ Configuradas' : '❌ No configuradas'}
              </p>
              <p className="text-sm text-muted-foreground">
                Cliente Redis: {cacheStats?.hasClient ? '✅ Inicializado' : '❌ No inicializado'}
              </p>
              <p className="text-sm text-muted-foreground">
                Conexión: {cacheStats?.connection || 'Desconocido'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Administración del Caché */}
      <Card>
        <CardHeader>
          <CardTitle>Administración del Caché</CardTitle>
          <CardDescription>
            Limpia el caché completo o por patrón de clave
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="pattern">Patrón de búsqueda</Label>
              <Input
                id="pattern"
                placeholder="Ej: clients, pianos, services"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Elimina todas las entradas que contengan este texto
              </p>
            </div>
            
            <Button
              onClick={handleClearByPattern}
              disabled={clearByPatternMutation.isPending || !pattern.trim()}
              variant="outline"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar por Patrón
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Limpiar todo el caché</p>
              <p className="text-sm text-muted-foreground">
                Elimina todas las entradas almacenadas en el caché
              </p>
            </div>
            
            <Button
              onClick={handleClearAll}
              disabled={clearCacheMutation.isPending}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar Todo
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Gráficos de Rendimiento */}
      {cacheStats?.metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Gráficos de Rendimiento
            </CardTitle>
            <CardDescription>
              Visualización de métricas de caché en tiempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gráfico de Hit Rate */}
            <div>
              <h3 className="text-sm font-medium mb-4">Hit Rate vs Miss Rate</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    {
                      name: 'Hits',
                      value: cacheStats.metrics.hits,
                      fill: '#10b981'
                    },
                    {
                      name: 'Misses',
                      value: cacheStats.metrics.misses,
                      fill: '#ef4444'
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Gráfico de Operaciones por Tipo */}
            <div>
              <h3 className="text-sm font-medium mb-4">Operaciones por Tipo</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { name: 'Gets', value: cacheStats.metrics.hits + cacheStats.metrics.misses, fill: '#3b82f6' },
                    { name: 'Sets', value: cacheStats.metrics.sets, fill: '#8b5cf6' },
                    { name: 'Deletes', value: cacheStats.metrics.deletes, fill: '#f59e0b' }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Indicador de Latencia */}
            <div>
              <h3 className="text-sm font-medium mb-4">Latencia Promedio</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-8 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full relative">
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow-lg"
                      style={{
                        left: `${Math.min(100, (cacheStats.metrics.avgLatency / 100) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>0ms</span>
                    <span>50ms</span>
                    <span>100ms+</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{cacheStats.metrics.avgLatency.toFixed(2)}ms</p>
                  <p className="text-xs text-muted-foreground">Promedio</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Service Worker (Caché de Segundo Nivel) */}
      <Card>
        <CardHeader>
          <CardTitle>Service Worker (Caché de Segundo Nivel)</CardTitle>
          <CardDescription>
            Caché en el navegador para reducir latencia y permitir funcionamiento offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Estado del Service Worker</Label>
              <p className="text-sm text-muted-foreground">
                {!serviceWorker.isSupported && 'No soportado en este navegador'}
                {serviceWorker.isSupported && !serviceWorker.isRegistered && 'No registrado'}
                {serviceWorker.isSupported && serviceWorker.isRegistered && !serviceWorker.isActive && 'Registrado pero inactivo'}
                {serviceWorker.isSupported && serviceWorker.isRegistered && serviceWorker.isActive && 'Activo y funcionando'}
              </p>
            </div>
            <div>
              {serviceWorker.isActive ? (
                <Badge variant="default" className="bg-green-500">
                  <Wifi className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Inactivo
                </Badge>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                const success = await serviceWorker.clearCache();
                if (success) {
                  toast.success('Caché del Service Worker limpiado');
                } else {
                  toast.error('No se pudo limpiar el caché del Service Worker');
                }
              }}
              disabled={!serviceWorker.isActive}
              variant="outline"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar Caché del Navegador
            </Button>
            
            <Button
              onClick={async () => {
                const success = await serviceWorker.update();
                if (success) {
                  toast.success('Service Worker actualizado');
                } else {
                  toast.error('No se pudo actualizar el Service Worker');
                }
              }}
              disabled={!serviceWorker.isActive}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar SW
            </Button>
            
            <Button
              onClick={async () => {
                const success = await serviceWorker.unregister();
                if (success) {
                  toast.success('Service Worker desregistrado');
                } else {
                  toast.error('No se pudo desregistrar el Service Worker');
                }
              }}
              disabled={!serviceWorker.isActive}
              variant="destructive"
            >
              <WifiOff className="h-4 w-4 mr-2" />
              Desactivar SW
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Última actualización */}
      {cacheStats?.timestamp && (
        <p className="text-xs text-muted-foreground text-center">
          Última actualización: {new Date(cacheStats.timestamp).toLocaleString('es-ES')}
        </p>
      )}
    </div>
  );
}
