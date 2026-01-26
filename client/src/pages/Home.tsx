import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Página de inicio - Dashboard con métricas básicas
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  
  console.log('[Home] Auth state:', { user, loading, isAuthenticated });
  
  // Obtener métricas del dashboard (sin depender de autenticación por ahora)
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = trpc.dashboard.getMetrics.useQuery();

  // Mostrar estado de carga con información de depuración
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Cargando autenticación...</p>
        <div className="text-xs text-muted-foreground">
          <p>Loading: {loading.toString()}</p>
          <p>Authenticated: {isAuthenticated.toString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              {isAuthenticated ? `Bienvenido, ${user?.name || user?.email}` : 'No autenticado'}
            </p>
          </div>
          {isAuthenticated && (
            <Button variant="outline" onClick={() => logout()}>
              Cerrar Sesión
            </Button>
          )}
          {!isAuthenticated && (
            <Button asChild>
              <a href="/sign-in">Iniciar Sesión</a>
            </Button>
          )}
        </div>

        {metricsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : metricsError ? (
          <Card>
            <CardHeader>
              <CardTitle>Error al cargar métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{metricsError.message}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clientes</CardTitle>
                <CardDescription>Total de clientes registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{metrics?.clients ?? 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servicios</CardTitle>
                <CardDescription>Total de servicios realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{metrics?.services ?? 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pianos</CardTitle>
                <CardDescription>Total de pianos registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{metrics?.pianos ?? 0}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
