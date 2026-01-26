/**
 * Pianos Page - Professional Minimalist Design
 * Piano Emotion Manager
 * 
 * Diseño profesional y minimalista siguiendo el patrón del drawer original
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { PianoCard } from '@/components/PianoCard';
import { Plus } from 'lucide-react';

type FilterType = 'all' | 'vertical' | 'grand';

export default function Pianos() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Obtener estadísticas
  const { data: stats, isLoading: statsLoading } = trpc.pianos.getStats.useQuery();

  // Obtener lista de pianos con filtros
  const { data: pianosData, isLoading: pianosLoading } = trpc.pianos.getPianos.useQuery({
    page,
    pageSize,
    search: search || undefined,
    category: filter !== 'all' ? filter : undefined,
  });

  const pianos = pianosData?.pianos || [];
  const totalPianos = pianosData?.total || 0;
  const totalPages = Math.ceil(totalPianos / pageSize);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'vertical', label: 'Verticales' },
    { key: 'grand', label: 'De Cola' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Estadísticas minimalistas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          {/* Verticales */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-[#003a8c]">{stats?.vertical || 0}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Verticales</p>
              </>
            )}
          </div>

          {/* De Cola */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-[#003a8c]">{stats?.grand || 0}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">De Cola</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset a primera página al buscar
          }}
          placeholder="Buscar por marca, modelo, número de serie..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003a8c] focus:border-transparent"
        />
      </div>

      {/* Filtros horizontales minimalistas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(1); // Reset a primera página al filtrar
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
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

      {/* Lista de pianos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {pianosLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : pianos.length === 0 ? (
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
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {search || filter !== 'all' ? 'No se encontraron pianos' : 'No hay pianos registrados'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || filter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer piano'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {pianos.map((piano) => (
                <PianoCard
                  key={piano.id}
                  piano={piano}
                  onClick={() => {
                    // TODO: Navegar a detalle del piano
                    console.log('Piano clicked:', piano.id);
                  }}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-700">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB (Floating Action Button) */}
      <button
        onClick={() => {
          // TODO: Abrir modal de crear piano
          console.log('Add piano clicked');
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#e07a5f] text-white rounded-full shadow-lg hover:bg-[#d16a4f] transition-colors flex items-center justify-center"
        aria-label="Agregar piano"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
