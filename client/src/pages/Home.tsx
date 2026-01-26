import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Wrench, Piano, Calendar, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Página de inicio - Dashboard con métricas completas
 */
export default function Home() {
  // Obtener métricas del dashboard
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.getMetrics.useQuery();
  const { data: recentServices, isLoading: recentLoading } = trpc.dashboard.getRecentServices.useQuery();
  const { data: upcomingServices, isLoading: upcomingLoading } = trpc.dashboard.getUpcomingServices.useQuery();

  // Función helper para formatear fechas
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Función helper para formatear tipo de servicio
  const formatServiceType = (type: string) => {
    const types: Record<string, string> = {
      tuning: 'Afinación',
      repair: 'Reparación',
      regulation: 'Regulación',
      maintenance_basic: 'Mantenimiento Básico',
      maintenance_complete: 'Mantenimiento Completo',
      maintenance_premium: 'Mantenimiento Premium',
      inspection: 'Inspección',
      restoration: 'Restauración',
      other: 'Otro',
    };
    return types[type] || type;
  };

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Resumen general del sistema de gestión de pianos
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.clients ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.services ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de servicios realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pianos</CardTitle>
            <Piano className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.pianos ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de pianos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.servicesThisMonth ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Servicios realizados este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Servicios recientes y próximos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Servicios Recientes
            </CardTitle>
            <CardDescription>Últimos 5 servicios realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !recentServices || recentServices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay servicios registrados
              </p>
            ) : (
              <div className="space-y-4">
                {recentServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {formatServiceType(service.serviceType)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(service.date)}
                      </p>
                    </div>
                    {service.cost && (
                      <div className="text-sm font-semibold">
                        ${parseFloat(service.cost).toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos servicios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Servicios
            </CardTitle>
            <CardDescription>Servicios programados</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !upcomingServices || upcomingServices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay servicios programados
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {formatServiceType(service.serviceType)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(service.date)}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cliente #{service.clientId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
