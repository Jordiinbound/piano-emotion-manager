/**
 * Client Form Modal
 * Piano Emotion Manager
 * 
 * Formulario modal para crear/editar clientes con validación Zod
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';

// Esquema de validación Zod
const clientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  routeGroup: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
  onSuccess?: () => void;
}

export default function ClientFormModal({
  isOpen,
  onClose,
  clientId,
  onSuccess,
}: ClientFormModalProps) {
  const utils = trpc.useUtils();
  const isEditing = !!clientId;

  // Query para obtener datos del cliente si estamos editando
  const { data: client } = trpc.clients.getClientById.useQuery(
    { id: clientId! },
    { enabled: isEditing }
  );

  // Mutaciones
  const createMutation = trpc.clients.createClient.useMutation({
    onSuccess: () => {
      utils.clients.getClients.invalidate();
      utils.clients.getStats.invalidate();
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = trpc.clients.updateClient.useMutation({
    onSuccess: () => {
      utils.clients.getClients.invalidate();
      utils.clients.getStats.invalidate();
      utils.clients.getClientById.invalidate({ id: clientId! });
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
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  // Cargar datos del cliente al editar
  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        region: client.region || '',
        routeGroup: client.routeGroup || '',
        notes: client.notes || '',
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        region: '',
        routeGroup: '',
        notes: '',
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: clientId,
          ...data,
        });
      } else {
        // odId se genera automáticamente en el backend
        await createMutation.mutateAsync({
          ...data,
          odId: '', // Se genera en el backend
        });
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
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
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre completo del cliente"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+34 600 000 000"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
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
              placeholder="Calle, número, piso"
            />
          </div>

          {/* Ciudad y Región */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                {...register('city')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Madrid"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Región
              </label>
              <input
                {...register('region')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Comunidad de Madrid"
              />
            </div>
          </div>

          {/* Grupo de Ruta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo de Ruta
            </label>
            <input
              {...register('routeGroup')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Zona Norte"
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
              placeholder="Notas adicionales sobre el cliente"
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
                ? 'Actualizar Cliente'
                : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
