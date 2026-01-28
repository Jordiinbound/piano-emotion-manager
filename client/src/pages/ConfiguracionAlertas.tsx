/**
 * Configuración de Alertas - Piano Emotion Manager
 * Página para personalizar umbrales y preferencias de alertas
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Music, 
  Calendar, 
  DollarSign, 
  Package, 
  Wrench, 
  Users,
  Bell,
  Save,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

export default function ConfiguracionAlertas() {
  const { t } = useTranslation();
  const { data: settings, isLoading, refetch } = trpc.alertSettings.getSettings.useQuery();
  const [formData, setFormData] = useState(settings || {});

  // Actualizar formData cuando se carguen los settings
  useState(() => {
    if (settings) {
      setFormData(settings);
    }
  });

  const updateMutation = trpc.alertSettings.updateSettings.useMutation({
    onSuccess: () => {
      toast.success(t('alertSettings.saveSuccess'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t('alertSettings.saveError'));
    },
  });

  const resetMutation = trpc.alertSettings.resetSettings.useMutation({
    onSuccess: () => {
      toast.success(t('alertSettings.resetSuccess'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t('alertSettings.resetError'));
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleReset = () => {
    if (confirm(t('alertSettings.resetConfirm'))) {
      resetMutation.mutate();
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('alertSettings.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('alertSettings.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={resetMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('alertSettings.reset')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {t('alertSettings.saveChanges')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pianos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="pianos">
            <Music className="h-4 w-4 mr-2" />
            {t('alertSettings.tabs.pianos')}
          </TabsTrigger>
          <TabsTrigger value="citas">
            <Calendar className="h-4 w-4 mr-2" />
            {t('alertSettings.tabs.appointments')}
          </TabsTrigger>
          <TabsTrigger value="finanzas">
            <DollarSign className="h-4 w-4 mr-2" />
            {t('alertSettings.tabs.finances')}
          </TabsTrigger>
          <TabsTrigger value="inventario">
            <Package className="h-4 w-4 mr-2" />
            {t('alertSettings.tabs.inventory')}
          </TabsTrigger>
          <TabsTrigger value="mantenimiento">
            <Wrench className="h-4 w-4 mr-2" />
            {t('alertSettings.tabs.maintenance')}
          </TabsTrigger>
          <TabsTrigger value="clientes">
            <Users className="h-4 w-4 mr-2" />
            {t('alertSettings.tabs.clients')}
          </TabsTrigger>
          <TabsTrigger value="notificaciones">
            <Bell className="h-4 w-4 mr-2" />
            {t('alertSettings.tabs.notifications')}
          </TabsTrigger>
        </TabsList>

        {/* PIANOS */}
        <TabsContent value="pianos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('alertSettings.pianos.title')}</CardTitle>
              <CardDescription>
                {t('alertSettings.pianos.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tuningPending">{t('alertSettings.pianos.tuningPending')}</Label>
                  <Input
                    id="tuningPending"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.tuningPendingDays || 180}
                    onChange={(e) => handleChange('tuningPendingDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.pianos.tuningPendingHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tuningUrgent">{t('alertSettings.pianos.tuningUrgent')}</Label>
                  <Input
                    id="tuningUrgent"
                    type="number"
                    min="1"
                    max="730"
                    value={formData.tuningUrgentDays || 270}
                    onChange={(e) => handleChange('tuningUrgentDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.pianos.tuningUrgentHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulationPending">{t('alertSettings.pianos.regulationPending')}</Label>
                  <Input
                    id="regulationPending"
                    type="number"
                    min="1"
                    max="1095"
                    value={formData.regulationPendingDays || 730}
                    onChange={(e) => handleChange('regulationPendingDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.pianos.regulationPendingHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulationUrgent">{t('alertSettings.pianos.regulationUrgent')}</Label>
                  <Input
                    id="regulationUrgent"
                    type="number"
                    min="1"
                    max="1825"
                    value={formData.regulationUrgentDays || 1095}
                    onChange={(e) => handleChange('regulationUrgentDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.pianos.regulationUrgentHelp')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CITAS */}
        <TabsContent value="citas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('alertSettings.appointments.title')}</CardTitle>
              <CardDescription>
                {t('alertSettings.appointments.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appointmentsNotice">{t('alertSettings.appointments.appointmentsNotice')}</Label>
                  <Input
                    id="appointmentsNotice"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.appointmentsNoticeDays || 7}
                    onChange={(e) => handleChange('appointmentsNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.appointments.appointmentsNoticeHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicesNotice">{t('alertSettings.appointments.servicesNotice')}</Label>
                  <Input
                    id="servicesNotice"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.scheduledServicesNoticeDays || 7}
                    onChange={(e) => handleChange('scheduledServicesNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.appointments.servicesNoticeHelp')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FINANZAS */}
        <TabsContent value="finanzas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('alertSettings.finances.title')}</CardTitle>
              <CardDescription>
                {t('alertSettings.finances.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoicesDue">{t('alertSettings.finances.invoicesDue')}</Label>
                  <Input
                    id="invoicesDue"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.invoicesDueNoticeDays || 7}
                    onChange={(e) => handleChange('invoicesDueNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.finances.invoicesDueHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overduePayments">{t('alertSettings.finances.overduePayments')}</Label>
                  <Input
                    id="overduePayments"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.overduePaymentsNoticeDays || 15}
                    onChange={(e) => handleChange('overduePaymentsNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.finances.overduePaymentsHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quotesExpiry">{t('alertSettings.finances.quotesExpiry')}</Label>
                  <Input
                    id="quotesExpiry"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.quotesExpiryNoticeDays || 7}
                    onChange={(e) => handleChange('quotesExpiryNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.finances.quotesExpiryHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractsRenewal">{t('alertSettings.finances.contractsRenewal')}</Label>
                  <Input
                    id="contractsRenewal"
                    type="number"
                    min="1"
                    max="90"
                    value={formData.contractsRenewalNoticeDays || 30}
                    onChange={(e) => handleChange('contractsRenewalNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.finances.contractsRenewalHelp')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INVENTARIO */}
        <TabsContent value="inventario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('alertSettings.inventory.title')}</CardTitle>
              <CardDescription>
                {t('alertSettings.inventory.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minStock">{t('alertSettings.inventory.minStock')}</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.inventoryMinStock || 5}
                    onChange={(e) => handleChange('inventoryMinStock', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.inventory.minStockHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventoryExpiry">{t('alertSettings.inventory.expiryNotice')}</Label>
                  <Input
                    id="inventoryExpiry"
                    type="number"
                    min="1"
                    max="90"
                    value={formData.inventoryExpiryNoticeDays || 30}
                    onChange={(e) => handleChange('inventoryExpiryNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.inventory.expiryNoticeHelp')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MANTENIMIENTO */}
        <TabsContent value="mantenimiento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('alertSettings.maintenance.title')}</CardTitle>
              <CardDescription>
                {t('alertSettings.maintenance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="toolsMaintenance">{t('alertSettings.maintenance.toolsMaintenance')}</Label>
                <Input
                  id="toolsMaintenance"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.toolsMaintenanceDays || 180}
                  onChange={(e) => handleChange('toolsMaintenanceDays', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  {t('alertSettings.maintenance.toolsMaintenanceHelp')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLIENTES */}
        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('alertSettings.clients.title')}</CardTitle>
              <CardDescription>
                {t('alertSettings.clients.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientFollowup">{t('alertSettings.clients.clientFollowup')}</Label>
                  <Input
                    id="clientFollowup"
                    type="number"
                    min="1"
                    max="180"
                    value={formData.clientFollowupDays || 90}
                    onChange={(e) => handleChange('clientFollowupDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.clients.clientFollowupHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientInactive">{t('alertSettings.clients.clientInactive')}</Label>
                  <Input
                    id="clientInactive"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.clientInactiveMonths || 12}
                    onChange={(e) => handleChange('clientInactiveMonths', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('alertSettings.clients.clientInactiveHelp')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICACIONES */}
        <TabsContent value="notificaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('alertSettings.notifications.title')}</CardTitle>
              <CardDescription>
                {t('alertSettings.notifications.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('alertSettings.notifications.emailNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('alertSettings.notifications.emailNotificationsHelp')}
                    </p>
                  </div>
                  <Switch
                    checked={formData.emailNotificationsEnabled}
                    onCheckedChange={(checked) => handleChange('emailNotificationsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('alertSettings.notifications.pushNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('alertSettings.notifications.pushNotificationsHelp')}
                    </p>
                  </div>
                  <Switch
                    checked={formData.pushNotificationsEnabled}
                    onCheckedChange={(checked) => handleChange('pushNotificationsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('alertSettings.notifications.weeklyDigest')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('alertSettings.notifications.weeklyDigestHelp')}
                    </p>
                  </div>
                  <Switch
                    checked={formData.weeklyDigestEnabled}
                    onCheckedChange={(checked) => handleChange('weeklyDigestEnabled', checked)}
                  />
                </div>

                {formData.weeklyDigestEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="digestDay">{t('alertSettings.notifications.digestDay')}</Label>
                    <select
                      id="digestDay"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={formData.weeklyDigestDay || 1}
                      onChange={(e) => handleChange('weeklyDigestDay', parseInt(e.target.value))}
                    >
                      <option value="0">{t('alertSettings.notifications.days.sunday')}</option>
                      <option value="1">{t('alertSettings.notifications.days.monday')}</option>
                      <option value="2">{t('alertSettings.notifications.days.tuesday')}</option>
                      <option value="3">{t('alertSettings.notifications.days.wednesday')}</option>
                      <option value="4">{t('alertSettings.notifications.days.thursday')}</option>
                      <option value="5">{t('alertSettings.notifications.days.friday')}</option>
                      <option value="6">{t('alertSettings.notifications.days.saturday')}</option>
                    </select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
