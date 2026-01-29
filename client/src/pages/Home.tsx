/**
 * Dashboard Screen - Elegant Professional Design
 * Piano Emotion Manager
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, DollarSign, Users, Music, TrendingUp, AlertCircle, HelpCircle, Wrench as WrenchIcon, ChevronLeft, ChevronRight, Calendar, CheckCircle, UserPlus, FileText, CalendarPlus, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from 'wouter';
import { LicenseExpirationAlert } from '@/components/LicenseExpirationAlert';
import { useTranslation } from '@/hooks/use-translation';
import { usePrefetchDashboardData } from '@/hooks/usePrefetch';
import { PageHeader } from '@/components/PageHeader';
import { Loader2 } from "lucide-react";

// Colores del diseño Elegant Professional
const COLORS = {
  primary: '#003a8c',      // Azul Cobalto
  accent: '#e07a5f',       // Terracota
  white: '#ffffff',
  background: '#f8f9fa',
  
  // Alertas
  alertSuccess: '#10b981', // Verde (sin alertas)
  alertDanger: '#ff4d4f',  // Rojo (con alertas)
  
  // Métricas
  services: '#003a8c',     // Azul Cobalto
  income: '#10b981',       // Verde Esmeralda
  clients: '#0891b2',      // Cian Oscuro
  pianos: '#7c3aed',       // Violeta Profundo
  
  // IA
  aiWarning: '#f59e0b',    // Ámbar
  
  // Textos
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
};

// Componente MetricCard
function MetricCard({ icon: Icon, iconColor, value, label, onPress }: any) {
  return (
    <button
      onClick={onPress}
      className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-200"
      style={{ minHeight: '140px' }}
    >
      <Icon className="h-10 w-10 mb-3" style={{ color: iconColor }} />
      <div className="text-3xl font-bold mb-1" style={{ color: COLORS.textPrimary }}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </button>
  );
}

// Componente CircularIndicator
function CircularIndicator({ color, icon: iconName, label, value }: any) {
  const getIcon = () => {
    switch(iconName) {
      case 'trending-up': return TrendingUp;
      case 'help-circle-outline': return HelpCircle;
      case 'build-outline': return WrenchIcon;
      default: return TrendingUp;
    }
  };
  const Icon = getIcon();
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center border-4"
        style={{ borderColor: color, backgroundColor: `${color}10` }}
      >
        <div className="flex flex-col items-center">
          <Icon className="h-5 w-5 mb-1" style={{ color }} />
          <span className="text-lg font-bold" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="text-xs text-gray-600 text-center max-w-[80px]">{label}</span>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Prefetch data for better performance
  usePrefetchDashboardData();

  // Calcular rango de fechas del mes seleccionado
  const dateRange = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const dateFrom = new Date(year, month, 1);
    const dateTo = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    return {
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    };
  }, [selectedMonth]);

  // Queries
  const { data: metrics, isLoading: loadingMetrics } = trpc.dashboard.getMetrics.useQuery(dateRange);
  const { data: alertsData } = trpc.alerts.getAll.useQuery({ limit: 15 });
  const { data: appointmentsData } = trpc.appointments.getUpcoming.useQuery({ limit: 5 });
  const { data: predictionsData, isLoading: loadingPredictions } = trpc.aiPredictions.getDashboardPredictions.useQuery();

  // Navegación de mes
  const navigatePreviousMonth = useCallback(() => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const navigateNextMonth = useCallback(() => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedMonth(new Date());
  }, []);

  // Estado de alertas
  const hasAlerts = (alertsData?.urgent || 0) + (alertsData?.warning || 0) > 0;
  const alertCount = (alertsData?.urgent || 0) + (alertsData?.warning || 0);

  // Label del mes
  const monthLabel = selectedMonth.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
    .charAt(0).toUpperCase() + selectedMonth.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).slice(1);

  // Predicciones IA
  const aiPredictions = {
    revenueGrowth: predictionsData?.revenue?.predicted || "N/A",
    clientsAtRisk: predictionsData?.churn?.atRisk || 0,
    pianosNeedingMaintenance: predictionsData?.maintenance?.needed || 0,
  };

  // Próximas citas
  const upcomingAppointments = appointmentsData?.appointments || [];

  if (loadingMetrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <PageHeader 
        title="INICIO" 
        subtitle="Panel de control principal" 
      />
      
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Alerta de Licencias */}
        <LicenseExpirationAlert />

        {/* 1. BARRA DE ALERTAS */}
        <button
          onClick={() => navigate('/alertas')}
          className="w-full flex items-center justify-between px-5 py-4 rounded-lg transition-all duration-200 shadow-sm"
          style={{ backgroundColor: hasAlerts ? COLORS.alertDanger : COLORS.alertSuccess }}
        >
          <div className="flex items-center gap-3 text-white">
            {hasAlerts ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            <span className="font-semibold text-base">
              {hasAlerts
                ? `${alertCount} ${alertCount === 1 ? 'alerta requiere' : 'alertas requieren'} tu atención`
                : t('home.alerts.allGood')}
            </span>
          </div>
          {hasAlerts && (
            <span className="text-white font-medium">Ver →</span>
          )}
        </button>

        {/* 2. SECCIÓN "ESTE MES" + PREDICCIONES IA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Este Mes - Grid 2x2 */}
          <Card className="shadow-md border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
                  Este Mes
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={navigatePreviousMonth}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToToday}
                    className="min-w-[100px] h-8 text-sm"
                  >
                    {monthLabel}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={navigateNextMonth}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/agenda')}
                    className="h-8 w-8"
                  >
                    <Calendar className="h-4 w-4" style={{ color: COLORS.aiWarning }} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  icon={Wrench}
                  iconColor={COLORS.services}
                  value={metrics?.services ?? 0}
                  label={t('home.thisMonth.services')}
                  onPress={() => navigate('/servicios')}
                />
                <MetricCard
                  icon={DollarSign}
                  iconColor={COLORS.income}
                  value={`${metrics?.revenue?.toFixed(0) ?? 0} €`}
                  label={t('home.thisMonth.income')}
                  onPress={() => navigate('/facturacion')}
                />
                <MetricCard
                  icon={Users}
                  iconColor={COLORS.clients}
                  value={metrics?.clients ?? 0}
                  label={t('home.thisMonth.clients')}
                  onPress={() => navigate('/clientes')}
                />
                <MetricCard
                  icon={Music}
                  iconColor={COLORS.pianos}
                  value={metrics?.pianos ?? 0}
                  label={t('home.thisMonth.pianos')}
                  onPress={() => navigate('/pianos')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Predicciones IA */}
          <Card className="shadow-md border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.pianos}20` }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.pianos }} />
                  </div>
                  <CardTitle className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
                    {t('home.aiPredictions.title')}
                  </CardTitle>
                </div>
                <button 
                  onClick={() => navigate('/previsiones')}
                  className="text-sm font-medium hover:underline"
                  style={{ color: COLORS.primary }}
                >
                  {t('home.aiPredictions.viewAll')} →
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around items-center py-4">
                <CircularIndicator
                  color={COLORS.income}
                  icon="trending-up"
                  label={t('home.aiPredictions.predictedIncome')}
                  value={loadingPredictions ? "..." : aiPredictions.revenueGrowth}
                />
                <CircularIndicator
                  color={COLORS.aiWarning}
                  icon="help-circle-outline"
                  label={t('home.aiPredictions.riskClients')}
                  value={loadingPredictions ? "..." : aiPredictions.clientsAtRisk.toString()}
                />
                <CircularIndicator
                  color={COLORS.pianos}
                  icon="build-outline"
                  label={t('home.aiPredictions.upcomingMaintenance')}
                  value={loadingPredictions ? "..." : aiPredictions.pianosNeedingMaintenance.toString()}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. PRÓXIMAS CITAS + ACCIONES RÁPIDAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Próximas Citas */}
          <Card className="shadow-md border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
                {t('home.upcomingAppointments.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 3).map((apt: any) => (
                    <button
                      key={apt.id}
                      onClick={() => navigate(`/agenda`)}
                      className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="flex flex-col items-center justify-center px-3 py-2 rounded-lg" style={{ backgroundColor: `${COLORS.primary}10` }}>
                        <Clock className="h-5 w-5 mb-1" style={{ color: COLORS.primary }} />
                        <span className="text-xs font-medium" style={{ color: COLORS.primary }}>
                          {new Date(apt.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-base" style={{ color: COLORS.textPrimary }}>
                          {apt.service_type || 'Servicio'}
                        </div>
                        <div className="text-sm" style={{ color: COLORS.textSecondary }}>
                          {apt.client_name || 'Cliente no especificado'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t('home.upcomingAppointments.noAppointments')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card className="shadow-md border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
                {t('home.quickActions.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => navigate('/cliente-nuevo')}
                  className="h-auto flex-col gap-2 py-4 text-white shadow-sm hover:shadow-md transition-all"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  <UserPlus className="h-6 w-6" />
                  <span className="text-sm font-medium">{t('home.quickActions.newClient')}</span>
                </Button>
                
                <Button
                  onClick={() => navigate('/servicio-nuevo')}
                  className="h-auto flex-col gap-2 py-4 text-white shadow-sm hover:shadow-md transition-all"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  <Wrench className="h-6 w-6" />
                  <span className="text-sm font-medium">{t('home.quickActions.newService')}</span>
                </Button>
                
                <Button
                  onClick={() => navigate('/factura-nueva')}
                  className="h-auto flex-col gap-2 py-4 text-white shadow-sm hover:shadow-md transition-all"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm font-medium">{t('home.quickActions.newInvoice')}</span>
                </Button>
                
                <Button
                  onClick={() => navigate('/cita-nueva')}
                  className="h-auto flex-col gap-2 py-4 text-white shadow-sm hover:shadow-md transition-all"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  <CalendarPlus className="h-6 w-6" />
                  <span className="text-sm font-medium">{t('home.quickActions.newAppointment')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
