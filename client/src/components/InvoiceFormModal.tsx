/**
 * Invoice Form Modal
 * Piano Emotion Manager
 * 
 * Formulario modal completo para crear/editar facturas con validación Zod
 * Incluye gestión dinámica de items y cálculos automáticos
 */

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';

// Esquema de validación para un item de factura
const invoiceItemSchema = z.object({
  description: z.string().min(1, 'La descripción es obligatoria'),
  quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
  unitPrice: z.number().min(0, 'El precio debe ser positivo'),
});

// Esquema de validación Zod (adaptado al router de invoices)
const invoiceSchema = z.object({
  clientId: z.number().min(1, 'Debes seleccionar un cliente'),
  clientName: z.string().min(1, 'El nombre del cliente es obligatorio'),
  clientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  clientAddress: z.string().optional(),
  date: z.string().min(1, 'La fecha es obligatoria'),
  dueDate: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'cancelled']),
  items: z.array(invoiceItemSchema).min(1, 'Debes agregar al menos un item'),
  subtotal: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId?: number;
  onSuccess?: () => void;
}

export default function InvoiceFormModal({
  isOpen,
  onClose,
  invoiceId,
  onSuccess,
}: InvoiceFormModalProps) {
  const utils = trpc.useUtils();
  const isEditing = !!invoiceId;

  // Query para obtener datos de la factura si estamos editando
  const { data: invoice } = trpc.invoices.getInvoiceById.useQuery(
    { id: invoiceId! },
    { enabled: isEditing }
  );

  // Obtener clientes para el select
  const { data: clientsData } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 100 });

  // Mutaciones
  const createMutation = trpc.invoices.createInvoice.useMutation({
    onSuccess: () => {
      utils.invoices.getInvoices.invalidate();
      utils.invoices.getStats.invalidate();
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = trpc.invoices.updateInvoice.useMutation({
    onSuccess: () => {
      utils.invoices.getInvoices.invalidate();
      utils.invoices.getStats.invalidate();
      utils.invoices.getInvoiceById.invalidate({ id: invoiceId! });
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
    watch,
    setValue,
    control,
  } = useForm<InvoiceFormData>({
    mode: 'onChange',
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: 0,
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      date: '',
      dueDate: '',
      status: 'draft',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      notes: '',
    },
  });

  // Field array para items dinámicos
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch items para calcular totales automáticamente
  const items = watch('items');
  const clientId = watch('clientId');

  // Calcular totales automáticamente cuando cambian los items
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      return sum + (quantity * unitPrice);
    }, 0);

    const taxRate = 0.21; // 21% IVA
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    setValue('subtotal', Number(subtotal.toFixed(2)));
    setValue('taxAmount', Number(taxAmount.toFixed(2)));
    setValue('total', Number(total.toFixed(2)));
  }, [items, setValue]);

  // Actualizar clientName cuando cambia clientId
  useEffect(() => {
    if (clientId && clientsData?.clients) {
      const selectedClient = clientsData.clients.find(c => c.id === clientId);
      if (selectedClient) {
        setValue('clientName', selectedClient.name);
        setValue('clientEmail', selectedClient.email || '');
        setValue('clientAddress', selectedClient.address || '');
      }
    }
  }, [clientId, clientsData, setValue]);

  // Cargar datos de la factura al editar
  useEffect(() => {
    if (invoice) {
      // Convertir timestamp a formato date
      const dateObj = new Date(invoice.date);
      const localDate = dateObj.toISOString().split('T')[0];

      let dueDateLocal = '';
      if (invoice.dueDate) {
        const dueDateObj = new Date(invoice.dueDate);
        dueDateLocal = dueDateObj.toISOString().split('T')[0];
      }

      // Parsear items JSON
      let parsedItems = [{ description: '', quantity: 1, unitPrice: 0 }];
      if (invoice.items) {
        try {
          const itemsData = typeof invoice.items === 'string' 
            ? JSON.parse(invoice.items) 
            : invoice.items;
          if (Array.isArray(itemsData) && itemsData.length > 0) {
            parsedItems = itemsData;
          }
        } catch (e) {
          console.error('Error parsing items:', e);
        }
      }

      reset({
        clientId: invoice.clientId,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail || '',
        clientAddress: invoice.clientAddress || '',
        date: localDate,
        dueDate: dueDateLocal,
        status: invoice.status as 'draft' | 'sent' | 'paid' | 'cancelled',
        items: parsedItems,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        notes: invoice.notes || '',
      });
    }
  }, [invoice, reset]);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      // Convertir date a ISO timestamp
      const dateObj = new Date(data.date);
      const isoDate = dateObj.toISOString();

      let isoDueDate = undefined;
      if (data.dueDate) {
        const dueDateObj = new Date(data.dueDate);
        isoDueDate = dueDateObj.toISOString();
      }

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: invoiceId,
          ...data,
          date: isoDate,
          dueDate: isoDueDate,
          items: JSON.stringify(data.items),
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          date: isoDate,
          dueDate: isoDueDate,
          items: JSON.stringify(data.items),
        });
      }
    } catch (error) {
      console.error('Error al guardar factura:', error);
    }
  };

  if (!isOpen) return null;

  const clients = clientsData?.clients || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Factura' : 'Nueva Factura'}
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
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información del Cliente</h3>
            
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('clientName')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del cliente"
                />
                {errors.clientName && (
                  <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...register('clientEmail')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="cliente@email.com"
                />
                {errors.clientEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.clientEmail.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                {...register('clientAddress')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Calle, número, ciudad..."
              />
            </div>
          </div>

          {/* Fechas y Estado */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Fechas y Estado</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento
                </label>
                <input
                  {...register('dueDate')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Borrador</option>
                  <option value="sent">Enviada</option>
                  <option value="paid">Pagada</option>
                  <option value="cancelled">Anulada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Items <span className="text-red-500">*</span>
              </h3>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar Item
              </button>
            </div>

            {errors.items && typeof errors.items === 'object' && 'message' in errors.items && (
              <p className="text-red-500 text-sm">{errors.items.message as string}</p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <input
                        {...register(`items.${index}.description`)}
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Servicio o producto"
                      />
                      {errors.items?.[index]?.description && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.items[index]?.description?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cantidad
                      </label>
                      <input
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        type="number"
                        min="1"
                        step="1"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1"
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Precio Unitario (€)
                      </label>
                      <input
                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                      {errors.items?.[index]?.unitPrice && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.items[index]?.unitPrice?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">€{watch('subtotal').toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">IVA (21%):</span>
              <span className="font-medium">€{watch('taxAmount').toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-3">
              <span>Total:</span>
              <span>€{watch('total').toFixed(2)}</span>
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
              placeholder="Notas adicionales sobre la factura"
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
                ? 'Actualizar Factura'
                : 'Crear Factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
