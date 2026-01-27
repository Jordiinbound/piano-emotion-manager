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
import Clientes from "./pages/Clientes";
import Pianos from "./pages/Pianos";
import Servicios from "./pages/Servicios";
import Facturacion from "./pages/Facturacion";
import Inventario from "./pages/Inventario";
import Store from "./pages/Store";
import Reportes from "./pages/Reportes";
import AccesosRapidos from "./pages/AccesosRapidos";
import HerramientasAvanzadas from "./pages/HerramientasAvanzadas";
import Configuracion from "./pages/Configuracion";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function Router() {
  return (
    <Switch>
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
      <Route path="/clientes">
        <ProtectedRoute>
          <Layout>
            <Clientes />
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
      <Route path="/servicios">
        <ProtectedRoute>
          <Layout>
            <Servicios />
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
      <Route path="/inventario">
        <ProtectedRoute>
          <Layout>
            <Inventario />
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
      <Route path="/herramientas-avanzadas">
        <ProtectedRoute>
          <Layout>
            <HerramientasAvanzadas />
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
