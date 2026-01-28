/**
 * Alertas - Piano Emotion Manager
 * Página de gestión de alertas y notificaciones del sistema
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Wrench,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Alertas() {
  const [, setLocation] = useLocation();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const { data: alertsData, isLoading, refetch } = trpc.alerts.getAlerts.useQuery();
  const markAsReadMutation = trpc.alerts.markAsRead.useMutation({
    onSuccess: () => {
      toast.success('Alerta marcada como leída');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Error al marcar alerta');
    },
  });

  const resolveAlertMutation = trpc.alerts.resolveAlert.useMutation({
    onSuccess: () => {
      toast.success('Alerta resuelta correctamente');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Error al resolver alerta');
    },
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const alerts = alertsData?.alerts || [];
  
  // Filtrar alertas
  const filteredAlerts = alerts.filter((alert) => {
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'invoices' && !alert.type.includes('invoice')) return false;
      if (selectedFilter === 'appointments' && alert.type !== 'upcoming_appointment') return false;
      if (selectedFilter === 'pianos' && !alert.type.includes('piano_')) return false;
    }
    if (selectedPriority !== 'all' && alert.priority !== selectedPriority) return false;
    return true;
  });

  const urgentCount = alerts.filter(a => a.priority === 'urgent').length;
  const pendingCount = alerts.filter(a => a.priority === 'pending').length;

  const getAlertIcon = (type: string) => {
    if (type.includes('invoice')) return FileText;
    if (type.includes('appointment')) return Calendar;
    if (type.includes('piano_')) return Wrench;
    return AlertCircle;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'urgent') return 'destructive';
    if (priority === 'pending') return 'default';
    return 'secondary';
  };

  const getPriorityLabel = (priority: string) => {
    if (priority === 'urgent') return 'Urgente';
    if (priority === 'pending') return 'Pendiente';
    return 'Normal';
  };

  const handleMarkAsRead = (alertId: string) => {
    markAsReadMutation.mutate({ alertId });
  };

  const handleResolve = (alert: any) => {
    if (alert.type.includes('piano_')) {
      const id = parseInt(alert.id.replace('piano-alert-', ''));
      resolveAlertMutation.mutate({ alertId: id });
    } else {
      // Para otros tipos, solo marcar como leído
      handleMarkAsRead(alert.id);
    }
  };

  const handleNavigate = (url: string) => {
    setLocation(url);
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alertas y Notificaciones</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona todas las alertas del sistema en un solo lugar
        </p>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Alertas activas en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{urgentCount}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Para revisar próximamente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={selectedFilter === 'invoices' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('invoices')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Facturas
            </Button>
            <Button
              variant={selectedFilter === 'appointments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('appointments')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Citas
            </Button>
            <Button
              variant={selectedFilter === 'pianos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('pianos')}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Mantenimiento
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPriority === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPriority('all')}
            >
              Todas las prioridades
            </Button>
            <Button
              variant={selectedPriority === 'urgent' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setSelectedPriority('urgent')}
            >
              Urgentes
            </Button>
            <Button
              variant={selectedPriority === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPriority('pending')}
            >
              Pendientes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay alertas</h3>
              <p className="text-muted-foreground text-center">
                {selectedFilter !== 'all' || selectedPriority !== 'all'
                  ? 'No hay alertas que coincidan con los filtros seleccionados'
                  : 'Todo está en orden. No tienes alertas pendientes.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <Card key={alert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      alert.priority === 'urgent' 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-muted'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <Badge variant={getPriorityColor(alert.priority)}>
                              {getPriorityLabel(alert.priority)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {alert.clientName && (
                          <span>Cliente: {alert.clientName}</span>
                        )}
                        {alert.amount && (
                          <span>Monto: {Number(alert.amount).toFixed(2)}€</span>
                        )}
                        {alert.dueDate && (
                          <span>Vencimiento: {new Date(alert.dueDate).toLocaleDateString('es-ES')}</span>
                        )}
                        {alert.date && (
                          <span>Fecha: {new Date(alert.date).toLocaleDateString('es-ES')} {new Date(alert.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        {alert.daysSinceLastService && (
                          <span>Días desde último servicio: {alert.daysSinceLastService}</span>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2 pt-2">
                        {alert.actionUrl && (
                          <Button
                            size="sm"
                            onClick={() => handleNavigate(alert.actionUrl)}
                          >
                            Ver detalles
                          </Button>
                        )}
                        {alert.type.includes('piano_') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolve(alert)}
                            disabled={resolveAlertMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Resolver
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(alert.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Descartar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
