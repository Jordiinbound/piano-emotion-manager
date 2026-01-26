import { Users, Phone, Edit2, Trash2 } from 'lucide-react';

// Paleta profesional minimalista (del drawer original)
const COLORS = {
  primary: '#003a8c',
  background: '#ffffff',
  surface: '#f8f9fa',
  border: '#e5e7eb',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  accent: '#e07a5f',
};

// Labels de tipos de cliente (del proyecto original)
const CLIENT_TYPE_LABELS: Record<string, string> = {
  particular: 'Particular',
  student: 'Estudiante',
  professional: 'Profesional',
  music_school: 'Escuela de Música',
  conservatory: 'Conservatorio',
  concert_hall: 'Sala de Conciertos',
};

interface ClientCardProps {
  client: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    clientType: string;
  };
  pianoCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientCard({ client, pianoCount, onEdit, onDelete }: ClientCardProps) {
  // Obtener iniciales del nombre
  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      aria-label={`Cliente ${client.name}, ${CLIENT_TYPE_LABELS[client.clientType] || client.clientType}, ${pianoCount} pianos`}
    >
      {/* Avatar con iniciales */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
        style={{ backgroundColor: COLORS.accent }}
      >
        {initials}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {client.name}
        </h3>
        <p className="text-sm text-gray-600 mt-0.5">
          {CLIENT_TYPE_LABELS[client.clientType] || client.clientType}
        </p>
        {client.phone && (
          <div className="flex items-center gap-1.5 mt-1">
            <Phone className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-sm text-gray-600">{client.phone}</span>
          </div>
        )}
      </div>

      {/* Lado derecho: badge de pianos y botones de acción */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md"
          style={{ backgroundColor: `${COLORS.accent}15` }}
        >
          <Users className="w-4 h-4" style={{ color: COLORS.accent }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.accent }}>
            {pianoCount}
          </span>
        </div>
        
        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Editar cliente"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Eliminar cliente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
