/**
 * Mapa de Clientes Page
 * Piano Emotion Manager
 * 
 * Visualización geográfica de clientes con Google Maps
 * Incluye marcadores, clustering, InfoWindow y filtros por región/provincia
 */

import { useState, useEffect, useCallback } from 'react';
import { MapView } from '@/components/Map';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Filter, X } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';

export default function MapaClientes() {
  const { t } = useTranslation();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [markerClusterer, setMarkerClusterer] = useState<any>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Obtener clientes
  const { data: clients, isLoading } = trpc.clients.getAll.useQuery();

  // Obtener lista única de provincias y ciudades
  const provinces = Array.from(new Set(clients?.map(c => c.province).filter(Boolean))) as string[];
  const cities = Array.from(new Set(clients?.map(c => c.city).filter(Boolean))) as string[];

  // Filtrar clientes según criterios
  const filteredClients = clients?.filter(client => {
    const matchesSearch = searchTerm === '' || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvince = selectedProvince === 'all' || client.province === selectedProvince;
    const matchesCity = selectedCity === 'all' || client.city === selectedCity;

    return matchesSearch && matchesProvince && matchesCity;
  });

  // Inicializar mapa
  const handleMapReady = useCallback(async (googleMap: google.maps.Map) => {
    setMap(googleMap);
    
    // Crear InfoWindow reutilizable
    const infoWin = new google.maps.InfoWindow();
    setInfoWindow(infoWin);

    // Importar MarkerClusterer dinámicamente
    try {
      const { MarkerClusterer } = await import('@googlemaps/markerclusterer');
      const clusterer = new MarkerClusterer({ map: googleMap, markers: [] });
      setMarkerClusterer(clusterer);
    } catch (error) {
      console.error('Error loading MarkerClusterer:', error);
    }
  }, []);

  // Crear o actualizar marcadores cuando cambien los clientes filtrados
  useEffect(() => {
    if (!map || !filteredClients || !infoWindow) return;

    // Limpiar marcadores anteriores
    markers.forEach(marker => marker.setMap(null));
    if (markerClusterer) {
      markerClusterer.clearMarkers();
    }

    // Crear servicio de geocodificación
    const geocoder = new google.maps.Geocoder();
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    // Procesar cada cliente
    filteredClients.forEach(async (client) => {
      if (!client.address || !client.city) return;

      const fullAddress = `${client.address}, ${client.city}${client.province ? ', ' + client.province : ''}, ${client.country || 'España'}`;

      try {
        const result = await geocoder.geocode({ address: fullAddress });
        
        if (result.results[0]) {
          const position = result.results[0].geometry.location;
          
          const marker = new google.maps.Marker({
            position,
            map,
            title: client.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3B82F6',
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          // Agregar listener para mostrar InfoWindow
          marker.addListener('click', () => {
            const content = `
              <div style="padding: 8px; max-width: 250px;">
                <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${client.name}</h3>
                <p style="font-size: 14px; color: #666; margin-bottom: 4px;">
                  <strong>${t('clients.phone')}:</strong> ${client.phone || t('common.notAvailable')}
                </p>
                <p style="font-size: 14px; color: #666; margin-bottom: 4px;">
                  <strong>${t('clients.email')}:</strong> ${client.email || t('common.notAvailable')}
                </p>
                <p style="font-size: 14px; color: #666; margin-bottom: 4px;">
                  <strong>${t('clients.address')}:</strong> ${client.address}
                </p>
                <p style="font-size: 14px; color: #666;">
                  <strong>${t('clients.city')}:</strong> ${client.city}${client.province ? ', ' + client.province : ''}
                </p>
                <a href="/clientes/${client.id}" style="display: inline-block; margin-top: 8px; color: #3B82F6; text-decoration: underline; font-size: 14px;">
                  ${t('common.viewDetails')}
                </a>
              </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });

          newMarkers.push(marker);
          bounds.extend(position);
        }
      } catch (error) {
        console.error(`Error geocoding address for client ${client.name}:`, error);
      }
    });

    setMarkers(newMarkers);

    // Agregar marcadores al clusterer
    if (markerClusterer && newMarkers.length > 0) {
      markerClusterer.addMarkers(newMarkers);
      
      // Ajustar vista del mapa para mostrar todos los marcadores
      if (newMarkers.length === 1) {
        map.setCenter(newMarkers[0].getPosition()!);
        map.setZoom(15);
      } else if (newMarkers.length > 1) {
        map.fitBounds(bounds);
      }
    }
  }, [map, filteredClients, infoWindow, markerClusterer, t]);

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedProvince('all');
    setSelectedCity('all');
    toast.success(t('common.filtersCleared'));
  };

  // Centrar mapa en ubicación actual
  const handleCenterOnCurrentLocation = () => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
          map.setZoom(12);
          toast.success(t('map.centeredOnCurrentLocation'));
        },
        () => {
          toast.error(t('map.geolocationError'));
        }
      );
    } else {
      toast.error(t('map.geolocationNotSupported'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-8 w-8 text-blue-600" />
                {t('map.clientsMap')}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {t('map.clientsMapDescription')}
              </p>
            </div>
            <Button variant="outline" onClick={handleCenterOnCurrentLocation}>
              <MapPin className="h-4 w-4 mr-2" />
              {t('map.centerOnCurrentLocation')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de filtros */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {t('common.filters')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Búsqueda */}
              <div>
                <Label htmlFor="search">{t('common.search')}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder={t('clients.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por provincia */}
              <div>
                <Label htmlFor="province">{t('user.province')}</Label>
                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                  <SelectTrigger id="province">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {provinces.map(province => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por ciudad */}
              <div>
                <Label htmlFor="city">{t('clients.city')}</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger id="city">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botón limpiar filtros */}
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                {t('common.clearFilters')}
              </Button>

              {/* Estadísticas */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <strong>{t('common.total')}:</strong> {filteredClients?.length || 0} {t('clients.title').toLowerCase()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mapa */}
          <Card className="lg:col-span-3">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="h-[600px] flex items-center justify-center">
                  <p className="text-gray-500">{t('common.loading')}</p>
                </div>
              ) : (
                <MapView
                  onMapReady={handleMapReady}
                  style={{ height: '600px', width: '100%' }}
                  center={{ lat: 40.4168, lng: -3.7038 }} // Madrid por defecto
                  zoom={6}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
