import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, AlertTriangle, X, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export function LicenseNotificationBadge() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: expiringLicenses, refetch } = trpc.licenseNotifications.getExpiringLicenses.useQuery(
    { daysThreshold: 30 },
    { refetchInterval: 60000 } // Refetch cada minuto
  );

  const markAsNotified = trpc.licenseNotifications.markAsNotified.useMutation({
    onSuccess: () => {
      utils.licenseNotifications.getExpiringLicenses.invalidate();
    },
  });

  const createRenewalSession = trpc.licenseRenewal.createRenewalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
        toast.success('Redirigiendo a la página de pago...');
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleRenew = (licenseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    createRenewalSession.mutate({ licenseId });
  };

  const urgentCount = expiringLicenses?.filter(l => l.isUrgent).length || 0;
  const totalCount = expiringLicenses?.length || 0;

  if (totalCount === 0) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <Badge
              variant={urgentCount > 0 ? "destructive" : "default"}
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones de Licencias</span>
          {totalCount > 0 && (
            <Badge variant={urgentCount > 0 ? "destructive" : "secondary"}>
              {totalCount}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {urgentCount > 0 && (
          <>
            <div className="px-2 py-2 text-sm bg-red-50 dark:bg-red-950 border-l-4 border-red-500 mb-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">
                    ¡Atención Urgente!
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    {urgentCount} licencia{urgentCount > 1 ? 's' : ''} expira{urgentCount > 1 ? 'n' : ''} en menos de 7 días
                  </p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <div className="max-h-[300px] overflow-y-auto">
          {expiringLicenses?.map((license) => (
            <DropdownMenuItem
              key={license.id}
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              onClick={() => {
                markAsNotified.mutate({ licenseId: license.id });
                setLocation('/licenses/notifications');
                setIsOpen(false);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-sm">
                  Licencia #{license.id}
                </span>
                <Badge variant={license.isUrgent ? "destructive" : "secondary"} className="text-xs">
                  {license.daysUntilExpiration} día{license.daysUntilExpiration !== 1 ? 's' : ''}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {license.isUrgent ? '⚠️ ' : ''}
                Expira el {new Date(license.expiresAt!).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {license.licenseType === 'partner' && (
                  <Badge variant="outline" className="text-xs">
                    Partner
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant={license.isUrgent ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={(e) => handleRenew(license.id, e)}
                  disabled={createRenewalSession.isPending}
                >
                  <CreditCard className="h-3 w-3 mr-1" />
                  Renovar Ahora
                </Button>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-primary cursor-pointer"
          onClick={() => {
            setLocation('/licenses/notifications');
            setIsOpen(false);
          }}
        >
          Ver todas las notificaciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
