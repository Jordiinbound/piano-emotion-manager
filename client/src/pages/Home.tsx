import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Users, Wrench, Music, DollarSign, Calendar, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Lightbulb, UserPlus, FileText, Receipt, CalendarPlus, HelpCircle, Settings as SettingsIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from 'wouter';
import { LicenseExpirationAlert } from '@/components/LicenseExpirationAlert';

/**
 * Dashboard Screen - Elegant Professional Design
 * Piano Emotion Manager
 * 
 * Diseño con:
 * - Barra de alertas (verde/roja, compacta y elegante)
 * - Grid 2x2 de métricas "Este Mes"
 * - Predicciones IA con indicadores circulares
 * - Próximas citas
 * - Acciones rápidas (botones terracota)
 */
export default function Home() {
  const [, navigate] = useLocation();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Mostrar alerta de licencias al inicio del dashboard

  // Obtener métricas del dashboard
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.getMetrics.useQuery();
  const { data: recentServices, isLoading: recentLoading } = trpc.dashboard.getRecentServices.useQuery();
  const { data: upcomingServices, isLoading: upcomingLoading } = trpc.dashboard.getUpcomingServices.useQuery();

  // Navegación de meses
  const navigatePreviousMonth = () => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const navigateNextMonth = () => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setSelectedMonth(new Date());
  };

  // Formatear mes seleccionado
  const monthLabel = selectedMonth.toLocaleDateString('es-ES', { 
    month: 'short', 
    year: 'numeric' 
  }).charAt(0).toUpperCase() + selectedMonth.toLocaleDateString('es-ES', { 
    month: 'short', 
    year: 'numeric' 
  }).slice(1);

  // Obtener alertas desde la base de datos
  const { data: alertsData } = trpc.alerts.getSummary.useQuery();
  const hasAlerts = alertsData?.hasAlerts || false;
  const alertCount = alertsData?.total || 0;

  // Función helper para formatear fechas
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="space-y-6">
      {/* Alerta de Licencias Próximas a Expirar */}
      <LicenseExpirationAlert />

      {/* 1. BARRA DE ALERTAS - Compacta y elegante */}
      <button
        onClick={() => navigate('/alertas')}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
          hasAlerts
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        <div className="flex items-center gap-2 text-white">
          {hasAlerts ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          <span className="font-medium">
            {hasAlerts
              ? `${alertCount} ${alertCount === 1 ? 'alerta requiere' : 'alertas requieren'} tu atención`
              : 'Todo en orden'}
          </span>
        </div>
        {hasAlerts && (
          <span className="text-white font-medium">Ver →</span>
        )}
      </button>

      {/* 2. SECCIÓN "ESTE MES" + PREDICCIONES IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Este Mes - Grid 2x2 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Este Mes</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={navigatePreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="min-w-[100px]"
                >
                  {monthLabel}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={navigateNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/agenda')}
                >
                  <Calendar className="h-4 w-4 text-amber-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/servicios')}
                className="flex flex-col items-center justify-center p-6 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Wrench className="h-8 w-8 text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-foreground">{metrics?.services ?? 0}</div>
                <div className="text-sm text-muted-foreground">Servicios</div>
              </button>

              <button
                onClick={() => navigate('/facturacion')}
                className="flex flex-col items-center justify-center p-6 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-foreground">0 €</div>
                <div className="text-sm text-muted-foreground">Ingresos</div>
              </button>

              <button
                onClick={() => navigate('/clientes')}
                className="flex flex-col items-center justify-center p-6 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Users className="h-8 w-8 text-cyan-600 mb-2" />
                <div className="text-2xl font-bold text-foreground">{metrics?.clients ?? 0}</div>
                <div className="text-sm text-muted-foreground">Clientes</div>
              </button>

              <button
                onClick={() => navigate('/pianos')}
                className="flex flex-col items-center justify-center p-6 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Music className="h-8 w-8 text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-foreground">{metrics?.pianos ?? 0}</div>
                <div className="text-sm text-muted-foreground">Pianos</div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Predicciones IA */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-purple-600" />
                <CardTitle>Predicciones IA</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/predicciones')}
              >
                Ver todo →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-green-500 flex flex-col items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  <div className="text-sm font-bold text-green-500">N/A</div>
                </div>
                <div className="text-xs text-muted-foreground text-center">Ingresos prev.</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center mb-2">
                  <HelpCircle className="h-6 w-6 text-amber-500" />
                  <div className="text-sm font-bold text-amber-500">0</div>
                </div>
                <div className="text-xs text-muted-foreground text-center">Clientes riesgo</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-purple-600 flex flex-col items-center justify-center mb-2">
                  <SettingsIcon className="h-6 w-6 text-purple-600" />
                  <div className="text-sm font-bold text-purple-600">0</div>
                </div>
                <div className="text-xs text-muted-foreground text-center">Mant. próximo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. PRÓXIMAS CITAS + ACCIONES RÁPIDAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Citas */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Citas</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !upcomingServices || upcomingServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No hay citas próximas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingServices.slice(0, 3).map((service) => (
                  <button
                    key={service.id}
                    onClick={() => navigate(`/servicios/${service.id}`)}
                    className="w-full flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[60px] bg-primary/10 rounded-lg p-2">
                      <div className="text-sm font-bold text-primary">
                        {new Date(service.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(service.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-foreground">
                        {formatServiceType(service.serviceType)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Cliente #{service.clientId}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate('/clientes/nuevo')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <UserPlus className="h-6 w-6" />
                <span className="text-sm">Nuevo Cliente</span>
              </Button>

              <Button
                onClick={() => navigate('/servicios/nuevo')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <Wrench className="h-6 w-6" />
                <span className="text-sm">Nuevo Servicio</span>
              </Button>

              <Button
                onClick={() => navigate('/facturacion/nueva')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <Receipt className="h-6 w-6" />
                <span className="text-sm">Nueva Factura</span>
              </Button>

              <Button
                onClick={() => navigate('/pianos/nuevo')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <Music className="h-6 w-6" />
                <span className="text-sm">Nuevo Piano</span>
              </Button>

              <Button
                onClick={() => navigate('/presupuestos/nuevo')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Nuevo Presupuesto</span>
              </Button>

              <Button
                onClick={() => navigate('/agenda/nueva')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <CalendarPlus className="h-6 w-6" />
                <span className="text-sm">Nueva Cita</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
