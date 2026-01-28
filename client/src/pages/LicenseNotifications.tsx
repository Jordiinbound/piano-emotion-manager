import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, AlertTriangle, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

export function LicenseNotifications() {
  const { t } = useTranslation();
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
      toast.success(t('licenseNotifications.notificationSent'));
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
        <h1 className="text-3xl font-bold">{t('licenseNotifications.title')}</h1>
        <p className="text-muted-foreground">
          {t('licenseNotifications.description')}
        </p>
      </div>

      {/* Alertas */}
      {urgentCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('licenseNotifications.urgentAttention')}</AlertTitle>
          <AlertDescription>
            {t('licenseNotifications.urgentMessage', { count: urgentCount })}
          </AlertDescription>
        </Alert>
      )}

      {totalExpiring > 0 && urgentCount === 0 && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertTitle>{t('licenseNotifications.upcomingRenewal')}</AlertTitle>
          <AlertDescription>
            {t('licenseNotifications.upcomingMessage', { count: totalExpiring, days: daysThreshold })}
          </AlertDescription>
        </Alert>
      )}

      {/* Mis Licencias Próximas a Expirar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('licenseNotifications.myLicenses')}</CardTitle>
              <CardDescription>
                {t('licenseNotifications.licensesExpiringIn', { days: daysThreshold })}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchMy()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('licenseNotifications.refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!myExpiringLicenses || myExpiringLicenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('licenseNotifications.noExpiringLicenses')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('licenseNotifications.license')}</TableHead>
                  <TableHead>{t('licenseNotifications.type')}</TableHead>
                  <TableHead>{t('licenseNotifications.status')}</TableHead>
                  <TableHead>{t('licenseNotifications.expiresIn')}</TableHead>
                  <TableHead>{t('licenseNotifications.expirationDate')}</TableHead>
                  <TableHead>{t('licenseNotifications.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myExpiringLicenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono">#{license.id}</TableCell>
                    <TableCell>
                      <Badge variant={license.licenseType === 'direct' ? 'default' : 'secondary'}>
                        {license.licenseType === 'direct' ? t('licenseNotifications.direct') : t('licenseNotifications.partner')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={license.isUrgent ? 'destructive' : 'default'}>
                        {license.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={license.isUrgent ? 'text-red-600 font-semibold' : ''}>
                        {license.daysUntilExpiration} {t('licenseNotifications.days', { count: license.daysUntilExpiration })}
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
                          {t('licenseNotifications.notify')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => window.location.href = '/licenses/renew?id=' + license.id}
                        >
                          {t('licenseNotifications.renew')}
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
              <CardTitle>{t('licenseNotifications.allSystemLicenses')}</CardTitle>
              <CardDescription>
                {t('licenseNotifications.adminViewDescription')}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchAll()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('licenseNotifications.refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!allExpiringData || allExpiringData.licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('licenseNotifications.noSystemLicensesExpiring')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('licenseNotifications.license')}</TableHead>
                  <TableHead>{t('licenseNotifications.user')}</TableHead>
                  <TableHead>{t('licenseNotifications.email')}</TableHead>
                  <TableHead>{t('licenseNotifications.type')}</TableHead>
                  <TableHead>{t('licenseNotifications.expiresIn')}</TableHead>
                  <TableHead>{t('licenseNotifications.date')}</TableHead>
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
                        {license.licenseType === 'direct' ? t('licenseNotifications.direct') : t('licenseNotifications.partner')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={license.isUrgent ? 'text-red-600 font-semibold' : ''}>
                        {license.daysUntilExpiration} {t('licenseNotifications.days', { count: license.daysUntilExpiration })}
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
            <CardTitle className="text-sm font-medium">{t('licenseNotifications.totalExpiring')}</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allExpiringData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('licenseNotifications.inNextDays', { days: daysThreshold })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('licenseNotifications.urgent')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {allExpiringData?.licenses.filter(l => l.isUrgent).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('licenseNotifications.lessThan7Days')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('licenseNotifications.myLicenses')}</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{totalExpiring}</div>
            <p className="text-xs text-muted-foreground">
              {t('licenseNotifications.requireAttention')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
