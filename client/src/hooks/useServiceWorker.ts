import { useState, useEffect } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isActive: false,
    registration: null,
  });

  useEffect(() => {
    if (!state.isSupported) return;

    // Verificar si ya está registrado
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        setState((prev) => ({
          ...prev,
          isRegistered: true,
          isActive: registration.active !== null,
          registration,
        }));
      }
    });

    // Escuchar cambios de estado
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        setState((prev) => ({
          ...prev,
          isActive: registration?.active !== null,
          registration: registration || null,
        }));
      });
    });
  }, [state.isSupported]);

  /**
   * Limpiar caché del Service Worker
   */
  const clearCache = async (): Promise<boolean> => {
    if (!state.registration) return false;

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success);
        };

        state.registration.active?.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('[SW] Error clearing cache:', error);
      return false;
    }
  };

  /**
   * Desregistrar Service Worker
   */
  const unregister = async (): Promise<boolean> => {
    if (!state.registration) return false;

    try {
      const success = await state.registration.unregister();
      if (success) {
        setState((prev) => ({
          ...prev,
          isRegistered: false,
          isActive: false,
          registration: null,
        }));
      }
      return success;
    } catch (error) {
      console.error('[SW] Error unregistering:', error);
      return false;
    }
  };

  /**
   * Actualizar Service Worker
   */
  const update = async (): Promise<boolean> => {
    if (!state.registration) return false;

    try {
      await state.registration.update();
      return true;
    } catch (error) {
      console.error('[SW] Error updating:', error);
      return false;
    }
  };

  return {
    ...state,
    clearCache,
    unregister,
    update,
  };
}
