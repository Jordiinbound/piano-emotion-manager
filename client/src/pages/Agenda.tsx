/**
 * Agenda Page - Professional Minimalist Design
 * Piano Emotion Manager
 * 
 * Diseño profesional y minimalista siguiendo el patrón del drawer original
 */

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Plus } from 'lucide-react';
import AppointmentFormModal from '@/components/AppointmentFormModal';

type FilterType = 'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export default function Agenda() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Obtener estadísticas
  const { data: stats, isLoading: statsLoading } = trpc.appointments.getStats.useQuery();

  // Obtener próximas citas
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = trpc.appointments.getUpcomingAppointments.useQuery();

  const appointments = upcomingAppointments || [];

  // Filtrar citas por estado
  const filteredAppointments = useMemo(() => {
    if (filter === 'all') return appointments;
    return appointments.filter((apt: any) => apt.status === filter);
  }, [appointments, filter]);

  // Agrupar citas por fecha
  const groupedAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const groups: { date: string; label: string; appointments: any[] }[] = [];

    filteredAppointments.forEach((apt: any) => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      
      let group = groups.find((g) => g.date === aptDate);
      if (!group) {
        let label: string;
        if (aptDate === today) {
          label = 'Hoy';
        } else if (aptDate === tomorrow) {
          label = 'Mañana';
        } else {
          const date = new Date(aptDate);
          label = date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          });
        }
        group = { date: aptDate, label, appointments: [] };
        groups.push(group);
      }
      group.appointments.push(apt);
    });

    return groups;
  }, [filteredAppointments]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'scheduled', label: 'Programadas' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Estadísticas minimalistas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-[#003a8c]">{stats?.total || 0}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Total</p>
              </>
            )}
          </div>

          {/* Programadas */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-[#003a8c]">{stats?.scheduled || 0}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Programadas</p>
              </>
            )}
          </div>

          {/* Confirmadas */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-green-600">{stats?.confirmed || 0}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Confirmadas</p>
              </>
            )}
          </div>

          {/* Completadas */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-green-600">{stats?.completed || 0}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Completadas</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filtros horizontales minimalistas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${
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

      {/* Lista de citas agrupadas por fecha */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {appointmentsLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="animate-pulse bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : groupedAppointments.length === 0 ? (
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filter !== 'all' ? 'No hay citas con este estado' : 'No hay citas programadas'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter !== 'all'
                ? 'Intenta ajustar los filtros'
                : 'Comienza agregando tu primera cita'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedAppointments.map((group) => (
              <div key={group.date}>
                {/* Header de fecha */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 capitalize">{group.label}</h2>
                  <span className="text-sm text-gray-500">
                    {group.appointments.length} {group.appointments.length === 1 ? 'cita' : 'citas'}
                  </span>
                </div>

                {/* Lista de citas del día */}
                <div className="space-y-3">
                  {group.appointments.map((apt: any) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      onClick={() => {
                        // TODO: Navegar a detalle de la cita
                        console.log('Appointment clicked:', apt.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB (Floating Action Button) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#e07a5f] text-white rounded-full shadow-lg hover:bg-[#d16a4f] transition-colors flex items-center justify-center"
        aria-label="Agregar cita"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal de formulario */}
      <AppointmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
