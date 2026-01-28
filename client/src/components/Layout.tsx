import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Calendar,
  Users,
  Music,
  Wrench,
  Receipt,
  Package,
  Store,
  BarChart3,
  Zap,
  Settings,
  Hammer,
  Menu,
  X,
  LogOut,
  Shield,
  Key,
  FileText,
  Building2,
  Bell,
  TrendingUp,
  UserCog,
  Languages,
  ClipboardList,
  Megaphone,
  Route,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LicenseNotificationBadge } from '@/components/LicenseNotificationBadge';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { GlobalSearch } from '@/components/GlobalSearch';
import AIAssistantButton from '@/components/AIAssistantButton';
import { LanguageSelector } from '@/components/LanguageSelector';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  name: string;
  href: string;
  icon: typeof Home;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: 'MAIN',
    items: [
      { name: 'Inicio', href: '/', icon: Home },
      { name: 'Agenda', href: '/agenda', icon: Calendar },
      { name: 'Clientes', href: '/clientes', icon: Users },
      { name: 'Pianos', href: '/pianos', icon: Music },
      { name: 'Servicios', href: '/servicios', icon: Wrench },
      { name: 'Facturación', href: '/facturacion', icon: Receipt },
      { name: 'Inventario', href: '/inventario', icon: Package },
    ],
  },
  {
    title: 'COMERCIAL',
    items: [
      { name: 'Store', href: '/store', icon: Store },
      { name: 'Reportes', href: '/reportes', icon: BarChart3 },
    ],
  },
  {
    title: 'HERRAMIENTAS',
    items: [
      { name: 'Accesos Rápidos', href: '/accesos-rapidos', icon: Zap },
      { name: 'Notificaciones', href: '/notificaciones', icon: Bell },
      { name: 'Recordatorios', href: '/recordatorios', icon: ClipboardList },
      { name: 'Marketing', href: '/marketing', icon: Megaphone },
      { name: 'Alertas', href: '/alertas', icon: Bell },
      { name: 'Herramientas Avanzadas', href: '/herramientas-avanzadas', icon: Hammer },
      { name: 'Optimizador de Rutas', href: '/optimizador-rutas', icon: Route },
      { name: 'Configuración', href: '/configuracion', icon: Settings },
    ],
  },
  {
    title: 'ADMINISTRACIÓN',
    items: [
      { name: 'Partners', href: '/admin/partners', icon: Building2 },
      { name: 'Códigos de Activación', href: '/admin/activation-codes', icon: Key },
      { name: 'Licencias', href: '/admin/licenses', icon: FileText },
      { name: 'Roles y Permisos', href: '/admin/roles', icon: Shield },
      { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
      { name: 'Organización', href: '/organization/settings', icon: UserCog },
      { name: 'Notificaciones', href: '/licenses/notifications', icon: Bell },
      { name: 'Gestor de Traducciones', href: '/translation-manager', icon: Languages },
    ],
  },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Obtener resumen de alertas para el badge
  const { data: alertsSummary } = trpc.alerts.getSummary.useQuery(undefined, {
    refetchInterval: 60000, // Refetch cada minuto
  });

  // Obtener estadísticas de recordatorios para el badge
  const { data: remindersStats } = trpc.reminders.getStats.useQuery(undefined, {
    refetchInterval: 60000, // Refetch cada minuto
  });

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location.startsWith(href);
  };

  const renderMenuSection = (section: MenuSection, isMobile: boolean = false) => (
    <div key={section.title} className="mb-6">
      <h3 className="text-xs font-semibold text-muted-foreground px-3 mb-2 tracking-wider">
        {section.title}
      </h3>
      <ul role="list" className="space-y-1">
        {section.items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`
                  group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative
                  ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                )}
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.name}
                {item.name === 'Alertas' && alertsSummary && alertsSummary.total > 0 && (
                  <Badge 
                    variant={alertsSummary.overdueInvoices > 0 || alertsSummary.pianoAlerts > 0 ? "destructive" : "default"}
                    className="ml-auto"
                  >
                    {alertsSummary.total}
                  </Badge>
                )}
                {item.name === 'Recordatorios' && remindersStats && (remindersStats.overdue > 0 || remindersStats.pending > 0) && (
                  <Badge 
                    variant={remindersStats.overdue > 0 ? "destructive" : "default"}
                    className="ml-auto"
                  >
                    {remindersStats.overdue > 0 ? remindersStats.overdue : remindersStats.pending}
                  </Badge>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      <OnboardingWizard />
      <div className="flex h-screen bg-background">
        {/* Sidebar para desktop */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-4 pb-4">
          {/* Logo/Brand */}
          <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border">
            <Music className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">Piano Emotion</h1>
              <p className="text-xs text-muted-foreground">Manager</p>
            </div>
          </div>

          {/* Menu Sections */}
          <nav className="flex flex-1 flex-col">
            <div className="flex-1">
              {menuSections.map((section) => renderMenuSection(section))}
            </div>

            {/* Notifications section */}
            <div className="px-3 pb-3">
              <LicenseNotificationBadge />
            </div>

            {/* User section */}
            <div className="mt-auto pt-4 border-t border-border">
              {user ? (
                <div className="space-y-3">
                  <div className="px-3">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Cerrar sidebar</span>
                  <X className="h-6 w-6 text-foreground" aria-hidden="true" />
                </button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card px-4 pb-4">
                {/* Logo/Brand */}
                <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border">
                  <Music className="h-8 w-8 text-primary" />
                  <div>
                    <h1 className="text-lg font-bold text-foreground leading-tight">Piano Emotion</h1>
                    <p className="text-xs text-muted-foreground">Manager</p>
                  </div>
                </div>

                {/* Menu Sections */}
                <nav className="flex flex-1 flex-col">
                  <div className="flex-1">
                    {menuSections.map((section) => renderMenuSection(section, true))}
                  </div>

                  {/* User section */}
                  <div className="mt-auto pt-4 border-t border-border">
                    {user ? (
                      <div className="space-y-3">
                        <div className="px-3">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user.name || user.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Cerrar Sesión
                        </Button>
                      </div>
                    ) : (
                      <Link
                        href="/sign-in"
                        className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                        onClick={() => setSidebarOpen(false)}
                      >
                        Iniciar Sesión
                      </Link>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header móvil */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="hidden sm:flex flex-1 items-center gap-3">
              <Music className="h-6 w-6 text-primary" />
              <h1 className="text-base font-semibold text-foreground">Piano Emotion</h1>
            </div>
            <div className="flex flex-1 items-center">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <LicenseNotificationBadge />
            </div>
          </div>
        </div>

        <main className="py-6 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Botón flotante de ayuda IA */}
      <AIAssistantButton />
    </div>
    </>
  );
}
