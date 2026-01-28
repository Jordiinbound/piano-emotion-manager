/**
 * Configuración Page
 * Piano Emotion Manager
 * 
 * Grid de secciones de configuración del sistema
 */

import { useLocation } from 'wouter';
import {
  Brain,
  Calendar,
  Package,
  Bell,
  FileText,
  CreditCard,
  LayoutGrid,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function Configuracion() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const SETTINGS_SECTIONS = [
    { key: 'profile', icon: Brain, label: t('settings.userProfile'), color: '#10B981', href: '/configuracion/perfil' },
    { key: 'ai', icon: Brain, label: t('settings.aiConfiguration'), color: '#8B5CF6', href: null },
    { key: 'calendar', icon: Calendar, label: t('settings.calendar'), color: '#A855F7', href: null },
    { key: 'inventory', icon: Package, label: t('settings.inventory'), color: '#F59E0B', href: null },
    { key: 'email', icon: Bell, label: t('settings.emailConfiguration'), color: '#F97316', href: '/configuracion/email' },
    { key: 'invoice', icon: FileText, label: t('settings.invoicing'), color: '#3B82F6', href: null },
    { key: 'payment', icon: CreditCard, label: t('settings.payments'), color: '#635BFF', href: null },
    { key: 'modules', icon: LayoutGrid, label: t('settings.modulesAndPlan'), color: '#8B5CF6', href: null },
  ];

  const handleAction = (section: typeof SETTINGS_SECTIONS[0]) => {
    if (section.href) {
      setLocation(section.href);
    } else {
      alert(t('common.comingSoon'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('settings.description')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid de secciones de configuración */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.key}
                onClick={() => handleAction(section)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 flex flex-col items-center gap-3 group"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${section.color}15` }}
                >
                  <Icon className="w-8 h-8" style={{ color: section.color }} />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
