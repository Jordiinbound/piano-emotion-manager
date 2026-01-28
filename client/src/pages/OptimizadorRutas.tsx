/**
 * Optimizador de Rutas Page
 * Piano Emotion Manager
 * 
 * Página dedicada para optimización de rutas de visitas
 */

import { trpc } from '@/lib/trpc';
import RouteOptimizerCard from '@/components/RouteOptimizerCard';
import { useTranslation } from '@/hooks/use-translation';
import { Route, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function OptimizadorRutas() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // Obtener próximas citas
  const { data: upcomingAppointments, isLoading } = trpc.appointments.getUpcomingAppointments.useQuery();

  const appointments = upcomingAppointments || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#003a8c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setLocation('/agenda')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Route className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">{t('appointments.routeOptimizer')}</h1>
                  <p className="text-sm text-blue-100 mt-1">
                    {t('appointments.optimizeRouteDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003a8c]"></div>
          </div>
        ) : (
          <RouteOptimizerCard appointments={appointments} />
        )}
      </div>
    </div>
  );
}
