import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Trash2, Database, Server, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function CacheMonitor() {
  const [pattern, setPattern] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
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
      
      {/* Última actualización */}
      {cacheStats?.timestamp && (
        <p className="text-xs text-muted-foreground text-center">
          Última actualización: {new Date(cacheStats.timestamp).toLocaleString('es-ES')}
        </p>
      )}
    </div>
  );
}
