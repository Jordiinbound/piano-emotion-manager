/**
 * Herramientas Avanzadas Page
 * Piano Emotion Manager
 * 
 * Grid de herramientas premium y avanzadas
 */

import { useLocation } from 'wouter';
import {
  ShoppingCart,
  Calendar,
  LayoutGrid,
  CreditCard,
  Users,
  Heart,
  PieChart,
  Globe,
  Building,
  Megaphone,
  Wallet,
  Calculator,
  GitBranch,
  Brain,
} from 'lucide-react';

type PlanTier = 'free' | 'pro' | 'premium';

const ADVANCED_MODULES: Array<{
  key: string;
  icon: any;
  label: string;
  color: string;
  tier: PlanTier;
  route?: string;
}> = [
  // FREE - Disponibles para todos
  { key: 'shop', icon: ShoppingCart, label: 'Tienda', color: '#84CC16', tier: 'free', route: '/store' },
  { key: 'calendar_adv', icon: Calendar, label: 'Calendario+', color: '#A855F7', tier: 'free', route: '/agenda' },
  { key: 'dashboard_editor', icon: LayoutGrid, label: 'Dashboard+', color: '#EC4899', tier: 'free', route: '/' },
  { key: 'modules', icon: CreditCard, label: 'Gestionar Plan', color: '#8B5CF6', tier: 'free' },
  
  // PRO - Requieren suscripción Pro
  { key: 'team', icon: Users, label: 'Equipos', color: '#10B981', tier: 'pro' },
  { key: 'crm', icon: Heart, label: 'CRM', color: '#EF4444', tier: 'pro' },
  { key: 'reports', icon: PieChart, label: 'Reportes', color: '#06B6D4', tier: 'pro', route: '/reportes' },
  { key: 'client_portal', icon: Globe, label: 'Portal Clientes', color: '#0891B2', tier: 'pro' },
  { key: 'distributor', icon: Building, label: 'Distribuidor', color: '#BE185D', tier: 'pro' },
  { key: 'marketing', icon: Megaphone, label: 'Marketing', color: '#E91E63', tier: 'pro' },
  { key: 'payments', icon: Wallet, label: 'Pasarelas Pago', color: '#635BFF', tier: 'pro' },
  
  // PREMIUM - Solo para Premium
  { key: 'accounting', icon: Calculator, label: 'Contabilidad', color: '#F97316', tier: 'premium' },
  { key: 'workflows', icon: GitBranch, label: 'Workflows', color: '#6366F1', tier: 'premium' },
  { key: 'predictions', icon: Brain, label: 'IA Avanzada', color: '#8B5CF6', tier: 'premium' },
];

export default function HerramientasAvanzadas() {
  const [, setLocation] = useLocation();

  // Por ahora, todos los módulos están disponibles (tier free)
  const userTier = 'free' as PlanTier;

  const canAccess = (moduleTier: PlanTier): boolean => {
    if (userTier === 'premium') return true;
    if (userTier === 'pro') return moduleTier === 'pro' || moduleTier === 'free';
    return moduleTier === 'free';
  };

  const handleAction = (module: typeof ADVANCED_MODULES[0]) => {
    if (!canAccess(module.tier)) {
      alert(`Esta funcionalidad requiere plan ${module.tier.toUpperCase()}`);
      return;
    }
    
    if (module.route) {
      setLocation(module.route);
    } else {
      alert('Funcionalidad próximamente');
    }
  };

  const getBadge = (tier: PlanTier): string | undefined => {
    if (tier === 'pro' && !canAccess('pro')) return 'PRO';
    if (tier === 'premium' && !canAccess('premium')) return 'PREMIUM';
    return undefined;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Herramientas Avanzadas</h1>
          <p className="text-sm text-gray-600 mt-1">Funciones premium y avanzadas</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid de herramientas avanzadas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
          {ADVANCED_MODULES.map((module) => {
            const Icon = module.icon;
            const hasAccess = canAccess(module.tier);
            const badge = getBadge(module.tier);
            
            return (
              <button
                key={module.key}
                onClick={() => handleAction(module)}
                className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 flex flex-col items-center gap-3 group relative ${
                  !hasAccess ? 'opacity-60' : ''
                }`}
              >
                {badge && (
                  <div
                    className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white"
                    style={{
                      backgroundColor: module.tier === 'premium' ? '#8B5CF6' : '#F59E0B',
                    }}
                  >
                    {badge}
                  </div>
                )}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: hasAccess ? `${module.color}15` : '#9CA3AF15',
                  }}
                >
                  <Icon
                    className="w-8 h-8"
                    style={{ color: hasAccess ? module.color : '#9CA3AF' }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  {module.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
