import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

/**
 * Página de inicio - Dashboard con métricas básicas
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  
  // Obtener métricas del dashboard
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.getMetrics.useQuery(
    undefined,
    {
      enabled: isAuthenticated, // Solo ejecutar si el usuario está autenticado
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Piano Emotion Manager</CardTitle>
            <CardDescription>
              Inicia sesión para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Iniciar Sesión</a>
            </Button>
          </CardContent>
        </Card>
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
              Bienvenido, {user?.name || user?.email}
            </p>
          </div>
          <Button variant="outline" onClick={() => logout()}>
            Cerrar Sesión
          </Button>
        </div>

        {metricsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
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
