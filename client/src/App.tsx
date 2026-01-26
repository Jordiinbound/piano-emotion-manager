import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
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
        <Layout>
          <Home />
        </Layout>
      </Route>
      
      {/* MAIN */}
      <Route path="/agenda">
        <Layout>
          <Agenda />
        </Layout>
      </Route>
      <Route path="/clientes">
        <Layout>
          <Clientes />
        </Layout>
      </Route>
      <Route path="/pianos">
        <Layout>
          <Pianos />
        </Layout>
      </Route>
      <Route path="/servicios">
        <Layout>
          <Servicios />
        </Layout>
      </Route>
      <Route path="/facturacion">
        <Layout>
          <Facturacion />
        </Layout>
      </Route>
      <Route path="/inventario">
        <Layout>
          <Inventario />
        </Layout>
      </Route>

      {/* COMERCIAL */}
      <Route path="/store">
        <Layout>
          <Store />
        </Layout>
      </Route>
      <Route path="/reportes">
        <Layout>
          <Reportes />
        </Layout>
      </Route>

      {/* HERRAMIENTAS */}
      <Route path="/accesos-rapidos">
        <Layout>
          <AccesosRapidos />
        </Layout>
      </Route>
      <Route path="/herramientas-avanzadas">
        <Layout>
          <HerramientasAvanzadas />
        </Layout>
      </Route>
      <Route path="/configuracion">
        <Layout>
          <Configuracion />
        </Layout>
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
