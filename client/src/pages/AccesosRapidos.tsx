/**
 * Accesos Rápidos Page
 * Piano Emotion Manager
 * 
 * Grid de accesos rápidos a las funciones principales
 */

import { useLocation } from 'wouter';
import {
  Users,
  Music,
  Wrench,
  Package,
  BarChart3,
  FileText,
  DollarSign,
  Calendar,
  Settings,
  Store,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function AccesosRapidos() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const QUICK_ACTIONS = [
    { key: 'clients', icon: Users, label: t('quickAccess.clients'), color: '#3B82F6', route: '/clientes' },
    { key: 'pianos', icon: Music, label: t('quickAccess.pianos'), color: '#8B5CF6', route: '/pianos' },
    { key: 'services', icon: Wrench, label: t('quickAccess.services'), color: '#10B981', route: '/servicios' },
    { key: 'inventory', icon: Package, label: t('quickAccess.inventory'), color: '#F59E0B', route: '/inventario' },
    { key: 'stats', icon: BarChart3, label: t('quickAccess.reports'), color: '#10B981', route: '/reportes' },
    { key: 'invoices', icon: FileText, label: t('quickAccess.invoices'), color: '#3B82F6', route: '/facturacion' },
    { key: 'dashboard', icon: DollarSign, label: t('quickAccess.dashboard'), color: '#2D5A27', route: '/' },
    { key: 'agenda', icon: Calendar, label: t('quickAccess.calendar'), color: '#A855F7', route: '/agenda' },
    { key: 'store', icon: Store, label: t('quickAccess.store'), color: '#84CC16', route: '/store' },
    { key: 'settings', icon: Settings, label: t('quickAccess.settings'), color: '#64748B', route: '/configuracion' },
  ];

  const handleAction = (route: string) => {
    setLocation(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('quickAccess.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('quickAccess.description')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid de acciones rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                onClick={() => handleAction(action.route)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 flex flex-col items-center gap-3 group"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <Icon className="w-8 h-8" style={{ color: action.color }} />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
