/**
 * InventoryCard Component - Professional Minimalist Design
 * Piano Emotion Manager
 * 
 * Diseño profesional y minimalista para mostrar información de items de inventario
 */

import { AlertTriangle } from 'lucide-react';

interface InventoryCardProps {
  item: {
    id: number;
    name: string;
    category: string;
    quantity: string | number;
    unit: string;
    minStock: string | number;
    costPerUnit?: string | number;
    supplier?: string;
  };
  onClick?: () => void;
}

// Mapeo de categorías a español
const categoryMap: Record<string, string> = {
  strings: 'Cuerdas',
  hammers: 'Martillos',
  dampers: 'Apagadores',
  keys: 'Teclas',
  action_parts: 'Partes de Acción',
  pedals: 'Pedales',
  tuning_pins: 'Clavijas',
  felts: 'Fieltros',
  tools: 'Herramientas',
  chemicals: 'Químicos',
  other: 'Otros',
};

export function InventoryCard({ item, onClick }: InventoryCardProps) {
  // Convertir quantity y minStock a números
  const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
  const minStock = typeof item.minStock === 'string' ? parseFloat(item.minStock) : item.minStock;
  const costPerUnit = item.costPerUnit 
    ? (typeof item.costPerUnit === 'string' ? parseFloat(item.costPerUnit) : item.costPerUnit)
    : null;

  // Determinar si el stock es bajo
  const isLowStock = quantity <= minStock;
  const isOutOfStock = quantity === 0;

  // Determinar color del stock
  const stockColor = isOutOfStock 
    ? '#dc2626' // rojo
    : isLowStock 
    ? '#ea580c' // naranja
    : '#16a34a'; // verde

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header: Nombre y alerta de stock bajo */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-bold text-gray-900 flex-1">{item.name}</h3>
        {isLowStock && (
          <div className="ml-2">
            <AlertTriangle className="w-5 h-5" style={{ color: stockColor }} />
          </div>
        )}
      </div>

      {/* Categoría */}
      <p className="text-sm text-gray-600 mb-3">
        {categoryMap[item.category] || item.category}
      </p>

      {/* Stock info */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">Stock:</span>
        <span className="text-sm font-bold" style={{ color: stockColor }}>
          {quantity} {item.unit}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">Mínimo:</span>
        <span className="text-sm text-gray-600">
          {minStock} {item.unit}
        </span>
      </div>

      {/* Footer: Precio y proveedor */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {costPerUnit !== null ? (
          <span className="text-sm font-semibold text-gray-900">
            €{costPerUnit.toFixed(2)}/{item.unit}
          </span>
        ) : (
          <span className="text-sm text-gray-400">Sin precio</span>
        )}
        {item.supplier && (
          <span className="text-xs text-gray-400 truncate max-w-[120px]">
            {item.supplier}
          </span>
        )}
      </div>
    </div>
  );
}
