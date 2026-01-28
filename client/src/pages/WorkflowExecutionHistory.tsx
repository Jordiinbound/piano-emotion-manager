/**
 * WorkflowExecutionHistory - Historial detallado de ejecuciones de un workflow
 * Piano Emotion Manager
 */

import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
  Timer,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function WorkflowExecutionHistory() {
  const [, params] = useRoute('/workflows/:id/history');
  const [, setLocation] = useLocation();
  const workflowId = params?.id ? parseInt(params.id) : 0;

  const [expandedExecution, setExpandedExecution] = useState<number | null>(null);

  // Queries
  const { data: workflow } = trpc.workflows.get.useQuery({ id: workflowId });
  const { data: executions, isLoading } = trpc.workflows.getExecutions.useQuery({
    workflowId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando historial...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      success: { label: 'Exitosa', className: 'bg-green-100 text-green-700' },
      failed: { label: 'Fallida', className: 'bg-red-100 text-red-700' },
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
    };
    return variants[status] || { label: 'Desconocido', className: 'bg-gray-100 text-gray-700' };
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return 'N/A';
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const duration = end - start;
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(2)}s`;
    return `${(duration / 60000).toFixed(2)}m`;
  };

  const successCount = executions?.filter((e) => e.status === 'success').length || 0;
  const failedCount = executions?.filter((e) => e.status === 'failed').length || 0;
  const successRate = executions && executions.length > 0
    ? Math.round((successCount / executions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/workflows')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Historial de Ejecuciones</h1>
          <p className="text-muted-foreground mt-1">
            {workflow?.name || 'Workflow'}
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ejecuciones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executions?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exitosas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallidas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de ejecuciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ejecuciones</CardTitle>
          <CardDescription>
            Detalle de todas las ejecuciones de este workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {executions && executions.length > 0 ? (
              executions.map((execution) => {
                const statusBadge = getStatusBadge(execution.status);
                const isExpanded = expandedExecution === execution.id;

                return (
                  <Collapsible
                    key={execution.id}
                    open={isExpanded}
                    onOpenChange={() => setExpandedExecution(isExpanded ? null : execution.id)}
                  >
                    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                            {getStatusIcon(execution.status)}
                            <div className="text-left">
                              <div className="font-medium">
                                Ejecución #{execution.id}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(execution.executed_at || execution.created_at)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <div className="text-muted-foreground">Duración</div>
                              <div className="font-medium">
                                {calculateDuration(execution.executed_at, execution.completed_at)}
                              </div>
                            </div>
                            <Badge className={statusBadge.className}>
                              {statusBadge.label}
                            </Badge>
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="mt-4 pt-4 border-t space-y-3">
                          {/* Información de la ejecución */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Inicio</div>
                              <div className="font-medium">{formatDate(execution.executed_at)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Finalización</div>
                              <div className="font-medium">{formatDate(execution.completed_at)}</div>
                            </div>
                          </div>

                          {/* Logs de ejecución */}
                          {execution.execution_log && (
                            <div>
                              <div className="text-sm font-medium mb-2">Logs de Ejecución</div>
                              <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto">
                                <pre>{JSON.stringify(JSON.parse(execution.execution_log), null, 2)}</pre>
                              </div>
                            </div>
                          )}

                          {/* Error (si existe) */}
                          {execution.error_message && (
                            <div>
                              <div className="text-sm font-medium mb-2 text-red-600">Error</div>
                              <div className="bg-red-50 border border-red-200 p-3 rounded-md text-sm text-red-800">
                                {execution.error_message}
                              </div>
                            </div>
                          )}

                          {/* Resultado (si existe) */}
                          {execution.result && (
                            <div>
                              <div className="text-sm font-medium mb-2">Resultado</div>
                              <div className="bg-green-50 border border-green-200 p-3 rounded-md font-mono text-xs overflow-x-auto">
                                <pre>{JSON.stringify(JSON.parse(execution.result), null, 2)}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay ejecuciones registradas para este workflow
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
