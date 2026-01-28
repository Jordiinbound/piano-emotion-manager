import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, AlertTriangle, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function LicenseNotifications() {
  const [daysThreshold, setDaysThreshold] = useState(30);

  const { data: myExpiringLicenses, refetch: refetchMy } = trpc.licenseNotifications.getExpiringLicenses.useQuery({
    daysThreshold,
  });

  const { data: allExpiringData, refetch: refetchAll } = trpc.licenseNotifications.getAllExpiringLicenses.useQuery({
    daysThreshold,
    page: 1,
    limit: 50,
  });

  const sendNotificationMutation = trpc.licenseNotifications.sendExpirationNotification.useMutation({
    onSuccess: () => {
      toast.success("Notificación enviada");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const urgentCount = myExpiringLicenses?.filter(l => l.isUrgent).length || 0;
  const totalExpiring = myExpiringLicenses?.length || 0;

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notificaciones de Licencias</h1>
        <p className="text-muted-foreground">
          Gestiona las licencias próximas a expirar
        </p>
      </div>

      {/* Alertas */}
      {urgentCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>¡Atención Urgente!</AlertTitle>
          <AlertDescription>
            Tienes {urgentCount} licencia{urgentCount > 1 ? 's' : ''} que expira{urgentCount > 1 ? 'n' : ''} en menos de 7 días.
            Renueva ahora para evitar interrupciones en el servicio.
          </AlertDescription>
        </Alert>
      )}

      {totalExpiring > 0 && urgentCount === 0 && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertTitle>Renovación Próxima</AlertTitle>
          <AlertDescription>
            Tienes {totalExpiring} licencia{totalExpiring > 1 ? 's' : ''} que expira{totalExpiring > 1 ? 'n' : ''} en los próximos {daysThreshold} días.
          </AlertDescription>
        </Alert>
      )}

      {/* Mis Licencias Próximas a Expirar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mis Licencias</CardTitle>
              <CardDescription>
                Licencias que expiran en los próximos {daysThreshold} días
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchMy()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!myExpiringLicenses || myExpiringLicenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tienes licencias próximas a expirar
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Licencia</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Expira en</TableHead>
                  <TableHead>Fecha de Expiración</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myExpiringLicenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono">#{license.id}</TableCell>
                    <TableCell>
                      <Badge variant={license.licenseType === 'direct' ? 'default' : 'secondary'}>
                        {license.licenseType === 'direct' ? 'Directa' : 'Partner'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={license.isUrgent ? 'destructive' : 'default'}>
                        {license.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={license.isUrgent ? 'text-red-600 font-semibold' : ''}>
                        {license.daysUntilExpiration} día{license.daysUntilExpiration !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(license.expiresAt!).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendNotificationMutation.mutate({ licenseId: license.id })}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Notificar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => window.location.href = '/licenses/renew?id=' + license.id}
                        >
                          Renovar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Todas las Licencias (Admin View) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todas las Licencias del Sistema</CardTitle>
              <CardDescription>
                Vista administrativa de todas las licencias próximas a expirar
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchAll()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!allExpiringData || allExpiringData.licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay licencias próximas a expirar en el sistema
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Licencia</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Expira en</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allExpiringData.licenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono">#{license.id}</TableCell>
                    <TableCell>{license.userName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{license.userEmail}</TableCell>
                    <TableCell>
                      <Badge variant={license.licenseType === 'direct' ? 'default' : 'secondary'}>
                        {license.licenseType === 'direct' ? 'Directa' : 'Partner'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={license.isUrgent ? 'text-red-600 font-semibold' : ''}>
                        {license.daysUntilExpiration} día{license.daysUntilExpiration !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(license.expiresAt!).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expirando</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allExpiringData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              En los próximos {daysThreshold} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {allExpiringData?.licenses.filter(l => l.isUrgent).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Menos de 7 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Licencias</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{totalExpiring}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
