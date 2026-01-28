/**
 * WorkflowMetrics - Dashboard de métricas y estadísticas de workflows
 * Piano Emotion Manager
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useTranslation } from '@/hooks/use-translation';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function WorkflowMetrics() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Queries
  const { data: workflows, isLoading: loadingWorkflows } = trpc.workflows.list.useQuery();
  const { data: executions, isLoading: loadingExecutions } = trpc.workflows.getExecutions.useQuery({});

  if (loadingWorkflows || loadingExecutions) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeWorkflows = workflows?.filter((w) => w.is_active) || [];
  const totalExecutions = executions?.length || 0;
  const successfulExecutions = executions?.filter((e) => e.status === 'success').length || 0;
  const failedExecutions = executions?.filter((e) => e.status === 'failed').length || 0;
  const pendingExecutions = executions?.filter((e) => e.status === 'pending').length || 0;
  const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;

  // Datos para gráfico de ejecuciones por día
  const executionsByDay = executions?.reduce((acc, exec) => {
    const date = new Date(exec.executed_at || exec.created_at).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.total++;
      if (exec.status === 'success') existing.success++;
      if (exec.status === 'failed') existing.failed++;
    } else {
      acc.push({
        date,
        total: 1,
        success: exec.status === 'success' ? 1 : 0,
        failed: exec.status === 'failed' ? 1 : 0,
      });
    }
    return acc;
  }, [] as Array<{ date: string; total: number; success: number; failed: number }>);

  // Datos para gráfico de workflows más usados
  const workflowUsage = workflows?.map((workflow) => {
    const workflowExecutions = executions?.filter((e) => e.workflow_id === workflow.id) || [];
    return {
      name: workflow.name.length > 20 ? workflow.name.substring(0, 20) + '...' : workflow.name,
      executions: workflowExecutions.length,
      success: workflowExecutions.filter((e) => e.status === 'success').length,
      failed: workflowExecutions.filter((e) => e.status === 'failed').length,
    };
  }).sort((a, b) => b.executions - a.executions).slice(0, 10) || [];

  // Datos para gráfico de pie de estados
  const statusData = [
    { name: 'Exitosas', value: successfulExecutions, color: '#22c55e' },
    { name: 'Fallidas', value: failedExecutions, color: '#ef4444' },
    { name: 'Pendientes', value: pendingExecutions, color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Métricas de Workflows</h1>
        <p className="text-muted-foreground mt-2">
          Estadísticas y análisis de rendimiento de tus automatizaciones
        </p>
      </div>

      {/* Filtro de rango de tiempo */}
      <div className="flex items-center gap-2">
        <Button
          variant={timeRange === '7d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('7d')}
        >
          Últimos 7 días
        </Button>
        <Button
          variant={timeRange === '30d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('30d')}
        >
          Últimos 30 días
        </Button>
        <Button
          variant={timeRange === '90d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('90d')}
        >
          Últimos 90 días
        </Button>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkflows.length}</div>
            <p className="text-xs text-muted-foreground">
              de {workflows?.length || 0} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ejecuciones</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions}</div>
            <p className="text-xs text-muted-foreground">
              {successfulExecutions} exitosas, {failedExecutions} fallidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {successfulExecutions} de {totalExecutions} ejecuciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingExecutions}</div>
            <p className="text-xs text-muted-foreground">
              En cola de ejecución
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con gráficos */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">
            <Calendar className="h-4 w-4 mr-2" />
            Línea de Tiempo
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <BarChart3 className="h-4 w-4 mr-2" />
            Por Workflow
          </TabsTrigger>
          <TabsTrigger value="status">
            <Activity className="h-4 w-4 mr-2" />
            Por Estado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ejecuciones por Día</CardTitle>
              <CardDescription>
                Historial de ejecuciones en los últimos {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={executionsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8b5cf6" name="Total" strokeWidth={2} />
                  <Line type="monotone" dataKey="success" stroke="#22c55e" name="Exitosas" strokeWidth={2} />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Fallidas" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflows Más Usados</CardTitle>
              <CardDescription>
                Top 10 workflows por número de ejecuciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={workflowUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="success" fill="#22c55e" name="Exitosas" stackId="a" />
                  <Bar dataKey="failed" fill="#ef4444" name="Fallidas" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
              <CardDescription>
                Proporción de ejecuciones según su estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tabla de workflows con métricas */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Workflow</CardTitle>
          <CardDescription>
            Métricas detalladas de cada workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows?.map((workflow) => {
              const workflowExecutions = executions?.filter((e) => e.workflow_id === workflow.id) || [];
              const workflowSuccess = workflowExecutions.filter((e) => e.status === 'success').length;
              const workflowFailed = workflowExecutions.filter((e) => e.status === 'failed').length;
              const workflowSuccessRate = workflowExecutions.length > 0
                ? Math.round((workflowSuccess / workflowExecutions.length) * 100)
                : 0;

              return (
                <div
                  key={workflow.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{workflow.name}</h3>
                      <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                        {workflow.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{workflow.description || 'Sin descripción'}</p>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{workflowExecutions.length}</div>
                      <div className="text-muted-foreground">Ejecuciones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{workflowSuccess}</div>
                      <div className="text-muted-foreground">Exitosas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{workflowFailed}</div>
                      <div className="text-muted-foreground">Fallidas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{workflowSuccessRate}%</div>
                      <div className="text-muted-foreground">Tasa de Éxito</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {(!workflows || workflows.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No hay workflows para mostrar
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
