import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  initialPosition?: number; // 0-100, default 50
  className?: string;
}

/**
 * Componente de comparación antes/después con control deslizante interactivo
 * Permite comparar dos imágenes arrastrando un slider vertical
 */
export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Antes',
  afterLabel = 'Después',
  initialPosition = 50,
  className = '',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Manejar movimiento del slider
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  // Mouse events
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events
  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Agregar event listeners globales para mouse y touch
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, sliderPosition]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Imagen "Después" (fondo completo) */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-contain"
          draggable={false}
        />
        {/* Label "Después" */}
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm font-semibold shadow-lg">
          {afterLabel}
        </div>
      </div>

      {/* Imagen "Antes" (con clip-path dinámico) */}
      <div
        className="absolute inset-0 transition-none"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-contain"
          draggable={false}
        />
        {/* Label "Antes" */}
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold shadow-lg">
          {beforeLabel}
        </div>
      </div>

      {/* Línea divisoria vertical */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
        style={{
          left: `${sliderPosition}%`,
          transform: 'translateX(-50%)',
        }}
      />

      {/* Handle deslizante */}
      <div
        className={`absolute top-1/2 w-12 h-12 -mt-6 -ml-6 bg-white rounded-full shadow-xl cursor-ew-resize flex items-center justify-center transition-transform ${
          isDragging ? 'scale-110' : 'hover:scale-105'
        }`}
        style={{
          left: `${sliderPosition}%`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <ArrowLeftRight className="w-6 h-6 text-gray-700" />
      </div>

      {/* Área de arrastre invisible (toda la imagen) */}
      <div
        className="absolute inset-0 cursor-ew-resize"
        onMouseDown={(e) => {
          handleMove(e.clientX);
          handleMouseDown();
        }}
        onTouchStart={(e) => {
          if (e.touches[0]) {
            handleMove(e.touches[0].clientX);
            handleTouchStart();
          }
        }}
      />
    </div>
  );
}
