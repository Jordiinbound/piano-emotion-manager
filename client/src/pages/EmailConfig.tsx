/**
 * Email Configuration Page
 * Piano Emotion Manager
 * 
 * Configuración de email con OAuth2 (Gmail/Outlook) y SMTP manual
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

export default function EmailConfig() {
  const { t } = useTranslation();
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    user: '',
    password: '',
    secure: false,
    fromName: '',
  });

  // Obtener configuración actual
  const { data: config, isLoading, refetch } = trpc.emailConfig.getConfig.useQuery();

  // Mutaciones
  const configureSMTP = trpc.emailConfig.configureSMTP.useMutation({
    onSuccess: () => {
      toast.success(t('emailConfig.configurationSaved'), {
        description: t('emailConfig.smtpConfigurationSavedSuccessfully'),
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const disconnect = trpc.emailConfig.disconnect.useMutation({
    onSuccess: () => {
      toast.success(t('emailConfig.disconnected'), {
        description: t('emailConfig.emailConfigurationRemoved'),
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Obtener URLs de autorización
  const { data: gmailAuthData } = trpc.emailConfig.getGmailAuthUrl.useQuery();
  const { data: outlookAuthData } = trpc.emailConfig.getOutlookAuthUrl.useQuery();

  const handleSMTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    configureSMTP.mutate(smtpConfig);
  };

  const handleGmailConnect = () => {
    if (gmailAuthData?.authUrl) {
      window.location.href = gmailAuthData.authUrl;
    }
  };

  const handleOutlookConnect = () => {
    if (outlookAuthData?.authUrl) {
      window.location.href = outlookAuthData.authUrl;
    }
  };

  const handleDisconnect = () => {
    if (confirm(t('emailConfig.confirmRemoveConfiguration'))) {
      disconnect.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isConnected = config?.emailProvider && config.emailProvider !== 'smtp';
  const isOAuth2 = config?.emailProvider === 'gmail_oauth' || config?.emailProvider === 'outlook_oauth';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('emailConfig.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('emailConfig.description')}
        </p>
      </div>

      {/* Estado actual */}
      {isConnected && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">{t('emailConfig.emailConfigured')}</p>
                  <p className="text-sm text-green-700">
                    {config.emailProvider === 'gmail_oauth' && `Gmail: ${config.oauth2Email}`}
                    {config.emailProvider === 'outlook_oauth' && `Outlook: ${config.oauth2Email}`}
                    {config.emailProvider === 'smtp' && `SMTP: ${config.smtpUser}`}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={disconnect.isPending}
              >
                {disconnect.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('emailConfig.disconnecting')}
                  </>
                ) : (
                  t('emailConfig.disconnect')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OAuth2 Options */}
      <Card>
        <CardHeader>
          <CardTitle>{t('emailConfig.oauth2AuthenticationRecommended')}</CardTitle>
          <CardDescription>
            {t('emailConfig.oauth2Description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gmail */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gmail</h3>
                  <p className="text-sm text-gray-600">Google Workspace</p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleGmailConnect}
                disabled={!gmailAuthData?.authUrl}
              >
                {config?.emailProvider === 'gmail_oauth' ? t('emailConfig.reconnectGmail') : t('emailConfig.connectWithGmail')}
              </Button>
            </div>

            {/* Outlook */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Outlook</h3>
                  <p className="text-sm text-gray-600">Microsoft 365</p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleOutlookConnect}
                disabled={!outlookAuthData?.authUrl}
              >
                {config?.emailProvider === 'outlook_oauth' ? t('emailConfig.reconnectOutlook') : t('emailConfig.connectWithOutlook')}
              </Button>
            </div>
          </div>

          {/* Advertencia si no hay credenciales */}
          {(!gmailAuthData?.authUrl || !outlookAuthData?.authUrl) && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">{t('emailConfig.oauth2ConfigurationPending')}</p>
                <p>
                  {t('emailConfig.oauth2ConfigurationInstructions')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMTP Manual */}
      <Card>
        <CardHeader>
          <CardTitle>{t('emailConfig.manualSmtpConfiguration')}</CardTitle>
          <CardDescription>
            {t('emailConfig.manualSmtpDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSMTPSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">{t('emailConfig.smtpServer')}</Label>
                <Input
                  id="host"
                  placeholder="smtp.gmail.com"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">{t('emailConfig.port')}</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="587"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user">{t('emailConfig.userEmail')}</Label>
                <Input
                  id="user"
                  type="email"
                  placeholder={t('emailConfig.userEmailPlaceholder')}
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('emailConfig.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName">{t('emailConfig.senderName')}</Label>
                <Input
                  id="fromName"
                  placeholder="Piano Emotion"
                  value={smtpConfig.fromName}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="secure"
                  checked={smtpConfig.secure}
                  onCheckedChange={(checked) => setSmtpConfig({ ...smtpConfig, secure: checked })}
                />
                <Label htmlFor="secure">{t('emailConfig.useSslTls')}</Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={configureSMTP.isPending}
              className="w-full md:w-auto"
            >
              {configureSMTP.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('emailConfig.saveSmtpConfiguration')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>{t('emailConfig.information')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p>
              <strong>{t('emailConfig.oauth2RecommendedTitle')}</strong> {t('emailConfig.oauth2RecommendedDescription')}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p>
              <strong>{t('emailConfig.manualSmtpTitle')}</strong> {t('emailConfig.manualSmtpWarning')}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p>
              <strong>{t('emailConfig.securityTitle')}</strong> {t('emailConfig.securityWarning')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
