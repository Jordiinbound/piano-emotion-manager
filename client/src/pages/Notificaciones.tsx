import { useState } from 'react';
import { Bell, MessageCircle, Calendar, CreditCard, Wrench, Send, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Notificaciones() {
  const [activeTab, setActiveTab] = useState<'all' | 'appointments' | 'payments' | 'maintenance'>('all');

  // Obtener todos los recordatorios pendientes
  const { data: allReminders, isLoading: loadingAll, refetch: refetchAll } = 
    trpc.whatsappNotifications.getAllPendingReminders.useQuery();

  // Obtener recordatorios de citas (próximas 24 horas)
  const { data: appointmentReminders, isLoading: loadingAppointments, refetch: refetchAppointments } = 
    trpc.whatsappNotifications.getUpcomingAppointmentReminders.useQuery({ daysAhead: 1 });

  // Obtener recordatorios de pagos vencidos
  const { data: paymentReminders, isLoading: loadingPayments, refetch: refetchPayments } = 
    trpc.whatsappNotifications.getOverduePaymentReminders.useQuery({ minDaysOverdue: 1 });

  // Obtener recordatorios de mantenimiento (6 meses)
  const { data: maintenanceReminders, isLoading: loadingMaintenance, refetch: refetchMaintenance } = 
    trpc.whatsappNotifications.getMaintenanceReminders.useQuery({ daysSinceLastService: 180 });

  const handleSendWhatsApp = (url: string, clientName: string) => {
    window.open(url, '_blank');
    toast.success(`Mensaje para ${clientName} listo para enviar`);
  };

  const handleSendAll = (reminders: { whatsappUrl: string; clientName: string }[]) => {
    if (reminders.length === 0) {
      toast.error('No hay recordatorios pendientes para enviar');
      return;
    }

    // Abrir todas las URLs de WhatsApp (limitado a 5 para no saturar)
    const limit = Math.min(reminders.length, 5);
    reminders.slice(0, limit).forEach((reminder, index) => {
      setTimeout(() => {
        window.open(reminder.whatsappUrl, '_blank');
      }, index * 500); // Delay de 500ms entre cada apertura
    });

    const message = reminders.length > 5 
      ? `Se abrieron los primeros 5 de ${reminders.length} recordatorios`
      : `Se abrieron ${limit} conversaciones de WhatsApp`;
    toast.success(message);
  };

  const isLoading = loadingAll || loadingAppointments || loadingPayments || loadingMaintenance;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            Panel de Notificaciones
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona y envía recordatorios automáticos por WhatsApp
          </p>
        </div>
        
        {/* Resumen de recordatorios */}
        <div className="flex gap-4">
          <Card className="min-w-[120px]">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {allReminders?.total || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs de categorías */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Todos
            {allReminders && (
              <Badge variant="secondary" className="ml-1">
                {allReminders.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Citas
            {appointmentReminders && (
              <Badge variant="secondary" className="ml-1">
                {appointmentReminders.count}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pagos
            {paymentReminders && (
              <Badge variant="secondary" className="ml-1">
                {paymentReminders.count}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Mantenimiento
            {maintenanceReminders && (
              <Badge variant="secondary" className="ml-1">
                {maintenanceReminders.count}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Todos los recordatorios */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Todos los Recordatorios Pendientes</CardTitle>
                  <CardDescription>
                    Vista consolidada de citas y pagos pendientes
                  </CardDescription>
                </div>
                {allReminders && allReminders.total > 0 && (
                  <Button
                    onClick={() => handleSendAll([
                      ...allReminders.appointments.reminders,
                      ...allReminders.payments.reminders,
                    ])}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Todos (máx. 5)
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : allReminders && allReminders.total > 0 ? (
                <div className="space-y-4">
                  {/* Recordatorios de citas */}
                  {allReminders.appointments.count > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Citas Próximas ({allReminders.appointments.count})
                      </h3>
                      <div className="grid gap-3">
                        {allReminders.appointments.reminders.map((reminder, index) => (
                          <Card key={`apt-${index}`} className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">
                                    {reminder.clientName}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {reminder.phoneNumber}
                                  </div>
                                  <Badge variant="outline" className="mt-2">
                                    Cita mañana
                                  </Badge>
                                </div>
                                <Button
                                  onClick={() => handleSendWhatsApp(reminder.whatsappUrl, reminder.clientName)}
                                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Enviar WhatsApp
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recordatorios de pagos */}
                  {allReminders.payments.count > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                        Pagos Vencidos ({allReminders.payments.count})
                      </h3>
                      <div className="grid gap-3">
                        {allReminders.payments.reminders.map((reminder, index) => (
                          <Card key={`pay-${index}`} className="border-l-4 border-l-orange-500">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">
                                    {reminder.clientName}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {reminder.phoneNumber}
                                  </div>
                                  <Badge variant="destructive" className="mt-2">
                                    Pago vencido
                                  </Badge>
                                </div>
                                <Button
                                  onClick={() => handleSendWhatsApp(reminder.whatsappUrl, reminder.clientName)}
                                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Enviar WhatsApp
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No hay recordatorios pendientes</p>
                  <p className="text-sm mt-2">Todos los recordatorios están al día</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Citas */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recordatorios de Citas</CardTitle>
                  <CardDescription>
                    Citas programadas para mañana que necesitan confirmación
                  </CardDescription>
                </div>
                {appointmentReminders && appointmentReminders.count > 0 && (
                  <Button
                    onClick={() => handleSendAll(appointmentReminders.reminders)}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Todos (máx. 5)
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : appointmentReminders && appointmentReminders.count > 0 ? (
                <div className="grid gap-3">
                  {appointmentReminders.reminders.map((reminder, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {reminder.clientName}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {reminder.phoneNumber}
                            </div>
                            <Badge variant="outline" className="mt-2">
                              Cita mañana
                            </Badge>
                          </div>
                          <Button
                            onClick={() => handleSendWhatsApp(reminder.whatsappUrl, reminder.clientName)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Enviar WhatsApp
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No hay citas para mañana</p>
                  <p className="text-sm mt-2">No hay recordatorios de citas pendientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pagos */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recordatorios de Pagos</CardTitle>
                  <CardDescription>
                    Facturas vencidas que requieren seguimiento
                  </CardDescription>
                </div>
                {paymentReminders && paymentReminders.count > 0 && (
                  <Button
                    onClick={() => handleSendAll(paymentReminders.reminders)}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Todos (máx. 5)
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingPayments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                </div>
              ) : paymentReminders && paymentReminders.count > 0 ? (
                <div className="grid gap-3">
                  {paymentReminders.reminders.map((reminder, index) => (
                    <Card key={index} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {reminder.clientName}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {reminder.phoneNumber}
                            </div>
                            <Badge variant="destructive" className="mt-2">
                              Pago vencido
                            </Badge>
                          </div>
                          <Button
                            onClick={() => handleSendWhatsApp(reminder.whatsappUrl, reminder.clientName)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Enviar WhatsApp
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No hay pagos vencidos</p>
                  <p className="text-sm mt-2">Todos los pagos están al día</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Mantenimiento */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recordatorios de Mantenimiento</CardTitle>
                  <CardDescription>
                    Pianos que necesitan afinación o revisión (más de 6 meses)
                  </CardDescription>
                </div>
                {maintenanceReminders && maintenanceReminders.count > 0 && (
                  <Button
                    onClick={() => handleSendAll(maintenanceReminders.reminders)}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Todos (máx. 5)
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingMaintenance ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : maintenanceReminders && maintenanceReminders.count > 0 ? (
                <div className="grid gap-3">
                  {maintenanceReminders.reminders.map((reminder, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {reminder.clientName}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {reminder.phoneNumber}
                            </div>
                            <Badge variant="outline" className="mt-2 border-purple-500 text-purple-700">
                              Mantenimiento requerido
                            </Badge>
                          </div>
                          <Button
                            onClick={() => handleSendWhatsApp(reminder.whatsappUrl, reminder.clientName)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Enviar WhatsApp
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No hay pianos pendientes de mantenimiento</p>
                  <p className="text-sm mt-2">Todos los pianos están al día con su mantenimiento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
