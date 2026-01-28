import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Agenda from "./pages/Agenda";
import CitaNueva from "./pages/CitaNueva";
import CitaEditar from "./pages/CitaEditar";
import Clientes from "./pages/Clientes";
import ClienteNuevo from "./pages/ClienteNuevo";
import ClienteEditar from "./pages/ClienteEditar";
import Pianos from "./pages/Pianos";
import PianoNuevo from "./pages/PianoNuevo";
import PianoEditar from "./pages/PianoEditar";
import PianoDetalle from "./pages/PianoDetalle";
import Servicios from "./pages/Servicios";
import ServicioNuevo from "./pages/ServicioNuevo";
import ServicioEditar from "./pages/ServicioEditar";
import Facturacion from "./pages/Facturacion";
import FacturaNueva from "./pages/FacturaNueva";
import FacturaEditar from "./pages/FacturaEditar";
import Inventario from "./pages/Inventario";
import InventarioNuevo from "./pages/InventarioNuevo";
import InventarioEditar from "./pages/InventarioEditar";
import Store from "./pages/Store";
import Reportes from "./pages/Reportes";
import AccesosRapidos from "./pages/AccesosRapidos";
import Marketing from "./pages/Marketing";
import Alertas from "./pages/Alertas";
import ConfiguracionAlertas from "./pages/ConfiguracionAlertas";
import HerramientasAvanzadas from "./pages/HerramientasAvanzadas";
import OptimizadorRutas from "./pages/OptimizadorRutas";
import Configuracion from "./pages/Configuracion";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PayInvoice from "./pages/PayInvoice";
import ClientPortalLogin from "./pages/ClientPortalLogin";
import ClientPortalRegister from "./pages/ClientPortalRegister";
import ClientPortalDashboard from "./pages/ClientPortalDashboard";
import ConfiguracionSMTP from "./pages/ConfiguracionSMTP";
import EmailConfig from "./pages/EmailConfig";
import PaymentStats from "./pages/PaymentStats";
import Presupuestos from "./pages/Presupuestos";
import PresupuestoNuevo from "./pages/PresupuestoNuevo";
import TiposServicio from "./pages/TiposServicio";
import { PartnersAdmin } from "./pages/PartnersAdmin";
import { ActivationCodesAdmin } from "./pages/ActivationCodesAdmin";
import { LicensesAdmin } from "./pages/LicensesAdmin";
import { ActivateLicense } from "./pages/ActivateLicense";
import Notificaciones from "./pages/Notificaciones";
import Recordatorios from "./pages/Recordatorios";
import { OrganizationSettings } from "./pages/OrganizationSettings";
import { LicenseNotifications } from "./pages/LicenseNotifications";
import { RenewalSuccess } from "./pages/RenewalSuccess";
import { PartnerDashboard } from "./pages/PartnerDashboard";
import { LicenseReminders } from "./pages/LicenseReminders";
import { RolesManagement } from "./pages/RolesManagement";
import { GlobalAnalytics } from "./pages/GlobalAnalytics";
import Contabilidad from "./pages/Contabilidad";
import Workflows from "./pages/Workflows";
import TranslationManager from "./pages/TranslationManager";

