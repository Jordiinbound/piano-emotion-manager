import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
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
      
      <Route path="/clientes">
        <Layout>
          <div className="text-foreground">
            <h1 className="text-3xl font-bold mb-4">Clientes</h1>
            <p className="text-muted-foreground">Página de gestión de clientes (próximamente)</p>
          </div>
        </Layout>
      </Route>
      
      <Route path="/servicios">
        <Layout>
          <div className="text-foreground">
            <h1 className="text-3xl font-bold mb-4">Servicios</h1>
            <p className="text-muted-foreground">Página de gestión de servicios (próximamente)</p>
          </div>
        </Layout>
      </Route>
      
      <Route path="/pianos">
        <Layout>
          <div className="text-foreground">
            <h1 className="text-3xl font-bold mb-4">Pianos</h1>
            <p className="text-muted-foreground">Página de gestión de pianos (próximamente)</p>
          </div>
        </Layout>
      </Route>
      
      <Route path="/predicciones">
        <Layout>
          <div className="text-foreground">
            <h1 className="text-3xl font-bold mb-4">Predicciones</h1>
            <p className="text-muted-foreground">Página de predicciones matemáticas (próximamente)</p>
          </div>
        </Layout>
      </Route>
      
      <Route path="/reportes">
        <Layout>
          <div className="text-foreground">
            <h1 className="text-3xl font-bold mb-4">Reportes</h1>
            <p className="text-muted-foreground">Página de reportes y analytics (próximamente)</p>
          </div>
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
