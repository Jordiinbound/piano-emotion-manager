/**
 * Piano Form Modal
 * Piano Emotion Manager
 * 
 * Formulario modal para crear/editar pianos con validación Zod
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';

// Esquema de validación Zod (adaptado al router de pianos)
const pianoSchema = z.object({
  clientId: z.number().min(1, 'Debes seleccionar un cliente'),
  brand: z.string().min(2, 'La marca debe tener al menos 2 caracteres'),
  model: z.string().min(1, 'El modelo es obligatorio'),
  serialNumber: z.string().optional(),
  manufactureYear: z.number().min(1800).max(new Date().getFullYear() + 1).optional(),
  category: z.enum(['vertical', 'grand']),
  pianoType: z.string().min(2, 'El tipo de piano es obligatorio'),
  condition: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type PianoFormData = z.infer<typeof pianoSchema>;

interface PianoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pianoId?: number;
  onSuccess?: () => void;
}

export default function PianoFormModal({
  isOpen,
  onClose,
  pianoId,
  onSuccess,
}: PianoFormModalProps) {
  const utils = trpc.useUtils();
  const isEditing = !!pianoId;

  // Query para obtener datos del piano si estamos editando
  const { data: piano } = trpc.pianos.getPianoById.useQuery(
    { id: pianoId! },
    { enabled: isEditing }
  );

  // Obtener clientes para el select
  const { data: clientsData } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 100 });

  // Mutaciones
  const createMutation = trpc.pianos.createPiano.useMutation({
    onSuccess: () => {
      utils.pianos.getPianos.invalidate();
      utils.pianos.getStats.invalidate();
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = trpc.pianos.updatePiano.useMutation({
    onSuccess: () => {
      utils.pianos.getPianos.invalidate();
      utils.pianos.getStats.invalidate();
      utils.pianos.getPianoById.invalidate({ id: pianoId! });
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
  } = useForm<PianoFormData>({
    resolver: zodResolver(pianoSchema),
    defaultValues: {
      clientId: 0,
      brand: '',
      model: '',
      serialNumber: '',
      manufactureYear: new Date().getFullYear(),
      category: 'vertical',
      pianoType: '',
      condition: '',
      location: '',
      notes: '',
    },
  });

  // Cargar datos del piano al editar
  useEffect(() => {
    if (piano) {
      reset({
        clientId: piano.clientId,
        brand: piano.brand,
        model: piano.model || '',
        serialNumber: piano.serialNumber || '',
        manufactureYear: piano.year || undefined,
        category: piano.category as 'vertical' | 'grand',
        pianoType: piano.pianoType,
        condition: piano.condition,
        location: piano.location || '',
        notes: piano.notes || '',
      });
    }
  }, [piano, reset]);

  const onSubmit = async (data: PianoFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: pianoId,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error al guardar piano:', error);
    }
  };

  if (!isOpen) return null;

  const clients = clientsData?.clients || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Piano' : 'Nuevo Piano'}
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

          {/* Marca y Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                {...register('brand')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Yamaha, Kawai, Steinway..."
              />
              {errors.brand && (
                <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo <span className="text-red-500">*</span>
              </label>
              <input
                {...register('model')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="U1, K-300, B211..."
              />
            </div>
          </div>

          {/* Número de Serie y Año */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Serie
              </label>
              <input
                {...register('serialNumber')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <input
                {...register('manufactureYear', { valueAsNumber: true })}
                type="number"
                min="1800"
                max={new Date().getFullYear() + 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={new Date().getFullYear().toString()}
              />
              {errors.manufactureYear && (
                <p className="text-red-500 text-sm mt-1">{errors.manufactureYear.message}</p>
              )}
            </div>
          </div>

          {/* Categoría y Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="vertical">Vertical</option>
                <option value="grand">De Cola</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <input
                {...register('pianoType')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Acústico, Digital, Híbrido..."
              />
              {errors.pianoType && (
                <p className="text-red-500 text-sm mt-1">{errors.pianoType.message}</p>
              )}
            </div>
          </div>

          {/* Condición */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condición <span className="text-red-500">*</span>
            </label>
            <select
              {...register('condition')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="excellent">Excelente</option>
              <option value="good">Buena</option>
              <option value="fair">Regular</option>
              <option value="poor">Pobre</option>
              <option value="needs_repair">Necesita Reparación</option>
            </select>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              {...register('location')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Salón principal, Sala de música..."
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
              placeholder="Notas adicionales sobre el piano"
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
                ? 'Actualizar Piano'
                : 'Crear Piano'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
