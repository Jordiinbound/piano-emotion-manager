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
import { useTranslation } from '@/hooks/use-translation';

type PlanTier = 'free' | 'pro' | 'premium';

interface Module {
  key: string;
  icon: any;
  labelKey: string;
  descriptionKey: string;
  color: string;
  tier: PlanTier;
  route?: string;
  implemented: boolean;
}

export default function HerramientasAvanzadas() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const ADVANCED_MODULES: Module[] = [
    // FREE - Disponibles para todos
    { 
      key: 'shop', 
      icon: ShoppingCart, 
      labelKey: 'advancedTools.modulesList.shop.label',
      descriptionKey: 'advancedTools.modulesList.shop.description',
      color: '#84CC16', 
      tier: 'free', 
      route: '/store',
      implemented: true
    },
    { 
      key: 'calendar_adv', 
      icon: Calendar, 
      labelKey: 'advancedTools.modulesList.calendarAdv.label',
      descriptionKey: 'advancedTools.modulesList.calendarAdv.description',
      color: '#A855F7', 
      tier: 'free', 
      route: '/agenda',
      implemented: true
    },
    { 
      key: 'dashboard_editor', 
      icon: LayoutGrid, 
      labelKey: 'advancedTools.modulesList.dashboardEditor.label',
      descriptionKey: 'advancedTools.modulesList.dashboardEditor.description',
      color: '#EC4899', 
      tier: 'free', 
      route: '/',
      implemented: true
    },
    { 
      key: 'modules', 
      icon: CreditCard, 
      labelKey: 'advancedTools.modulesList.managePlan.label',
      descriptionKey: 'advancedTools.modulesList.managePlan.description',
      color: '#8B5CF6', 
      tier: 'free',
      route: '/admin/licenses',
      implemented: true
    },
    
    // PRO - Requieren suscripción Pro
    { 
      key: 'team', 
      icon: Users, 
      labelKey: 'advancedTools.modulesList.teams.label',
      descriptionKey: 'advancedTools.modulesList.teams.description',
      color: '#10B981', 
      tier: 'pro',
      route: '/organization/settings',
      implemented: true
    },
    { 
      key: 'crm', 
      icon: Heart, 
      labelKey: 'advancedTools.modulesList.crm.label',
      descriptionKey: 'advancedTools.modulesList.crm.description',
      color: '#EF4444', 
      tier: 'pro',
      route: '/clientes',
      implemented: true
    },
    { 
      key: 'reports', 
      icon: PieChart, 
      labelKey: 'advancedTools.modulesList.reports.label',
      descriptionKey: 'advancedTools.modulesList.reports.description',
      color: '#06B6D4', 
      tier: 'pro', 
      route: '/reportes',
      implemented: true
    },
    { 
      key: 'client_portal', 
      icon: Globe, 
      labelKey: 'advancedTools.modulesList.clientPortal.label',
      descriptionKey: 'advancedTools.modulesList.clientPortal.description',
      color: '#0891B2', 
      tier: 'pro',
      route: '/client-portal/login',
      implemented: true
    },
    { 
      key: 'distributor', 
      icon: Building, 
      labelKey: 'advancedTools.modulesList.distributors.label',
      descriptionKey: 'advancedTools.modulesList.distributors.description',
      color: '#BE185D', 
      tier: 'pro',
      route: '/admin/partners',
      implemented: true
    },
    { 
      key: 'marketing', 
      icon: Megaphone, 
      labelKey: 'advancedTools.modulesList.marketing.label',
      descriptionKey: 'advancedTools.modulesList.marketing.description',
      color: '#E91E63', 
      tier: 'pro',
      route: '/configuracion/email',
      implemented: true
    },
    { 
      key: 'payments', 
      icon: Wallet, 
      labelKey: 'advancedTools.modulesList.payments.label',
      descriptionKey: 'advancedTools.modulesList.payments.description',
      color: '#635BFF', 
      tier: 'pro',
      route: '/facturacion',
      implemented: true
    },
    
    // PREMIUM - Solo para Premium
    { 
      key: 'accounting', 
      icon: Calculator, 
      labelKey: 'advancedTools.modulesList.accounting.label',
      descriptionKey: 'advancedTools.modulesList.accounting.description',
      color: '#F97316', 
      tier: 'premium',
      route: '/contabilidad',
      implemented: true
    },
    { 
      key: 'workflows', 
      icon: GitBranch, 
      labelKey: 'advancedTools.modulesList.workflows.label',
      descriptionKey: 'advancedTools.modulesList.workflows.description',
      color: '#6366F1', 
      tier: 'premium',
      route: '/workflows',
      implemented: true
    },
  ];

  // Por ahora, todos los módulos están disponibles (tier free)
  const userTier = 'premium' as PlanTier;

  const canAccess = (moduleTier: PlanTier): boolean => {
    if (userTier === 'premium') return true;
    if (userTier === 'pro') return moduleTier === 'pro' || moduleTier === 'free';
    return moduleTier === 'free';
  };

  const handleAction = (module: Module) => {
    if (!canAccess(module.tier)) {
      alert(`${t('advancedTools.requiresPlan')} ${module.tier.toUpperCase()}`);
      return;
    }
    
    if (!module.implemented) {
      alert(t('advancedTools.comingSoon'));
      return;
    }
    
    if (module.route) {
      setLocation(module.route);
    }
  };

  const getTierBadge = (tier: PlanTier): { label: string; color: string } | null => {
    if (tier === 'pro' && !canAccess('pro')) 
      return { label: t('advancedTools.badges.pro'), color: 'bg-amber-500' };
    if (tier === 'premium' && !canAccess('premium')) 
      return { label: t('advancedTools.badges.premium'), color: 'bg-purple-600' };
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
            <h1 className="text-4xl font-bold">{t('advancedTools.title')}</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            {t('advancedTools.subtitle')}
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              {ADVANCED_MODULES.length} {t('advancedTools.modulesAvailable')}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              {t('advancedTools.plan')}: {userTier.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Módulos FREE */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-1 bg-green-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-foreground">{t('advancedTools.freeModules')}</h2>
          <Badge variant="outline" className="ml-2">
            {freeModules.length} {t('advancedTools.modules')}
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
                    {t('advancedTools.badges.comingSoon')}
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
                  {t(module.labelKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(module.descriptionKey)}
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
          <h2 className="text-2xl font-bold text-foreground">{t('advancedTools.proModules')}</h2>
          <Badge variant="outline" className="ml-2">
            {proModules.length} {t('advancedTools.modules')}
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
                    {t('advancedTools.badges.comingSoon')}
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
                  {t(module.labelKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(module.descriptionKey)}
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
          <h2 className="text-2xl font-bold text-foreground">{t('advancedTools.premiumModules')}</h2>
          <Badge variant="outline" className="ml-2">
            {premiumModules.length} {t('advancedTools.modules')}
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
                    {t('advancedTools.badges.comingSoon')}
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
                  {t(module.labelKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(module.descriptionKey)}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
