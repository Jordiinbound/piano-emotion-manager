/**
 * Inventory Form Modal
 * Piano Emotion Manager
 * 
 * Formulario modal completo para crear/editar items de inventario con validación Zod
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';

// Esquema de validación Zod (adaptado al router de inventory)
const inventorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  category: z.enum(['strings','hammers','dampers','keys','action_parts','pedals','tuning_pins','felts','tools','chemicals','other']),
  description: z.string().optional(),
  quantity: z.number().min(0, 'La cantidad debe ser positiva'),
  unit: z.string().min(1, 'La unidad es obligatoria'),
  minStock: z.number().min(0, 'El stock mínimo debe ser positivo'),
  costPerUnit: z.number().min(0, 'El costo debe ser positivo').optional().or(z.literal(0)),
  supplier: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId?: number;
  onSuccess?: () => void;
}

export default function InventoryFormModal({
  isOpen,
  onClose,
  itemId,
  onSuccess,
}: InventoryFormModalProps) {
  const utils = trpc.useUtils();
  const isEditing = !!itemId;

  // Query para obtener datos del item si estamos editando
  const { data: item } = trpc.inventory.getInventoryById.useQuery(
    { id: itemId! },
    { enabled: isEditing }
  );

  // Mutaciones
  const createMutation = trpc.inventory.createInventoryItem.useMutation({
    onSuccess: () => {
      utils.inventory.getInventory.invalidate();
      utils.inventory.getStats.invalidate();
      utils.inventory.getLowStockItems.invalidate();
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = trpc.inventory.updateInventoryItem.useMutation({
    onSuccess: () => {
      utils.inventory.getInventory.invalidate();
      utils.inventory.getStats.invalidate();
      utils.inventory.getLowStockItems.invalidate();
      utils.inventory.getInventoryById.invalidate({ id: itemId! });
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
  } = useForm<InventoryFormData>({
    mode: 'onChange',
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: '',
      category: 'other',
      description: '',
      quantity: 0,
      unit: 'unidad',
      minStock: 0,
      costPerUnit: 0,
      supplier: '',
    },
  });

  // Cargar datos del item al editar
  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        category: item.category as any,
        description: item.description || '',
        quantity: item.quantity,
        unit: item.unit,
        minStock: item.minStock,
        costPerUnit: item.costPerUnit || 0,
        supplier: item.supplier || '',
      });
    }
  }, [item, reset]);

  const onSubmit = async (data: InventoryFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: itemId,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error al guardar item:', error);
    }
  };

  if (!isOpen) return null;

  // Mapeo de categorías a etiquetas en español
  const categoryLabels: Record<string, string> = {
    strings: 'Cuerdas',
    hammers: 'Macillos',
    dampers: 'Apagadores',
    keys: 'Teclas',
    action_parts: 'Partes de Acción',
    pedals: 'Pedales',
    tuning_pins: 'Clavijas',
    felts: 'Fieltros',
    tools: 'Herramientas',
    chemicals: 'Químicos',
    other: 'Otro',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Item' : 'Nuevo Item de Inventario'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del item"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Descripción detallada del item"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('quantity', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('unit')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="unidad, kg, m, etc."
                />
                {errors.unit && (
                  <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Mínimo <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('minStock', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                {errors.minStock && (
                  <p className="text-red-500 text-sm mt-1">{errors.minStock.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Proveedor y Costo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Proveedor y Costo</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <input
                  {...register('supplier')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo por Unidad (€)
                </label>
                <input
                  {...register('costPerUnit', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.costPerUnit && (
                  <p className="text-red-500 text-sm mt-1">{errors.costPerUnit.message}</p>
                )}
              </div>
            </div>
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
                ? 'Actualizar Item'
                : 'Crear Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
