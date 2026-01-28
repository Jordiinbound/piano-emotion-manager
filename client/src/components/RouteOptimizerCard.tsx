import React, { useState, useCallback } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { MapPin, Route, Clock, Navigation, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import { MapView } from './Map';

interface RouteOptimizerCardProps {
  appointments: any[];
}

export default function RouteOptimizerCard({ appointments }: RouteOptimizerCardProps) {
  const { t } = useTranslation();
  const [selectedAppointments, setSelectedAppointments] = useState<number[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  const { data: routeData } = trpc.appointments.optimizeRoute.useQuery(
    { appointmentIds: selectedAppointments },
    { enabled: false }
  );

  const handleMapReady = useCallback((map: google.maps.Map) => {
    setMapReady(true);
    const service = new google.maps.DirectionsService();
    const renderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeWeight: 4,
      },
    });
    setDirectionsService(service);
    setDirectionsRenderer(renderer);
  }, []);

  const toggleAppointment = (id: number) => {
    setSelectedAppointments((prev) =>
      prev.includes(id) ? prev.filter((aptId) => aptId !== id) : [...prev, id]
    );
  };

  const optimizeRoute = async () => {
    if (selectedAppointments.length < 2) {
      toast.error(t('appointments.selectAtLeast2'));
      return;
    }

    if (!directionsService || !directionsRenderer) {
      toast.error(t('appointments.mapNotReady'));
      return;
    }

    setIsOptimizing(true);

    try {
      // Obtener datos de las citas seleccionadas
      const response = await trpc.appointments.optimizeRoute.useQuery({
        appointmentIds: selectedAppointments,
      }).refetch();

      if (!response.data) {
        throw new Error('No route data received');
      }

      const appointmentsData = response.data.appointments;

      if (appointmentsData.length < 2) {
        toast.error(t('appointments.notEnoughValidAddresses'));
        setIsOptimizing(false);
        return;
      }

      // Configurar origen, destino y waypoints
      const origin = appointmentsData[0].address;
      const destination = appointmentsData[appointmentsData.length - 1].address;
      const waypoints = appointmentsData.slice(1, -1).map((apt: any) => ({
        location: apt.address,
        stopover: true,
      }));

      // Calcular ruta con Google Maps Directions API
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);

            // Calcular tiempo y distancia totales
            let totalDistance = 0;
            let totalDuration = 0;

            result.routes[0].legs.forEach((leg) => {
              totalDistance += leg.distance?.value || 0;
              totalDuration += leg.duration?.value || 0;
            });

            setOptimizedRoute({
              totalDistance: (totalDistance / 1000).toFixed(2), // km
              totalDuration: Math.round(totalDuration / 60), // minutos
              waypointOrder: result.routes[0].waypoint_order,
              appointments: appointmentsData,
            });

            toast.success(t('appointments.routeOptimized'));
          } else {
            toast.error(t('appointments.routeOptimizationFailed'));
          }
          setIsOptimizing(false);
        }
      );
    } catch (error) {
      console.error('Route optimization error:', error);
      toast.error(t('common.error'));
      setIsOptimizing(false);
    }
  };

  const exportToGoogleMaps = () => {
    if (!optimizedRoute) return;

    const { appointments, waypointOrder } = optimizedRoute;
    
    // Construir URL de Google Maps con waypoints en orden optimizado
    const origin = appointments[0].address;
    const destination = appointments[appointments.length - 1].address;
    const waypoints = waypointOrder
      .map((index: number) => appointments[index + 1].address)
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(
      waypoints
    )}&travelmode=driving`;

    window.open(url, '_blank');
    toast.success(t('appointments.openedInGoogleMaps'));
  };

  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as any);
    }
    setOptimizedRoute(null);
    setSelectedAppointments([]);
  };

  // Filtrar citas del día actual o futuras
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== 'cancelled' && apt.status !== 'completed';
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          {t('appointments.routeOptimizer')}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de citas */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">{t('appointments.selectAppointments')}</h4>
              {todayAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('appointments.noAppointmentsToOptimize')}
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedAppointments.includes(apt.id)}
                        onCheckedChange={() => toggleAppointment(apt.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{apt.client?.name || t('common.unknown')}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.client?.address || t('appointments.noAddress')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(apt.scheduledDate).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={optimizeRoute}
                disabled={selectedAppointments.length < 2 || isOptimizing}
                className="flex-1"
              >
                <Route className="mr-2 h-4 w-4" />
                {isOptimizing ? t('common.loading') : t('appointments.optimizeRoute')}
              </Button>
              {optimizedRoute && (
                <Button variant="outline" onClick={clearRoute}>
                  {t('common.clear')}
                </Button>
              )}
            </div>

            {/* Resultados de optimización */}
            {optimizedRoute && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold">{t('appointments.routeSummary')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('appointments.totalDistance')}</p>
                      <p className="font-medium">{optimizedRoute.totalDistance} km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('appointments.estimatedTime')}</p>
                      <p className="font-medium">{optimizedRoute.totalDuration} min</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={exportToGoogleMaps}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t('appointments.openInGoogleMaps')}
                </Button>
              </div>
            )}
          </div>

          {/* Mapa */}
          <div className="h-[500px] rounded-lg overflow-hidden border">
            <MapView
              onMapReady={handleMapReady}
              defaultCenter={{ lat: 40.4168, lng: -3.7038 }} // Madrid por defecto
              defaultZoom={12}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
