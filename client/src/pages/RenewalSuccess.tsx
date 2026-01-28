import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function RenewalSuccess() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    setSessionId(sid);
  }, []);

  const { data, isLoading, error } = trpc.licenseRenewal.confirmRenewal.useMutation({
    onSuccess: () => {
      // Invalidar queries de licencias para actualizar la UI
      trpc.useUtils().licenseNotifications.getExpiringLicenses.invalidate();
    },
  });

  useEffect(() => {
    if (sessionId && !data && !isLoading && !error) {
      data.mutate({ sessionId });
    }
  }, [sessionId, data, isLoading, error]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              {t('renewalSuccess.processingRenewal')}
            </CardTitle>
            <CardDescription>
              {t('renewalSuccess.confirmingPayment')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-6 w-6" />
              {t('renewalSuccess.errorProcessingRenewal')}
            </CardTitle>
            <CardDescription>
              {t('renewalSuccess.problemConfirmingRenewal')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setLocation('/licenses/notifications')}>
                {t('renewalSuccess.viewMyLicenses')}
              </Button>
              <Button variant="outline" onClick={() => setLocation('/')}>
                {t('renewalSuccess.goToDashboard')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data) {
    const newExpiration = new Date(data.newExpirationDate);
    
    return (
      <div className="container max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              {t('renewalSuccess.renewalSuccessful')}
            </CardTitle>
            <CardDescription>
              {t('renewalSuccess.licenseRenewedSuccessfully')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {t('renewalSuccess.newExpirationDate')}:
              </p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                {newExpiration.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              {t('renewalSuccess.licenseNowActive')}
            </p>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setLocation('/')}>
                {t('renewalSuccess.goToDashboard')}
              </Button>
              <Button variant="outline" onClick={() => setLocation('/licenses/notifications')}>
                {t('renewalSuccess.viewMyLicenses')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
