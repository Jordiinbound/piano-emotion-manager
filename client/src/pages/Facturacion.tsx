/**
 * Facturación Page - Professional Minimalist Design
 * Piano Emotion Manager
 * 
 * Diseño profesional y minimalista siguiendo el patrón del drawer original
 */

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { InvoiceCard } from '@/components/InvoiceCard';
import { Plus, Search } from 'lucide-react';

type FilterType = 'all' | 'draft' | 'sent' | 'paid' | 'cancelled';
type PeriodType = 'all' | 'thisMonth' | 'lastMonth' | 'thisYear';

export default function Facturacion() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [period, setPeriod] = useState<PeriodType>('all');

  // Obtener estadísticas
  const { data: stats, isLoading: statsLoading } = trpc.invoices.getStats.useQuery();

  // Obtener facturas con filtros
  const { data: invoicesData, isLoading: invoicesLoading } = trpc.invoices.getInvoices.useQuery({
    page: 1,
    pageSize: 100,
    search: search || undefined,
    status: filter !== 'all' ? filter : undefined,
    period,
  });

  const invoices = invoicesData?.invoices || [];

  const statusFilters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'draft', label: 'Borrador' },
    { key: 'sent', label: 'Enviada' },
    { key: 'paid', label: 'Pagada' },
    { key: 'cancelled', label: 'Anulada' },
  ];

  const periodFilters: { key: PeriodType; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'thisMonth', label: 'Este mes' },
    { key: 'lastMonth', label: 'Mes anterior' },
    { key: 'thisYear', label: 'Este año' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Estadísticas minimalistas en línea */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Total
                </p>
                <p className="text-2xl font-bold text-[#003a8c]">
                  €{stats?.total.toFixed(2) || '0.00'}
                </p>
              </>
            )}
          </div>

          {/* Pendiente */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Pendiente
                </p>
                <p className="text-2xl font-bold text-[#e07a5f]">
                  €{stats?.pending.toFixed(2) || '0.00'}
                </p>
              </>
            )}
          </div>

          {/* Cobrado */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Cobrado
                </p>
                <p className="text-2xl font-bold text-[#4A7C59]">
                  €{stats?.paid.toFixed(2) || '0.00'}
                </p>
              </>
            )}
          </div>

          {/* Borradores */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Borradores
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats?.draft || 0}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar factura..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003a8c] focus:border-transparent"
          />
        </div>
      </div>

      {/* Filtros por estado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex gap-2 overflow-x-auto">
          {statusFilters.map((f) => (
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

      {/* Filtros por período */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex gap-2 overflow-x-auto">
          {periodFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setPeriod(f.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors whitespace-nowrap ${
                period === f.key
                  ? 'bg-[#003a8c] text-white border-[#003a8c]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de facturas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {invoicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : invoices.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {search || filter !== 'all' || period !== 'all'
                ? 'No hay resultados'
                : 'No hay facturas'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || filter !== 'all' || period !== 'all'
                ? 'Intenta ajustar los filtros'
                : 'Comienza creando tu primera factura'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map((invoice: any) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onClick={() => {
                  // TODO: Navegar a detalle de la factura
                  console.log('Invoice clicked:', invoice.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB (Floating Action Button) */}
      <button
        onClick={() => {
          // TODO: Abrir modal de crear factura
          console.log('Add invoice clicked');
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#e07a5f] text-white rounded-full shadow-lg hover:bg-[#d16a4f] transition-colors flex items-center justify-center"
        aria-label="Agregar factura"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
