import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';

/**
 * Hook para prefetching inteligente de datos relacionados
 * 
 * Precarga automáticamente datos relacionados en background para mejorar la UX
 * 
 * Ejemplos de uso:
 * - Al ver un cliente → precargar sus pianos y servicios
 * - Al ver un piano → precargar su cliente y servicios
 * - Al ver un servicio → precargar su cliente y piano
 */

interface PrefetchOptions {
  enabled?: boolean;
  delay?: number; // Delay en ms antes de precargar (default: 500ms)
}

/**
 * Prefetch de pianos y servicios de un cliente
 */
export function usePrefetchClientData(clientId: number | undefined, options: PrefetchOptions = {}) {
  const { enabled = true, delay = 500 } = options;
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!enabled || !clientId) return;

    const timer = setTimeout(() => {
      // Precargar pianos del cliente
      utils.pianos.getPianos.prefetch({
        clientId,
        search: '',
        limit: 50,
      });

      // Precargar servicios del cliente
      utils.services.getServices.prefetch({
        clientId,
        search: '',
        limit: 50,
      });

      console.log('[Prefetch] Precargando datos del cliente:', clientId);
    }, delay);

    return () => clearTimeout(timer);
  }, [clientId, enabled, delay, utils]);
}

/**
 * Prefetch de cliente y servicios de un piano
 */
export function usePrefetchPianoData(pianoId: number | undefined, clientId: number | undefined, options: PrefetchOptions = {}) {
  const { enabled = true, delay = 500 } = options;
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!enabled || !pianoId) return;

    const timer = setTimeout(() => {
      // Precargar cliente del piano
      if (clientId) {
        utils.clients.getClientById.prefetch({ id: clientId });
      }

      // Precargar servicios del piano
      utils.services.getServices.prefetch({
        pianoId,
        search: '',
        limit: 50,
      });

      console.log('[Prefetch] Precargando datos del piano:', pianoId);
    }, delay);

    return () => clearTimeout(timer);
  }, [pianoId, clientId, enabled, delay, utils]);
}

/**
 * Prefetch de cliente y piano de un servicio
 */
export function usePrefetchServiceData(
  serviceId: number | undefined,
  clientId: number | undefined,
  pianoId: number | undefined,
  options: PrefetchOptions = {}
) {
  const { enabled = true, delay = 500 } = options;
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!enabled || !serviceId) return;

    const timer = setTimeout(() => {
      // Precargar cliente del servicio
      if (clientId) {
        utils.clients.getClientById.prefetch({ id: clientId });
      }

      // Precargar piano del servicio
      if (pianoId) {
        utils.pianos.getPianoById.prefetch({ id: pianoId });
      }

      console.log('[Prefetch] Precargando datos del servicio:', serviceId);
    }, delay);

    return () => clearTimeout(timer);
  }, [serviceId, clientId, pianoId, enabled, delay, utils]);
}

/**
 * Prefetch de listados principales (para dashboard)
 */
export function usePrefetchDashboardData(options: PrefetchOptions = {}) {
  const { enabled = true, delay = 1000 } = options;
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      // Precargar estadísticas
      utils.clients.getStats.prefetch();
      utils.pianos.getStats.prefetch();
      utils.services.getStats.prefetch();

      // Precargar listados principales
      utils.clients.getClients.prefetch({
        search: '',
        limit: 20,
      });

      utils.pianos.getPianos.prefetch({
        search: '',
        limit: 20,
      });

      utils.services.getServices.prefetch({
        search: '',
        limit: 20,
      });

      console.log('[Prefetch] Precargando datos del dashboard');
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, delay, utils]);
}

/**
 * Prefetch basado en navegación (al hacer hover sobre links)
 */
export function usePrefetchOnHover() {
  const utils = trpc.useUtils();

  const prefetchClient = (clientId: number) => {
    utils.clients.getClientById.prefetch({ id: clientId });
    utils.pianos.getPianos.prefetch({
      clientId,
      search: '',
      limit: 50,
    });
  };

  const prefetchPiano = (pianoId: number) => {
    utils.pianos.getPianoById.prefetch({ id: pianoId });
  };

  const prefetchService = (serviceId: number) => {
    utils.services.getServiceById.prefetch({ id: serviceId });
  };

  return {
    prefetchClient,
    prefetchPiano,
    prefetchService,
  };
}
