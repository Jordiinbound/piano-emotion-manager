import { useState, useMemo } from 'react';
import { Search, Upload, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { ClientCard } from '../components/ClientCard';
import ClientFormModal from '../components/ClientFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useTranslation } from '../hooks/use-translation';
import { usePrefetchOnHover } from '../hooks/usePrefetch';

// Paleta profesional minimalista
const COLORS = {
  primary: '#003a8c',
  background: '#ffffff',
  surface: '#f8f9fa',
  border: '#e5e7eb',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  accent: '#e07a5f',
};

const ITEMS_PER_PAGE = 50;

export default function ClientesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRouteGroup, setSelectedRouteGroup] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null);

  // Obtener estadísticas
  const { data: stats, isLoading: statsLoading } = trpc.clients.getStats.useQuery();

  // Obtener clientes con filtros
  const { data: clientsData, isLoading: clientsLoading } = trpc.clients.getClients.useQuery({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    search: search || undefined,
    region: selectedRegion || undefined,
    city: selectedCity || undefined,
    routeGroup: selectedRouteGroup || undefined,
  });

  // Obtener opciones de filtros
  const { data: filterOptions } = trpc.clients.getFilterOptions.useQuery();

    // Prefetch on-hover
  const { prefetchClient } = usePrefetchOnHover();
  
  // Mutar para eliminar cliente
  const utils = trpc.useUtils();
  const deleteClientMutation = trpc.clients.deleteClient.useMutation({
    onSuccess: () => {
      utils.clients.getClients.invalidate();
      utils.clients.getStats.invalidate();
      setDeletingClientId(null);
    },
  });

  // Resetear a la primera página cuando cambian los filtros
  useMemo(() => {
    setCurrentPage(1);
  }, [search, selectedRegion, selectedCity, selectedRouteGroup]);

  const handleClientPress = (clientId: number) => {
    // TODO: Navegar a la página de detalle del cliente
    console.log('Cliente seleccionado:', clientId);
  };

  const handleAddClient = () => {
    setIsModalOpen(true);
  };

  const handleImport = () => {
    // TODO: Implementar importación de clientes
    console.log('Importar clientes');
  };

  const exportMutation = trpc.export.exportClients.useMutation();

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        format: 'excel',
        filters: {
          search: search || undefined,
        },
      });

      // Crear blob y descargar archivo
      const blob = new Blob(
        [Uint8Array.from(atob(result.base64), c => c.charCodeAt(0))],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar clientes:', error);
      alert('Error al exportar clientes. Por favor, inténtelo de nuevo.');
    }
  };

  const totalPages = clientsData?.totalPages || 1;

  return (
    <div className="min-h-screen bg-white">
      {/* Header con botones */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('clients.title')}</h1>
            <p className="text-blue-100 text-sm mt-1">
              {stats?.total || 0} {(stats?.total || 0) === 1 ? t('clients.client') : t('clients.clients_plural')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-semibold">{t('clients.actions.import')}</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-semibold">{t('clients.actions.export')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Estadísticas minimalistas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-900">{stats?.total || 0}</div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mt-1">
              {t('clients.stats.total')}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-900">{stats?.active || 0}</div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mt-1">
              {t('clients.stats.active')}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-900">{stats?.vip || 0}</div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mt-1">
              {t('clients.stats.vip')}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-900">{stats?.withPianos || 0}</div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mt-1">
              {t('clients.stats.withPianos')}
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('clients.search.placeholder')}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {t('clients.filters.region')}
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('clients.filters.all')}</option>
              {filterOptions?.regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {t('clients.filters.city')}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('clients.filters.all')}</option>
              {filterOptions?.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {t('clients.filters.routeGroup')}
            </label>
            <select
              value={selectedRouteGroup}
              onChange={(e) => setSelectedRouteGroup(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('clients.filters.allMale')}</option>
              {filterOptions?.routeGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de clientes */}
        {clientsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">{t('clients.loading')}</div>
          </div>
        ) : clientsData && clientsData.clients.length > 0 ? (
          <>
            <div className="space-y-3 mb-6">
              {clientsData.clients.map((client) => (
                <div
                  key={client.id}
                  onMouseEnter={() => prefetchClient(client.id)}
                >
                  <ClientCard
                    client={client}
                    pianoCount={0} // TODO: Obtener el conteo real de pianos por cliente
                    onEdit={() => setEditingClientId(client.id)}
                    onDelete={() => setDeletingClientId(client.id)}
                  />
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-blue-900 text-blue-900 hover:bg-blue-50'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-semibold">{t('clients.pagination.previous')}</span>
                </button>

                <span className="text-sm font-semibold text-gray-900">
                  {t('clients.pagination.page')} {currentPage} {t('clients.pagination.of')} {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-blue-900 text-blue-900 hover:bg-blue-50'
                  }`}
                >
                  <span className="text-sm font-semibold">{t('clients.pagination.next')}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {search
                ? t('clients.noResults')
                : t('clients.noClients')}
            </div>
            {!search && (
              <button
                onClick={handleAddClient}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">{t('clients.actions.addFirst')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* FAB (Floating Action Button) */}
      <button
        onClick={handleAddClient}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        style={{ backgroundColor: COLORS.accent }}
        aria-label={t('clients.actions.add')}
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Modal de formulario para crear */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Modal de formulario para editar */}
      {editingClientId && (
        <ClientFormModal
          isOpen={true}
          onClose={() => setEditingClientId(null)}
          clientId={editingClientId}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingClientId && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setDeletingClientId(null)}
          onConfirm={() => {
            deleteClientMutation.mutate({ id: deletingClientId });
          }}
          isDeleting={deleteClientMutation.isPending}
          title={t('clients.delete.title')}
          message={t('clients.delete.message')}
          entityName={clientsData?.clients.find(c => c.id === deletingClientId)?.name}
        />
      )}
    </div>
  );
}
