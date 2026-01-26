/**
 * Reportes Page - Analytics Dashboard
 * Piano Emotion Manager
 * 
 * Dashboard de analytics con métricas principales y tendencias
 */

import { trpc } from '@/lib/trpc';
import { Wrench, DollarSign, Users, Music, TrendingUp, TrendingDown } from 'lucide-react';

export default function Reportes() {
  const { data: servicesStats } = trpc.services.getStats.useQuery();
  const { data: clientsStats } = trpc.clients.getStats.useQuery();
  const { data: pianosStats } = trpc.pianos.getStats.useQuery();
  const { data: invoicesStats } = trpc.invoices.getStats.useQuery();

  const metrics = [
    {
      title: 'Servicios',
      value: servicesStats?.total || 0,
      change: 0, // Placeholder para cambio porcentual
      icon: Wrench,
      color: '#003a8c',
    },
    {
      title: 'Ingresos',
      value: `€0.00`,
      change: 0,
      icon: DollarSign,
      color: '#047857',
    },
    {
      title: 'Clientes',
      value: clientsStats?.total || 0,
      change: 0,
      icon: Users,
      color: '#e07a5f',
    },
    {
      title: 'Pianos',
      value: pianosStats?.total || 0,
      change: 0,
      icon: Music,
      color: '#1A1A2E',
    },
  ];

  const predictions = [
    {
      label: 'Ingresos prev.',
      value: 'N/A',
      color: '#047857',
    },
    {
      label: 'Clientes riesgo',
      value: '0',
      color: '#c2410c',
    },
    {
      label: 'Mant. próximo',
      value: '0',
      color: '#1e40af',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-600 mt-1">Análisis y estadísticas del negocio</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Métricas Principales - Grid 2x2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isPositive = metric.change >= 0;
            
            return (
              <div
                key={metric.title}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${metric.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: metric.color }} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600 mb-2">{metric.title}</div>
                {metric.change !== 0 && (
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Predicciones IA */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Predicciones IA</h2>
            <button className="text-sm text-[#003a8c] hover:underline font-medium">
              Ver todo →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {predictions.map((prediction) => (
              <div key={prediction.label} className="flex flex-col items-center">
                <div
                  className="w-24 h-24 rounded-full border-4 flex items-center justify-center mb-3"
                  style={{ borderColor: prediction.color }}
                >
                  <span
                    className="text-2xl font-bold"
                    style={{ color: prediction.color }}
                  >
                    {prediction.value}
                  </span>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {prediction.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tendencias Mensuales */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tendencias Mensuales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Servicios Totales</div>
              <div className="text-2xl font-bold text-gray-900">
                {servicesStats?.total || 0}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Facturas Pagadas</div>
              <div className="text-2xl font-bold text-gray-900">
                {invoicesStats?.paid || 0}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Clientes Activos</div>
              <div className="text-2xl font-bold text-gray-900">
                {clientsStats?.active || 0}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Pianos Registrados</div>
              <div className="text-2xl font-bold text-gray-900">
                {pianosStats?.vertical || 0} + {pianosStats?.grand || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Distribución de Servicios */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Distribución de Servicios</h2>
          <div className="space-y-4">
            {servicesStats?.byType && servicesStats.byType.length > 0 ? (
              servicesStats.byType.map((item) => {
                const percentage = servicesStats.total ? (item.count / servicesStats.total) * 100 : 0;
                const colors: Record<string, string> = {
                  tuning: '#003a8c',
                  repair: '#e07a5f',
                  regulation: '#047857',
                  maintenance_basic: '#1e40af',
                  maintenance_complete: '#047857',
                  maintenance_premium: '#047857',
                  inspection: '#c2410c',
                  restoration: '#1A1A2E',
                  other: '#6b7280',
                };
                const labels: Record<string, string> = {
                  tuning: 'Afinación',
                  repair: 'Reparación',
                  regulation: 'Regulación',
                  maintenance_basic: 'Mantenimiento Básico',
                  maintenance_complete: 'Mantenimiento Completo',
                  maintenance_premium: 'Mantenimiento Premium',
                  inspection: 'Inspección',
                  restoration: 'Restauración',
                  other: 'Otros',
                };
                return (
                  <div key={item.serviceType}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">{labels[item.serviceType] || item.serviceType}</span>
                      <span className="font-medium text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: colors[item.serviceType] || '#6b7280',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay datos de servicios disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
