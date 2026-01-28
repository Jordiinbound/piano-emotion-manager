import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export function LicenseExpirationAlert() {
  const [, setLocation] = useLocation();
  const [dismissed, setDismissed] = useState(false);

  const { data: expiringLicenses } = trpc.licenseNotifications.getExpiringLicenses.useQuery(
    { daysThreshold: 30 },
    { refetchInterval: 300000 } // Refetch cada 5 minutos
  );

  const urgentCount = expiringLicenses?.filter(l => l.isUrgent).length || 0;
  const totalCount = expiringLicenses?.length || 0;

  if (dismissed || totalCount === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {urgentCount > 0 ? (
        <Alert variant="destructive" className="relative">
          <AlertTriangle className="h-4 w-4" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
          <AlertTitle>¡Atención Urgente!</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              Tienes {urgentCount} licencia{urgentCount > 1 ? 's' : ''} que expira{urgentCount > 1 ? 'n' : ''} en menos de 7 días.
              Renueva ahora para evitar interrupciones en el servicio.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/licenses/notifications')}
              className="mt-2"
            >
              Ver Detalles
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="relative">
          <Bell className="h-4 w-4" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
          <AlertTitle>Renovación Próxima</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              Tienes {totalCount} licencia{totalCount > 1 ? 's' : ''} que expira{totalCount > 1 ? 'n' : ''} en los próximos 30 días.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/licenses/notifications')}
              className="mt-2"
            >
              Ver Detalles
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
