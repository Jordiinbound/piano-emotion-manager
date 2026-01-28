import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

interface PhotoLightboxProps {
  photos: string[]; // Array de URLs de fotos
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number; // Índice de la foto inicial a mostrar
}

/**
 * Lightbox profesional con zoom y navegación entre fotos
 * Usa yet-another-react-lightbox con plugin de zoom
 */
export function PhotoLightbox({
  photos,
  isOpen,
  onClose,
  initialIndex = 0,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Convertir URLs a formato de lightbox
  const slides = photos.map((url) => ({
    src: url,
    alt: `Foto ${photos.indexOf(url) + 1}`,
  }));

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={slides}
      index={currentIndex}
      on={{
        view: ({ index }) => setCurrentIndex(index),
      }}
      plugins={[Zoom]}
      zoom={{
        maxZoomPixelRatio: 3, // Zoom máximo 3x
        zoomInMultiplier: 2, // Multiplicador de zoom in
        doubleTapDelay: 300, // Delay para doble tap
        doubleClickDelay: 300, // Delay para doble click
        doubleClickMaxStops: 2, // Máximo de paradas en doble click
        keyboardMoveDistance: 50, // Distancia de movimiento con teclado
        wheelZoomDistanceFactor: 100, // Factor de zoom con rueda
        pinchZoomDistanceFactor: 100, // Factor de zoom con pinch
        scrollToZoom: true, // Permitir zoom con scroll
      }}
      animation={{
        fade: 250, // Duración de fade in/out
        swipe: 250, // Duración de swipe
        easing: {
          fade: 'ease', // Easing de fade
          swipe: 'ease-out', // Easing de swipe
          navigation: 'ease-in-out', // Easing de navegación
        },
      }}
      carousel={{
        finite: false, // Permitir loop infinito
        preload: 2, // Precargar 2 imágenes adelante y atrás
        padding: '16px', // Padding entre imágenes
        spacing: '30%', // Espaciado entre imágenes
        imageFit: 'contain', // Ajuste de imagen
      }}
      controller={{
        closeOnBackdropClick: true, // Cerrar al hacer click en el fondo
        closeOnPullDown: true, // Cerrar al hacer pull down (móvil)
        closeOnPullUp: false, // No cerrar al hacer pull up
      }}
      render={{
        buttonPrev: photos.length <= 1 ? () => null : undefined, // Ocultar botón prev si solo hay 1 foto
        buttonNext: photos.length <= 1 ? () => null : undefined, // Ocultar botón next si solo hay 1 foto
        iconPrev: () => (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        ),
        iconNext: () => (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        ),
        iconClose: () => (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ),
        iconZoomIn: () => (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        ),
        iconZoomOut: () => (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        ),
      }}
      styles={{
        container: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)', // Fondo oscuro semi-transparente
        },
        button: {
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))', // Sombra en botones
        },
      }}
    />
  );
}
