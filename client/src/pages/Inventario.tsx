/**
 * Inventario Page - Professional Minimalist Design
 * Piano Emotion Manager
 * 
 * Diseño profesional y minimalista siguiendo el patrón del drawer original
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { InventoryCard } from '@/components/InventoryCard';
import { Plus, Search, AlertTriangle } from 'lucide-react';

type FilterType = 'all' | 'low_stock' | 'strings' | 'hammers' | 'felts' | 'tools' | 'dampers' | 'keys' | 'action_parts' | 'pedals' | 'tuning_pins' | 'chemicals' | 'other';

export default function Inventario() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Obtener estadísticas
  const { data: stats, isLoading: statsLoading } = trpc.inventory.getStats.useQuery();

  // Obtener items de inventario con filtros
  const { data: inventoryData, isLoading: inventoryLoading } = trpc.inventory.getInventory.useQuery({
    page: 1,
    pageSize: 100,
    search: search || undefined,
    category: filter !== 'all' && filter !== 'low_stock' ? filter as any : undefined,
    lowStock: filter === 'low_stock' ? true : undefined,
  });

  // Obtener items con stock bajo para el filtro
  const { data: lowStockItems } = trpc.inventory.getLowStockItems.useQuery();

  const items = inventoryData?.items || [];

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'low_stock', label: `Stock Bajo (${lowStockItems?.length || 0})` },
    { key: 'strings', label: 'Cuerdas' },
    { key: 'hammers', label: 'Martillos' },
    { key: 'felts', label: 'Fieltros' },
    { key: 'tools', label: 'Herramientas' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Estadísticas minimalistas en línea */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-3 gap-4">
          {/* Total Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Total Items
                </p>
                <p className="text-2xl font-bold text-[#003a8c]">
                  {stats?.total || 0}
                </p>
              </>
            )}
          </div>

          {/* Stock Bajo */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Stock Bajo
                </p>
                <p className="text-2xl font-bold text-[#ea580c]">
                  {stats?.lowStock || 0}
                </p>
              </>
            )}
          </div>

          {/* Categorías */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Categorías
                </p>
                <p className="text-2xl font-bold text-[#4A7C59]">
                  {stats?.categories || 0}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de stock bajo */}
      {lowStockItems && lowStockItems.length > 0 && filter !== 'low_stock' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900">
                {lowStockItems.length} {lowStockItems.length === 1 ? 'artículo necesita' : 'artículos necesitan'} reposición
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Algunos items están por debajo del stock mínimo
              </p>
            </div>
            <button
              onClick={() => setFilter('low_stock')}
              className="px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
            >
              Ver
            </button>
          </div>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, descripción o proveedor..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003a8c] focus:border-transparent"
          />
        </div>
      </div>

      {/* Filtros por categoría */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors whitespace-nowrap ${
                filter === f.key
                  ? 'bg-[#003a8c] text-white border-[#003a8c]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {inventoryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="h-5 bg-gray-200 rounded w-5"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {search || filter !== 'all'
                ? 'No hay resultados'
                : 'No hay items en inventario'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || filter !== 'all'
                ? 'Intenta ajustar los filtros'
                : 'Comienza agregando tu primer item'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item: any) => (
              <InventoryCard
                key={item.id}
                item={item}
                onClick={() => {
                  // TODO: Navegar a detalle del item
                  console.log('Item clicked:', item.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB (Floating Action Button) */}
      <button
        onClick={() => {
          // TODO: Abrir modal de crear item
          console.log('Add item clicked');
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#e07a5f] text-white rounded-full shadow-lg hover:bg-[#d16a4f] transition-colors flex items-center justify-center"
        aria-label="Agregar item"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
