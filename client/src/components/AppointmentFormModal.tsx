/**
 * Appointment Form Modal
 * Piano Emotion Manager
 * 
 * Formulario modal para crear/editar citas con validación Zod
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';

// Esquema de validación Zod (adaptado al router de appointments)
const appointmentSchema = z.object({
  clientId: z.number().min(1, 'Debes seleccionar un cliente'),
  pianoId: z.number().optional(),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  duration: z.number().min(15, 'La duración mínima es 15 minutos'),
  serviceType: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']),
  notes: z.string().optional(),
  address: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: number;
  onSuccess?: () => void;
}

export default function AppointmentFormModal({
  isOpen,
  onClose,
  appointmentId,
  onSuccess,
}: AppointmentFormModalProps) {
  const utils = trpc.useUtils();
  const isEditing = !!appointmentId;

  // Query para obtener datos de la cita si estamos editando
  const { data: appointment } = trpc.appointments.getAppointmentById.useQuery(
    { id: appointmentId! },
    { enabled: isEditing }
  );

  // Obtener clientes para el select
  const { data: clientsData } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 100 });

  // Obtener pianos para el select
  const { data: pianosData } = trpc.pianos.getPianos.useQuery({ page: 1, pageSize: 100 });

  // Mutaciones
  const createMutation = trpc.appointments.createAppointment.useMutation({
    onSuccess: () => {
      utils.appointments.getAppointments.invalidate();
      utils.appointments.getStats.invalidate();
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = trpc.appointments.updateAppointment.useMutation({
    onSuccess: () => {
      utils.appointments.getAppointments.invalidate();
      utils.appointments.getStats.invalidate();
      utils.appointments.getAppointmentById.invalidate({ id: appointmentId! });
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
  } = useForm<AppointmentFormData>({
    mode: 'onChange',
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: 0,
      pianoId: undefined,
      title: '',
      date: '',
      duration: 60,
      serviceType: '',
      status: 'scheduled',
      notes: '',
      address: '',
    },
  });

  // Cargar datos de la cita al editar
  useEffect(() => {
    if (appointment) {
      // Convertir timestamp a formato datetime-local
      const dateObj = new Date(appointment.date);
      const localDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      reset({
        clientId: appointment.clientId,
        pianoId: appointment.pianoId || undefined,
        title: appointment.title,
        date: localDate,
        duration: appointment.duration,
        serviceType: appointment.serviceType || '',
        status: appointment.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
        notes: appointment.notes || '',
        address: appointment.address || '',
      });
    }
  }, [appointment, reset]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      // Convertir datetime-local a ISO timestamp
      const dateObj = new Date(data.date);
      const isoDate = dateObj.toISOString();

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: appointmentId,
          ...data,
          date: isoDate,
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          date: isoDate,
        });
      }
    } catch (error) {
      console.error('Error al guardar cita:', error);
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
            {isEditing ? 'Editar Cita' : 'Nueva Cita'}
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
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Afinación de piano, Reparación de teclas..."
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Cliente y Piano */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Piano
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
            </div>
          </div>

          {/* Fecha y Duración */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora <span className="text-red-500">*</span>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (minutos) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('duration', { valueAsNumber: true })}
                type="number"
                min="15"
                step="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="60"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
              )}
            </div>
          </div>

          {/* Tipo de Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Servicio
            </label>
            <input
              {...register('serviceType')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Afinación, Reparación, Mantenimiento..."
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="scheduled">Programada</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              {...register('address')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Calle, número, ciudad..."
            />
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
              placeholder="Notas adicionales sobre la cita"
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
                ? 'Actualizar Cita'
                : 'Crear Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
