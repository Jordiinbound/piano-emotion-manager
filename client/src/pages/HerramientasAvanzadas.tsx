/**
 * Herramientas Avanzadas Page - Rediseño Completo
 * Piano Emotion Manager
 * 
 * Hub central de módulos avanzados y premium
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
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type PlanTier = 'free' | 'pro' | 'premium';

interface Module {
  key: string;
  icon: any;
  label: string;
  description: string;
  color: string;
  tier: PlanTier;
  route?: string;
  implemented: boolean;
}

const ADVANCED_MODULES: Module[] = [
  // FREE - Disponibles para todos
  { 
    key: 'shop', 
    icon: ShoppingCart, 
    label: 'Tienda', 
    description: 'Gestiona tu catálogo y ventas online',
    color: '#84CC16', 
    tier: 'free', 
    route: '/store',
    implemented: true
  },
  { 
    key: 'calendar_adv', 
    icon: Calendar, 
    label: 'Calendario+', 
    description: 'Agenda avanzada con recordatorios',
    color: '#A855F7', 
    tier: 'free', 
    route: '/agenda',
    implemented: true
  },
  { 
    key: 'dashboard_editor', 
    icon: LayoutGrid, 
    label: 'Dashboard+', 
    description: 'Panel personalizable con widgets',
    color: '#EC4899', 
    tier: 'free', 
    route: '/',
    implemented: true
  },
  { 
    key: 'modules', 
    icon: CreditCard, 
    label: 'Gestionar Plan', 
    description: 'Administra tu suscripción y pagos',
    color: '#8B5CF6', 
    tier: 'free',
    route: '/admin/licenses',
    implemented: true
  },
  
  // PRO - Requieren suscripción Pro
  { 
    key: 'team', 
    icon: Users, 
    label: 'Equipos', 
    description: 'Gestión de miembros y permisos',
    color: '#10B981', 
    tier: 'pro',
    route: '/organization/settings',
    implemented: true
  },
  { 
    key: 'crm', 
    icon: Heart, 
    label: 'CRM', 
    description: 'Gestión avanzada de relaciones',
    color: '#EF4444', 
    tier: 'pro',
    route: '/clientes',
    implemented: true
  },
  { 
    key: 'reports', 
    icon: PieChart, 
    label: 'Reportes', 
    description: 'Análisis y estadísticas detalladas',
    color: '#06B6D4', 
    tier: 'pro', 
    route: '/reportes',
    implemented: true
  },
  { 
    key: 'client_portal', 
    icon: Globe, 
    label: 'Portal Clientes', 
    description: 'Acceso web para tus clientes',
    color: '#0891B2', 
    tier: 'pro',
    route: '/client-portal/login',
    implemented: true
  },
  { 
    key: 'distributor', 
    icon: Building, 
    label: 'Distribuidores', 
    description: 'Gestión de proveedores y partners',
    color: '#BE185D', 
    tier: 'pro',
    route: '/admin/partners',
    implemented: true
  },
  { 
    key: 'marketing', 
    icon: Megaphone, 
    label: 'Marketing', 
    description: 'Campañas y email marketing',
    color: '#E91E63', 
    tier: 'pro',
    route: '/configuracion/email',
    implemented: true
  },
  { 
    key: 'payments', 
    icon: Wallet, 
    label: 'Pasarelas Pago', 
    description: 'Configuración de métodos de pago',
    color: '#635BFF', 
    tier: 'pro',
    route: '/facturacion',
    implemented: true
  },
  
  // PREMIUM - Solo para Premium
  { 
    key: 'accounting', 
    icon: Calculator, 
    label: 'Contabilidad', 
    description: 'Integración contable y fiscal',
    color: '#F97316', 
    tier: 'premium',
    route: '/contabilidad',
    implemented: true
  },
  { 
    key: 'workflows', 
    icon: GitBranch, 
    label: 'Workflows', 
    description: 'Automatizaciones personalizadas',
    color: '#6366F1', 
    tier: 'premium',
    route: '/workflows',
    implemented: true
  },
];

export default function HerramientasAvanzadas() {
  const [, setLocation] = useLocation();

  // Por ahora, todos los módulos están disponibles (tier free)
  const userTier = 'premium' as PlanTier;

  const canAccess = (moduleTier: PlanTier): boolean => {
    if (userTier === 'premium') return true;
    if (userTier === 'pro') return moduleTier === 'pro' || moduleTier === 'free';
    return moduleTier === 'free';
  };

  const handleAction = (module: Module) => {
    if (!canAccess(module.tier)) {
      alert(`Esta funcionalidad requiere plan ${module.tier.toUpperCase()}`);
      return;
    }
    
    if (!module.implemented) {
      alert('Módulo en desarrollo - Próximamente disponible');
      return;
    }
    
    if (module.route) {
      setLocation(module.route);
    }
  };

  const getTierBadge = (tier: PlanTier): { label: string; color: string } | null => {
    if (tier === 'pro' && !canAccess('pro')) 
      return { label: 'PRO', color: 'bg-amber-500' };
    if (tier === 'premium' && !canAccess('premium')) 
      return { label: 'PREMIUM', color: 'bg-purple-600' };
    return null;
  };

  const freeModules = ADVANCED_MODULES.filter(m => m.tier === 'free');
  const proModules = ADVANCED_MODULES.filter(m => m.tier === 'pro');
  const premiumModules = ADVANCED_MODULES.filter(m => m.tier === 'premium');

  return (
    <div className="space-y-8">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Herramientas Avanzadas</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Potencia tu negocio con módulos premium y funcionalidades avanzadas
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              14 Módulos Disponibles
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Plan: {userTier.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Módulos FREE */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-1 bg-green-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-foreground">Módulos Gratuitos</h2>
          <Badge variant="outline" className="ml-2">
            {freeModules.length} módulos
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {freeModules.map((module) => {
            const Icon = module.icon;
            const hasAccess = canAccess(module.tier);
            const badge = getTierBadge(module.tier);
            
            return (
              <Card
                key={module.key}
                onClick={() => handleAction(module)}
                className="group relative p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary"
              >
                {badge && (
                  <Badge className={`absolute top-3 right-3 ${badge.color} text-white`}>
                    {badge.label}
                  </Badge>
                )}
                {!module.implemented && (
                  <Badge className="absolute top-3 right-3 bg-gray-400 text-white">
                    PRÓXIMAMENTE
                  </Badge>
                )}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: hasAccess ? `${module.color}15` : '#9CA3AF15',
                  }}
                >
                  <Icon
                    className="w-7 h-7"
                    style={{ color: hasAccess ? module.color : '#9CA3AF' }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {module.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Módulos PRO */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-foreground">Módulos Profesionales</h2>
          <Badge variant="outline" className="ml-2">
            {proModules.length} módulos
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {proModules.map((module) => {
            const Icon = module.icon;
            const hasAccess = canAccess(module.tier);
            const badge = getTierBadge(module.tier);
            
            return (
              <Card
                key={module.key}
                onClick={() => handleAction(module)}
                className="group relative p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary"
              >
                {badge && (
                  <Badge className={`absolute top-3 right-3 ${badge.color} text-white`}>
                    {badge.label}
                  </Badge>
                )}
                {!module.implemented && (
                  <Badge className="absolute top-3 right-3 bg-gray-400 text-white">
                    PRÓXIMAMENTE
                  </Badge>
                )}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: hasAccess ? `${module.color}15` : '#9CA3AF15',
                  }}
                >
                  <Icon
                    className="w-7 h-7"
                    style={{ color: hasAccess ? module.color : '#9CA3AF' }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {module.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Módulos PREMIUM */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-1 bg-purple-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-foreground">Módulos Premium</h2>
          <Badge variant="outline" className="ml-2">
            {premiumModules.length} módulos
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {premiumModules.map((module) => {
            const Icon = module.icon;
            const hasAccess = canAccess(module.tier);
            const badge = getTierBadge(module.tier);
            
            return (
              <Card
                key={module.key}
                onClick={() => handleAction(module)}
                className="group relative p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary"
              >
                {badge && (
                  <Badge className={`absolute top-3 right-3 ${badge.color} text-white`}>
                    {badge.label}
                  </Badge>
                )}
                {!module.implemented && (
                  <Badge className="absolute top-3 right-3 bg-gray-400 text-white">
                    PRÓXIMAMENTE
                  </Badge>
                )}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: hasAccess ? `${module.color}15` : '#9CA3AF15',
                  }}
                >
                  <Icon
                    className="w-7 h-7"
                    style={{ color: hasAccess ? module.color : '#9CA3AF' }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {module.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