function Router() {
  return (
    <Switch>
      {/* Rutas públicas sin autenticación */}
      <Route path="/pay/:token" component={PayInvoice} />
      <Route path="/activate" component={ActivateLicense} />
      
      {/* Rutas del portal del cliente */}
      <Route path="/client-portal/login" component={ClientPortalLogin} />
      <Route path="/client-portal/register" component={ClientPortalRegister} />
      <Route path="/client-portal/dashboard" component={ClientPortalDashboard} />
      
      {/* Ruta de configuración de email con OAuth2 */}
      <Route path="/configuracion/email">
        <ProtectedRoute>
          <Layout>
            <EmailConfig />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      {/* Rutas de autenticación sin layout */}
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      
      {/* Rutas con layout */}
      <Route path="/">
        <ProtectedRoute>
          <Layout>
            <Home />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      {/* MAIN */}
      <Route path="/agenda">
        <ProtectedRoute>
          <Layout>
            <Agenda />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/agenda/nueva">
        <ProtectedRoute>
          <Layout>
            <CitaNueva />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/agenda/:id/editar">
        <ProtectedRoute>
          <Layout>
            <CitaEditar />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/clientes">
        <ProtectedRoute>
          <Layout>
            <Clientes />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/clientes/nuevo">
        <ProtectedRoute>
          <Layout>
            <ClienteNuevo />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/clientes/:id/editar">
        <ProtectedRoute>
          <Layout>
            <ClienteEditar />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/pianos">
        <ProtectedRoute>
          <Layout>
            <Pianos />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/pianos/nuevo">
        <ProtectedRoute>
          <Layout>
            <PianoNuevo />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/pianos/:id/editar">
        <ProtectedRoute>
          <Layout>
            <PianoEditar />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/pianos/:id">
        <ProtectedRoute>
          <Layout>
            <PianoDetalle />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/servicios">
        <ProtectedRoute>
          <Layout>
            <Servicios />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/servicios/nuevo">
        <ProtectedRoute>
          <Layout>
            <ServicioNuevo />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/servicios/:id/editar">
        <ProtectedRoute>
          <Layout>
            <ServicioEditar />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/facturacion">
        <ProtectedRoute>
          <Layout>
            <Facturacion />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/facturacion/estadisticas">
        <ProtectedRoute>
          <Layout>
            <PaymentStats />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/facturacion/nueva">
        <ProtectedRoute>
          <Layout>
            <FacturaNueva />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/facturacion/:id/editar">
        <ProtectedRoute>
          <Layout>
            <FacturaEditar />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/inventario">
        <ProtectedRoute>
          <Layout>
            <Inventario />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/inventario/nuevo">
        <ProtectedRoute>
          <Layout>
            <InventarioNuevo />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/inventario/:id/editar">
        <ProtectedRoute>
          <Layout>
            <InventarioEditar />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/notificaciones">
        <ProtectedRoute>
          <Layout>
            <Notificaciones />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/recordatorios">
        <ProtectedRoute>
          <Layout>
            <Recordatorios />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/marketing">
        <ProtectedRoute>
          <Layout>
            <Marketing />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/presupuestos">
        <ProtectedRoute>
          <Layout>
            <Presupuestos />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/presupuestos/nuevo">
        <ProtectedRoute>
          <Layout>
            <PresupuestoNuevo />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/tipos-servicio">
        <ProtectedRoute>
          <Layout>
            <TiposServicio />
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* MULTI-TENANT ADMIN */}
      <Route path="/admin/partners">
        <ProtectedRoute>
          <Layout>
            <PartnersAdmin />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/activation-codes">
        <ProtectedRoute>
          <Layout>
            <ActivationCodesAdmin />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/licenses">
        <ProtectedRoute>
          <Layout>
            <LicensesAdmin />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/organization/settings">
        <ProtectedRoute>
          <Layout>
            <OrganizationSettings />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/licenses/notifications">
        <ProtectedRoute>
          <Layout>
            <LicenseNotifications />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/licenses/renewal-success">
        <ProtectedRoute>
          <Layout>
            <RenewalSuccess />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/partner/dashboard">
        <ProtectedRoute>
          <Layout>
            <PartnerDashboard />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/licenses/reminders">
        <ProtectedRoute>
          <Layout>
            <LicenseReminders />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/roles">
        <ProtectedRoute>
          <Layout>
            <RolesManagement />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/analytics">
        <ProtectedRoute>
          <Layout>
            <GlobalAnalytics />
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* HERRAMIENTAS AVANZADAS - Nuevos Módulos */}
      <Route path="/contabilidad">
        <ProtectedRoute>
          <Layout>
            <Contabilidad />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/workflows">
        <ProtectedRoute>
          <Layout>
            <Workflows />
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* COMERCIAL */}
      <Route path="/store">
        <ProtectedRoute>
          <Layout>
            <Store />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/reportes">
        <ProtectedRoute>
          <Layout>
            <Reportes />
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* HERRAMIENTAS */}
      <Route path="/accesos-rapidos">
        <ProtectedRoute>
          <Layout>
            <AccesosRapidos />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/alertas">
        <ProtectedRoute>
          <Layout>
            <Alertas />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/alertas/configuracion">
        <ProtectedRoute>
          <Layout>
            <ConfiguracionAlertas />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/herramientas-avanzadas">
        <ProtectedRoute>
          <Layout>
            <HerramientasAvanzadas />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/optimizador-rutas">
        <ProtectedRoute>
          <Layout>
            <OptimizadorRutas />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/configuracion">
        <ProtectedRoute>
          <Layout>
            <Configuracion />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/translation-manager">
        <ProtectedRoute>
          <Layout>
            <TranslationManager />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
