import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "@/hooks/use-translation";

export function LicenseReminders() {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  
  const { data: summary, isLoading, refetch } = trpc.licenseReminders.getRemindersSummary.useQuery();
  const sendRemindersMutation = trpc.licenseReminders.checkAndSendReminders.useMutation();

  const handleSendReminders = async () => {
    setSending(true);
    try {
      const result = await sendRemindersMutation.mutateAsync();
      toast.success(t('licenseReminders.remindersSentSuccess', { count: result.remindersSent }));
      refetch();
    } catch (error: any) {
      toast.error(t('licenseReminders.errorSendingReminders') + ': ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const totalReminders = summary?.reduce((sum, s) => sum + s.count, 0) || 0;

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('licenseReminders.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('licenseReminders.description')}
          </p>
        </div>
        <Button 
          onClick={handleSendReminders} 
          disabled={sending || totalReminders === 0}
          size="lg"
        >
          <Send className="mr-2 h-4 w-4" />
          {sending ? t('licenseReminders.sending') : t('licenseReminders.sendReminders')}
        </Button>
      </div>

      {/* Alert Info */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertTitle>{t('licenseReminders.automaticRemindersSystem')}</AlertTitle>
        <AlertDescription>
          {t('licenseReminders.systemDescription')}
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {summary?.map((item) => (
          <Card key={item.days}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.label}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.count}</div>
              <p className="text-xs text-muted-foreground">
                {t('licenseReminders.licensesExpiringInDays', { days: item.days })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Lists */}
      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">{t('licenseReminders.loadingReminders')}</p>
            </CardContent>
          </Card>
        ) : summary && summary.length > 0 ? (
          summary.map((item) => (
            <Card key={item.days}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant={item.days === 7 ? "destructive" : item.days === 15 ? "default" : "secondary"}>
                    {item.count}
                  </Badge>
                  {t('licenseReminders.licensesExpiringIn', { label: item.label })}
                </CardTitle>
                <CardDescription>
                  {t('licenseReminders.needRenewalReminder')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {item.licenses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('licenseReminders.licenseId')}</TableHead>
                        <TableHead>{t('licenseReminders.userId')}</TableHead>
                        <TableHead>{t('licenseReminders.price')}</TableHead>
                        <TableHead>{t('licenseReminders.expirationDate')}</TableHead>
                        <TableHead>{t('licenseReminders.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.licenses.map((license) => (
                        <TableRow key={license.id}>
                          <TableCell className="font-medium">#{license.id}</TableCell>
                          <TableCell>{t('licenseReminders.userNumber', { id: license.userId })}</TableCell>
                          <TableCell>
                            {license.price} {license.currency}
                          </TableCell>
                          <TableCell>
                            {new Date(license.expiresAt!).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.days === 7 ? "destructive" : "default"}>
                              {item.days === 7 ? t('licenseReminders.urgent') : t('licenseReminders.pending')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    {t('licenseReminders.noLicensesExpiringInDays', { days: item.days })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                <p className="text-lg font-medium">{t('licenseReminders.noPendingReminders')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('licenseReminders.allLicensesUpToDate')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Footer */}
      <Card>
        <CardHeader>
          <CardTitle>{t('licenseReminders.howSystemWorks')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-1">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t('licenseReminders.automaticNotifications')}</p>
              <p className="text-sm text-muted-foreground">
                {t('licenseReminders.automaticNotificationsDescription')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-1">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t('licenseReminders.multipleReminders')}</p>
              <p className="text-sm text-muted-foreground">
                {t('licenseReminders.multipleRemindersDescription')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-1">
              <AlertCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t('licenseReminders.detailedInformation')}</p>
              <p className="text-sm text-muted-foreground">
                {t('licenseReminders.detailedInformationDescription')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
