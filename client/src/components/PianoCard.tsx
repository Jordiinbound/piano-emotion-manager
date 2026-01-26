/**
 * PianoCard Component - Professional Minimalist Design
 * Piano Emotion Manager
 * 
 * Diseño profesional y minimalista para mostrar información de pianos
 */

interface PianoCardProps {
  piano: {
    id: number;
    brand: string;
    model: string | null;
    serialNumber: string | null;
    category: 'vertical' | 'grand';
    pianoType: string;
    condition: string;
    location: string | null;
  };
  clientName?: string;
  onClick?: () => void;
}

export function PianoCard({ piano, clientName, onClick }: PianoCardProps) {
  // Traducir categoría
  const categoryLabel = piano.category === 'vertical' ? 'Vertical' : 'De Cola';
  
  // Traducir condición
  const conditionMap: Record<string, string> = {
    excellent: 'Excelente',
    good: 'Bueno',
    fair: 'Regular',
    poor: 'Malo',
    needs_repair: 'Necesita reparación',
  };
  const conditionLabel = conditionMap[piano.condition] || piano.condition;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Icono del piano */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-[#003a8c]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>

        {/* Información del piano */}
        <div className="flex-1 min-w-0">
          {/* Marca y modelo */}
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {piano.brand} {piano.model && `- ${piano.model}`}
          </h3>

          {/* Tipo y categoría */}
          <p className="text-sm text-gray-600 mt-1">
            {piano.pianoType} • {categoryLabel}
          </p>

          {/* Cliente */}
          {clientName && (
            <p className="text-sm text-gray-500 mt-1">
              Cliente: {clientName}
            </p>
          )}

          {/* Información adicional */}
          <div className="flex items-center gap-3 mt-2">
            {/* Número de serie */}
            {piano.serialNumber && (
              <span className="text-xs text-gray-500">
                S/N: {piano.serialNumber}
              </span>
            )}

            {/* Condición */}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {conditionLabel}
            </span>
          </div>

          {/* Ubicación */}
          {piano.location && (
            <p className="text-xs text-gray-500 mt-2 truncate">
              📍 {piano.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
