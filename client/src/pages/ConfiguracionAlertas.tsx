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

export default function ConfiguracionAlertas() {
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
      toast.success('Configuración guardada correctamente');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Error al guardar configuración');
    },
  });

  const resetMutation = trpc.alertSettings.resetSettings.useMutation({
    onSuccess: () => {
      toast.success('Configuración restablecida a valores por defecto');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Error al restablecer configuración');
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres restablecer la configuración a los valores por defecto?')) {
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
          <h1 className="text-3xl font-bold tracking-tight">Configuración de Alertas</h1>
          <p className="text-muted-foreground mt-2">
            Personaliza los umbrales y preferencias de tus alertas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={resetMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pianos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="pianos">
            <Music className="h-4 w-4 mr-2" />
            Pianos
          </TabsTrigger>
          <TabsTrigger value="citas">
            <Calendar className="h-4 w-4 mr-2" />
            Citas
          </TabsTrigger>
          <TabsTrigger value="finanzas">
            <DollarSign className="h-4 w-4 mr-2" />
            Finanzas
          </TabsTrigger>
          <TabsTrigger value="inventario">
            <Package className="h-4 w-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="mantenimiento">
            <Wrench className="h-4 w-4 mr-2" />
            Mantenimiento
          </TabsTrigger>
          <TabsTrigger value="clientes">
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="notificaciones">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        {/* PIANOS */}
        <TabsContent value="pianos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Umbrales de Mantenimiento de Pianos</CardTitle>
              <CardDescription>
                Configura cuándo recibir alertas sobre afinaciones y regulaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tuningPending">Afinación Pendiente (días)</Label>
                  <Input
                    id="tuningPending"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.tuningPendingDays || 180}
                    onChange={(e) => handleChange('tuningPendingDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días sin afinación para generar alerta pendiente
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tuningUrgent">Afinación Urgente (días)</Label>
                  <Input
                    id="tuningUrgent"
                    type="number"
                    min="1"
                    max="730"
                    value={formData.tuningUrgentDays || 270}
                    onChange={(e) => handleChange('tuningUrgentDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días sin afinación para generar alerta urgente
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulationPending">Regulación Pendiente (días)</Label>
                  <Input
                    id="regulationPending"
                    type="number"
                    min="1"
                    max="1095"
                    value={formData.regulationPendingDays || 730}
                    onChange={(e) => handleChange('regulationPendingDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días sin regulación para generar alerta pendiente
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulationUrgent">Regulación Urgente (días)</Label>
                  <Input
                    id="regulationUrgent"
                    type="number"
                    min="1"
                    max="1825"
                    value={formData.regulationUrgentDays || 1095}
                    onChange={(e) => handleChange('regulationUrgentDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días sin regulación para generar alerta urgente
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
              <CardTitle>Recordatorios de Citas y Servicios</CardTitle>
              <CardDescription>
                Configura cuándo recibir recordatorios de citas programadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appointmentsNotice">Aviso de Citas (días)</Label>
                  <Input
                    id="appointmentsNotice"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.appointmentsNoticeDays || 7}
                    onChange={(e) => handleChange('appointmentsNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días de anticipación para recordar citas próximas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicesNotice">Aviso de Servicios (días)</Label>
                  <Input
                    id="servicesNotice"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.scheduledServicesNoticeDays || 7}
                    onChange={(e) => handleChange('scheduledServicesNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días de anticipación para recordar servicios programados
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
              <CardTitle>Alertas Financieras</CardTitle>
              <CardDescription>
                Configura recordatorios de facturas, presupuestos y pagos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoicesDue">Facturas por Vencer (días)</Label>
                  <Input
                    id="invoicesDue"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.invoicesDueNoticeDays || 7}
                    onChange={(e) => handleChange('invoicesDueNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días antes del vencimiento para alertar
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overduePayments">Pagos Vencidos (días)</Label>
                  <Input
                    id="overduePayments"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.overduePaymentsNoticeDays || 15}
                    onChange={(e) => handleChange('overduePaymentsNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días después del vencimiento para seguimiento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quotesExpiry">Presupuestos por Expirar (días)</Label>
                  <Input
                    id="quotesExpiry"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.quotesExpiryNoticeDays || 7}
                    onChange={(e) => handleChange('quotesExpiryNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días antes de la expiración del presupuesto
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractsRenewal">Renovación de Contratos (días)</Label>
                  <Input
                    id="contractsRenewal"
                    type="number"
                    min="1"
                    max="90"
                    value={formData.contractsRenewalNoticeDays || 30}
                    onChange={(e) => handleChange('contractsRenewalNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días antes de la renovación del contrato
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
              <CardTitle>Alertas de Inventario</CardTitle>
              <CardDescription>
                Configura alertas de stock mínimo y productos por expirar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minStock">Stock Mínimo (unidades)</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.inventoryMinStock || 5}
                    onChange={(e) => handleChange('inventoryMinStock', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cantidad mínima antes de generar alerta
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventoryExpiry">Productos por Expirar (días)</Label>
                  <Input
                    id="inventoryExpiry"
                    type="number"
                    min="1"
                    max="90"
                    value={formData.inventoryExpiryNoticeDays || 30}
                    onChange={(e) => handleChange('inventoryExpiryNoticeDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días antes de la fecha de expiración
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
              <CardTitle>Mantenimiento de Herramientas</CardTitle>
              <CardDescription>
                Configura recordatorios de mantenimiento de herramientas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="toolsMaintenance">Mantenimiento de Herramientas (días)</Label>
                <Input
                  id="toolsMaintenance"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.toolsMaintenanceDays || 180}
                  onChange={(e) => handleChange('toolsMaintenanceDays', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Días entre mantenimientos de herramientas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLIENTES */}
        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seguimiento de Clientes</CardTitle>
              <CardDescription>
                Configura recordatorios de seguimiento y clientes inactivos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientFollowup">Seguimiento de Clientes (días)</Label>
                  <Input
                    id="clientFollowup"
                    type="number"
                    min="1"
                    max="180"
                    value={formData.clientFollowupDays || 90}
                    onChange={(e) => handleChange('clientFollowupDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días sin contacto para recordar seguimiento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientInactive">Clientes Inactivos (meses)</Label>
                  <Input
                    id="clientInactive"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.clientInactiveMonths || 12}
                    onChange={(e) => handleChange('clientInactiveMonths', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Meses sin actividad para marcar como inactivo
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
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir alertas por correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={formData.emailNotificationsEnabled}
                    onCheckedChange={(checked) => handleChange('emailNotificationsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones en el navegador
                    </p>
                  </div>
                  <Switch
                    checked={formData.pushNotificationsEnabled}
                    onCheckedChange={(checked) => handleChange('pushNotificationsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resumen Semanal</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir un resumen semanal de alertas
                    </p>
                  </div>
                  <Switch
                    checked={formData.weeklyDigestEnabled}
                    onCheckedChange={(checked) => handleChange('weeklyDigestEnabled', checked)}
                  />
                </div>

                {formData.weeklyDigestEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="digestDay">Día del Resumen Semanal</Label>
                    <select
                      id="digestDay"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={formData.weeklyDigestDay || 1}
                      onChange={(e) => handleChange('weeklyDigestDay', parseInt(e.target.value))}
                    >
                      <option value="0">Domingo</option>
                      <option value="1">Lunes</option>
                      <option value="2">Martes</option>
                      <option value="3">Miércoles</option>
                      <option value="4">Jueves</option>
                      <option value="5">Viernes</option>
                      <option value="6">Sábado</option>
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
