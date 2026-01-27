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

const SETTINGS_SECTIONS = [
  { key: 'ai', icon: Brain, label: 'Configuración IA', color: '#8B5CF6', href: null },
  { key: 'calendar', icon: Calendar, label: 'Calendario', color: '#A855F7', href: null },
  { key: 'inventory', icon: Package, label: 'Inventario', color: '#F59E0B', href: null },
  { key: 'email', icon: Bell, label: 'Configuración Email', color: '#F97316', href: '/configuracion/email' },
  { key: 'invoice', icon: FileText, label: 'Facturación', color: '#3B82F6', href: null },
  { key: 'payment', icon: CreditCard, label: 'Pagos', color: '#635BFF', href: null },
  { key: 'modules', icon: LayoutGrid, label: 'Módulos y Plan', color: '#8B5CF6', href: null },
];

export default function Configuracion() {
  const [, setLocation] = useLocation();

  const handleAction = (section: typeof SETTINGS_SECTIONS[0]) => {
    if (section.href) {
      setLocation(section.href);
    } else {
      alert('Funcionalidad próximamente');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-600 mt-1">Ajustes del sistema</p>
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
