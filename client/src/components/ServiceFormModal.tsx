/**
 * Service Form Modal
 * Piano Emotion Manager
 * 
 * Formulario modal para crear/editar servicios con validación Zod
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';

// Esquema de validación Zod (adaptado al schema real de la BD)
const serviceSchema = z.object({
  serviceType: z.enum([
    'tuning',
    'repair',
    'regulation',
    'maintenance_basic',
    'maintenance_complete',
    'maintenance_premium',
    'inspection',
    'restoration',
    'other',
  ]),
  clientId: z.number().min(1, 'Debes seleccionar un cliente'),
  pianoId: z.number().min(1, 'Debes seleccionar un piano'),
  date: z.string().min(1, 'Debes seleccionar una fecha'),
  cost: z.number().min(0, 'El costo debe ser mayor o igual a 0').optional(),
  duration: z.number().min(1, 'La duración debe ser al menos 1 hora').optional(),
  notes: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: number;
  onSuccess?: () => void;
}

export default function ServiceFormModal({
  isOpen,
  onClose,
  serviceId,
  onSuccess,
}: ServiceFormModalProps) {
  const utils = trpc.useUtils();
  const isEditing = !!serviceId;

  // Query para obtener datos del servicio si estamos editando
  const { data: service } = trpc.services.getServiceById.useQuery(
    { id: serviceId! },
    { enabled: isEditing }
  );

  // Obtener clientes y pianos para los selects
  const { data: clientsData } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 100 });
  const { data: pianosData } = trpc.pianos.getPianos.useQuery({ page: 1, pageSize: 100 });

  // Mutaciones
  const createMutation = trpc.services.createService.useMutation({
    onSuccess: () => {
      utils.services.getServices.invalidate();
      utils.services.getStats.invalidate();
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = trpc.services.updateService.useMutation({
    onSuccess: () => {
      utils.services.getServices.invalidate();
      utils.services.getStats.invalidate();
      utils.services.getServiceById.invalidate({ id: serviceId! });
      onSuccess?.();
      onClose();
    },
  });

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      serviceType: 'tuning',
      clientId: 0,
      pianoId: 0,
      date: '',
      cost: 0,
      duration: 2,
      notes: '',
    },
  });

  // Cargar datos del servicio al editar
  useEffect(() => {
    if (service) {
      reset({
        serviceType: service.serviceType as any,
        clientId: service.clientId,
        pianoId: service.pianoId,
        date: new Date(service.date).toISOString().slice(0, 16),
        cost: service.cost ? parseFloat(service.cost) : 0,
        duration: service.duration || 2,
        notes: service.notes || '',
      });
    }
  }, [service, reset]);

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: serviceId,
          ...data,
          date: new Date(data.date).toISOString(),
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          date: new Date(data.date).toISOString(),
        });
      }
    } catch (error) {
      console.error('Error al guardar servicio:', error);
    }
  };

  if (!isOpen) return null;

  const clients = clientsData?.clients || [];
  const pianos = pianosData?.pianos || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Tipo de Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Servicio <span className="text-red-500">*</span>
            </label>
            <select
              {...register('serviceType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tuning">Afinación</option>
              <option value="repair">Reparación</option>
              <option value="regulation">Regulación</option>
              <option value="maintenance_basic">Mantenimiento Básico</option>
              <option value="maintenance_complete">Mantenimiento Completo</option>
              <option value="maintenance_premium">Mantenimiento Premium</option>
              <option value="inspection">Inspección</option>
              <option value="restoration">Restauración</option>
              <option value="other">Otro</option>
            </select>
            {errors.serviceType && (
              <p className="text-red-500 text-sm mt-1">{errors.serviceType.message}</p>
            )}
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              {...register('clientId', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>Seleccionar cliente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>
            )}
          </div>

          {/* Piano */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Piano <span className="text-red-500">*</span>
            </label>
            <select
              {...register('pianoId', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>Seleccionar piano...</option>
              {pianos.map((piano) => (
                <option key={piano.id} value={piano.id}>
                  {piano.brand} {piano.model}
                </option>
              ))}
            </select>
            {errors.pianoId && (
              <p className="text-red-500 text-sm mt-1">{errors.pianoId.message}</p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              {...register('date')}
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Costo y Duración */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo (€)
              </label>
              <input
                {...register('cost', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="text-red-500 text-sm mt-1">{errors.cost.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (horas)
              </label>
              <input
                {...register('duration', { valueAsNumber: true })}
                type="number"
                step="0.5"
                min="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Notas adicionales sobre el servicio"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Guardando...'
                : isEditing
                ? 'Actualizar Servicio'
                : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
