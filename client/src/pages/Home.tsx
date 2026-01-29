import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Users, Wrench, Music, DollarSign, Calendar, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Lightbulb, UserPlus, FileText, Receipt, CalendarPlus, HelpCircle, Settings as SettingsIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from 'wouter';
import { LicenseExpirationAlert } from '@/components/LicenseExpirationAlert';
import { useTranslation } from '@/hooks/use-translation';

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
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Mostrar alerta de licencias al inicio del dashboard

  // Obtener métricas del dashboard
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.getMetrics.useQuery();
  const { data: recentServices, isLoading: recentLoading } = trpc.dashboard.getRecentServices.useQuery();
  const { data: upcomingServices, isLoading: upcomingLoading } = trpc.dashboard.getUpcomingServices.useQuery();
  
  // Obtener previsiones
  const { data: revenueData } = trpc.forecasts.predictRevenue.useQuery();
  const { data: churnData } = trpc.forecasts.predictChurn.useQuery();
  const { data: maintenanceData } = trpc.forecasts.predictMaintenance.useQuery();
  const { data: workloadData } = trpc.forecasts.predictWorkload.useQuery();
  const { data: inventoryData } = trpc.forecasts.predictInventory.useQuery();

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
  const { data: remindersStats } = trpc.reminders.getStats.useQuery();
  
  const alertCount = (alertsData?.total || 0) + (remindersStats?.pending || 0);
  const hasAlerts = alertCount > 0;

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
    return t(`home.serviceTypes.${type}` as any) || type;
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
              ? `${alertCount} ${alertCount === 1 ? 'alerta/recordatorio requiere' : 'alertas/recordatorios requieren'} tu atención`
              : t('home.alerts.allGood')}
          </span>
        </div>
        {hasAlerts && (
          <span className="text-white font-medium">{t('home.alerts.view')} →</span>
        )}
      </button>

      {/* 2. SECCIÓN "ESTE MES" + PREDICCIONES IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Este Mes - Grid 2x2 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('home.thisMonth.title')}</CardTitle>
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
                <div className="text-sm text-muted-foreground">{t('home.thisMonth.services')}</div>
              </button>

              <button
                onClick={() => navigate('/facturacion')}
                className="flex flex-col items-center justify-center p-6 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-foreground">0 €</div>
                <div className="text-sm text-muted-foreground">{t('home.thisMonth.income')}</div>
              </button>

              <button
                onClick={() => navigate('/clientes')}
                className="flex flex-col items-center justify-center p-6 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Users className="h-8 w-8 text-cyan-600 mb-2" />
                <div className="text-2xl font-bold text-foreground">{metrics?.clients ?? 0}</div>
                <div className="text-sm text-muted-foreground">{t('home.thisMonth.clients')}</div>
              </button>

              <button
                onClick={() => navigate('/pianos')}
                className="flex flex-col items-center justify-center p-6 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Music className="h-8 w-8 text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-foreground">{metrics?.pianos ?? 0}</div>
                <div className="text-sm text-muted-foreground">{t('home.thisMonth.pianos')}</div>
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
                <CardTitle>{t('home.aiPredictions.title')}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/previsiones')}
              >
                {t('home.aiPredictions.viewAll')} →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Ingresos Previstos */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-green-500 flex flex-col items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  <div className="text-xs font-bold text-green-500">
                    {revenueData?.predictions[0]?.predicted 
                      ? `€${Math.round(revenueData.predictions[0].predicted)}` 
                      : 'N/A'}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center">{t('home.aiPredictions.predictedIncome')}</div>
              </div>

              {/* Clientes en Riesgo */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center mb-2">
                  <HelpCircle className="h-6 w-6 text-amber-500" />
                  <div className="text-sm font-bold text-amber-500">{churnData?.totalAtRisk || 0}</div>
                </div>
                <div className="text-xs text-muted-foreground text-center">{t('home.aiPredictions.riskClients')}</div>
              </div>

              {/* Mantenimiento Próximo */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-purple-600 flex flex-col items-center justify-center mb-2">
                  <SettingsIcon className="h-6 w-6 text-purple-600" />
                  <div className="text-sm font-bold text-purple-600">{maintenanceData?.highUrgency || 0}</div>
                </div>
                <div className="text-xs text-muted-foreground text-center">{t('home.aiPredictions.upcomingMaintenance')}</div>
              </div>

              {/* Carga de Trabajo */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex flex-col items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-blue-500" />
                  <div className="text-sm font-bold text-blue-500">
                    {workloadData?.predictions[0]?.predictedServices || 0}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center">Servicios Semana 1</div>
              </div>

              {/* Inventario Crítico */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-red-500 flex flex-col items-center justify-center mb-2">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <div className="text-sm font-bold text-red-500">{inventoryData?.criticalItems || 0}</div>
                </div>
                <div className="text-xs text-muted-foreground text-center">Items Críticos</div>
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
            <CardTitle>{t('home.upcomingAppointments.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !upcomingServices || upcomingServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('home.upcomingAppointments.noAppointments')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingServices.slice(0, 3).map((service) => (
                  <button
                    key={service.id}
                    onClick={() => navigate(`/servicios/${service.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left"
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
            <CardTitle>{t('home.quickActions.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate('/clientes/nuevo')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <UserPlus className="h-6 w-6" />
                <span className="text-sm">{t('home.quickActions.newClient')}</span>
              </Button>

              <Button
                onClick={() => navigate('/servicios/nuevo')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <Wrench className="h-6 w-6" />
                <span className="text-sm">{t('home.quickActions.newService')}</span>
              </Button>

              <Button
                onClick={() => navigate('/facturacion/nueva')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <Receipt className="h-6 w-6" />
                <span className="text-sm">{t('home.quickActions.newInvoice')}</span>
              </Button>

              <Button
                onClick={() => navigate('/pianos/nuevo')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <Music className="h-6 w-6" />
                <span className="text-sm">{t('home.quickActions.newPiano')}</span>
              </Button>

              <Button
                onClick={() => navigate('/presupuestos/nuevo')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">{t('home.quickActions.newQuote')}</span>
              </Button>

              <Button
                onClick={() => navigate('/agenda/nueva')}
                className="h-auto flex-col gap-2 py-4 bg-[#e07a5f] hover:bg-[#d16a4f] text-white"
              >
                <CalendarPlus className="h-6 w-6" />
                <span className="text-sm">{t('home.quickActions.newAppointment')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
