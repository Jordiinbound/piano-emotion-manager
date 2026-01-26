import { Wrench, Calendar, Music, User, Euro, Edit2, Trash2 } from "lucide-react";

interface ServiceCardProps {
  service: {
    id: number;
    serviceType: string;
    date: string | Date;
    cost?: number | string | null;
    notes?: string | null;
    clientId: number;
    pianoId: number;
  };
  pianoInfo?: string;
  clientName?: string;
  isPast?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  tuning: 'Afinación',
  maintenance_basic: 'Mantenimiento Básico',
  maintenance_complete: 'Mantenimiento Completo',
  maintenance_premium: 'Mantenimiento Premium',
  repair: 'Reparación',
  regulation: 'Regulación',
};

const SERVICE_TYPE_COLORS: Record<string, string> = {
  tuning: '#3b82f6',
  maintenance_basic: '#10b981',
  maintenance_complete: '#10b981',
  maintenance_premium: '#10b981',
  repair: '#f59e0b',
  regulation: '#8b5cf6',
};

export function ServiceCard({ service, pianoInfo, clientName, isPast, onEdit, onDelete }: ServiceCardProps) {
  const serviceColor = SERVICE_TYPE_COLORS[service.serviceType] || '#6b7280';
  const serviceLabel = SERVICE_TYPE_LABELS[service.serviceType] || service.serviceType;
  
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow mb-3"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${serviceColor}15` }}
        >
          <Wrench size={20} style={{ color: serviceColor }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">{serviceLabel}</h3>
            {isPast !== undefined && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isPast
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {isPast ? 'Completado' : 'Pendiente'}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar size={12} />
              <span>{formatDate(service.date)}</span>
            </div>

            {pianoInfo && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Music size={12} />
                <span className="truncate">{pianoInfo}</span>
              </div>
            )}

            {clientName && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <User size={12} />
                <span className="truncate">{clientName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cost */}
        {service.cost !== undefined && (
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
              <span>{service.cost}</span>
              <Euro size={16} />
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Editar servicio"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Eliminar servicio"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
