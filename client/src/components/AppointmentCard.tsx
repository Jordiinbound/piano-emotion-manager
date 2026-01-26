/**
 * AppointmentCard Component - Professional Minimalist Design
 * Piano Emotion Manager
 * 
 * Diseño profesional y minimalista para mostrar información de citas
 */

import { Edit2, Trash2 } from 'lucide-react';

interface AppointmentCardProps {
  appointment: {
    id: number;
    title: string;
    date: string; // ISO timestamp
    duration: number;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    serviceType?: string | null;
    notes?: string | null;
    clientName?: string | null;
    pianoBrand?: string | null;
    pianoModel?: string | null;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function AppointmentCard({ appointment, onEdit, onDelete }: AppointmentCardProps) {
  // Formatear fecha y hora
  const date = new Date(appointment.date);
  const timeString = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString('es-ES', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  // Traducir estado
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    scheduled: { label: 'Programada', color: '#003a8c', bgColor: '#e6f0ff' },
    confirmed: { label: 'Confirmada', color: '#16a34a', bgColor: '#dcfce7' },
    completed: { label: 'Completada', color: '#16a34a', bgColor: '#dcfce7' },
    cancelled: { label: 'Cancelada', color: '#dc2626', bgColor: '#fee2e2' },
  };

  const statusInfo = statusMap[appointment.status] || statusMap.scheduled;

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* Hora */}
        <div className="flex-shrink-0 text-center min-w-[60px]">
          <p className="text-lg font-semibold text-gray-900">{timeString}</p>
          <p className="text-xs text-gray-500 mt-1">{dateString}</p>
        </div>

        {/* Barra de estado vertical */}
        <div
          className="w-1 self-stretch rounded-full"
          style={{ backgroundColor: statusInfo.color }}
        ></div>

        {/* Información de la cita */}
        <div className="flex-1 min-w-0">
          {/* Cliente */}
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {appointment.clientName || 'Cliente'}
          </h3>

          {/* Título */}
          <p className="text-sm text-gray-600 mt-1">{appointment.title}</p>

          {/* Piano */}
          {appointment.pianoBrand && (
            <p className="text-sm text-gray-500 mt-1">
              🎹 {appointment.pianoBrand} {appointment.pianoModel}
            </p>
          )}

          {/* Tipo de servicio y duración */}
          <div className="flex items-center gap-3 mt-2">
            {appointment.serviceType && (
              <span className="text-xs text-gray-600">{appointment.serviceType}</span>
            )}
            <span className="text-xs text-gray-500">{appointment.duration} min</span>
          </div>

          {/* Estado */}
          <div className="mt-2">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={{
                color: statusInfo.color,
                backgroundColor: statusInfo.bgColor,
              }}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Editar cita"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Eliminar cita"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
