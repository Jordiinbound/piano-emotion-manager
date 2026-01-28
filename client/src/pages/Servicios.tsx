import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { ServiceCard } from "@/components/ServiceCard";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2 } from "lucide-react";
import ServiceFormModal from "@/components/ServiceFormModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useTranslation } from "@/hooks/use-translation";

type FilterType = 'all' | 'tuning' | 'maintenance' | 'repair' | 'regulation';

export default function Servicios() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(null);

  const { data: stats, isLoading: statsLoading } = trpc.services.getStats.useQuery();
  const { data: services = [], isLoading: servicesLoading } = trpc.services.getServices.useQuery({
    page: 1,
    limit: 100,
    search: search || undefined,
    serviceType: filter === 'all' ? undefined : filter,
  });

  // Mutación para eliminar servicio
  const utils = trpc.useUtils();
  const deleteServiceMutation = trpc.services.deleteService.useMutation({
    onSuccess: () => {
      utils.services.getServices.invalidate();
      utils.services.getStats.invalidate();
      setDeletingServiceId(null);
    },
  });

  // Calculate stats from backend data
  const calculatedStats = useMemo(() => {
    if (!stats) return { tuning: 0, maintenance: 0, repair: 0, regulation: 0 };
    
    const tuning = stats.byType.find(t => t.serviceType === 'tuning')?.count || 0;
    const maintenance = stats.byType.filter(t => 
      t.serviceType === 'maintenance_basic' || 
      t.serviceType === 'maintenance_complete' || 
      t.serviceType === 'maintenance_premium'
    ).reduce((sum, t) => sum + (t.count || 0), 0);
    const repair = stats.byType.find(t => t.serviceType === 'repair')?.count || 0;
    const regulation = stats.byType.find(t => t.serviceType === 'regulation')?.count || 0;
    
    return { tuning, maintenance, repair, regulation };
  }, [stats]);

  // Add isPast flag to services
  const servicesWithPastFlag = useMemo(() => {
    const now = new Date();
    return services.map(s => ({
      ...s,
      isPast: new Date(s.date) < now
    }));
  }, [services]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('services.filters.all') },
    { key: 'tuning', label: t('services.filters.tuning') },
    { key: 'maintenance', label: t('services.filters.maintenance') },
    { key: 'repair', label: t('services.filters.repair') },
    { key: 'regulation', label: t('services.filters.regulation') },
  ];

  const handleServiceClick = (serviceId: number) => {
    console.log('Service clicked:', serviceId);
    // TODO: Navigate to service detail page
  };

  const handleAddService = () => {
    setIsModalOpen(true);
  };

  if (statsLoading || servicesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-900">{calculatedStats.tuning}</div>
          <div className="text-sm text-gray-600 mt-1">{t('services.stats.tuning')}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-900">{calculatedStats.maintenance}</div>
          <div className="text-sm text-gray-600 mt-1">{t('services.stats.maintenance')}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-900">{calculatedStats.repair}</div>
          <div className="text-sm text-gray-600 mt-1">{t('services.stats.repairs')}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-900">{calculatedStats.regulation}</div>
          <div className="text-sm text-gray-600 mt-1">{t('services.stats.regulations')}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder={t('services.search.placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.key
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="px-6 pb-24">
        {servicesWithPastFlag.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {search || filter !== 'all' ? t('services.empty.noResults') : t('services.empty.noServices')}
            </h3>
            <p className="text-gray-600">
              {search || filter !== 'all'
                ? t('services.empty.noResultsDesc')
                : t('services.empty.noServicesDesc')}
            </p>
          </div>
        ) : (
          servicesWithPastFlag.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              pianoInfo={undefined} // TODO: Get piano info
              clientName={undefined} // TODO: Get client name
              isPast={service.isPast}
              onEdit={() => setEditingServiceId(service.id)}
              onDelete={() => setDeletingServiceId(service.id)}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleAddService}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label={t('services.actions.add')}
      >
        <Plus size={24} />
      </button>

      {/* Modal de formulario para crear */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Modal de formulario para editar */}
      {editingServiceId && (
        <ServiceFormModal
          isOpen={true}
          onClose={() => setEditingServiceId(null)}
          serviceId={editingServiceId}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingServiceId && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setDeletingServiceId(null)}
          onConfirm={() => {
            deleteServiceMutation.mutate({ id: deletingServiceId });
          }}
          isDeleting={deleteServiceMutation.isPending}
          title={t('services.delete.title')}
          message={t('services.delete.message')}
          entityName={services.find(s => s.id === deletingServiceId)?.serviceType}
        />
      )}
    </div>
  );
}
