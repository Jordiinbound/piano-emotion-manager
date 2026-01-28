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

export function LicenseReminders() {
  const [sending, setSending] = useState(false);
  
  const { data: summary, isLoading, refetch } = trpc.licenseReminders.getRemindersSummary.useQuery();
  const sendRemindersMutation = trpc.licenseReminders.checkAndSendReminders.useMutation();

  const handleSendReminders = async () => {
    setSending(true);
    try {
      const result = await sendRemindersMutation.mutateAsync();
      toast.success(`Se enviaron ${result.remindersSent} recordatorios al owner`);
      refetch();
    } catch (error: any) {
      toast.error("Error al enviar recordatorios: " + error.message);
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
          <h1 className="text-3xl font-bold">Recordatorios de Licencias</h1>
          <p className="text-muted-foreground mt-2">
            Sistema automático de notificaciones para licencias próximas a expirar
          </p>
        </div>
        <Button 
          onClick={handleSendReminders} 
          disabled={sending || totalReminders === 0}
          size="lg"
        >
          <Send className="mr-2 h-4 w-4" />
          {sending ? "Enviando..." : "Enviar Recordatorios"}
        </Button>
      </div>

      {/* Alert Info */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertTitle>Sistema de Recordatorios Automáticos</AlertTitle>
        <AlertDescription>
          Este sistema envía notificaciones al owner cuando las licencias están próximas a expirar.
          Los recordatorios se envían a 30, 15 y 7 días antes de la expiración.
          Las notificaciones se entregan directamente en la app del owner.
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
                Licencias expirando en {item.days} días
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
              <p className="text-center text-muted-foreground">Cargando recordatorios...</p>
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
                  Licencias expirando en {item.label}
                </CardTitle>
                <CardDescription>
                  Estas licencias necesitan recordatorio de renovación
                </CardDescription>
              </CardHeader>
              <CardContent>
                {item.licenses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Licencia</TableHead>
                        <TableHead>ID Usuario</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Fecha Expiración</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.licenses.map((license) => (
                        <TableRow key={license.id}>
                          <TableCell className="font-medium">#{license.id}</TableCell>
                          <TableCell>Usuario #{license.userId}</TableCell>
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
                              {item.days === 7 ? "Urgente" : "Pendiente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No hay licencias expirando en {item.days} días
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
                <p className="text-lg font-medium">No hay recordatorios pendientes</p>
                <p className="text-sm text-muted-foreground">
                  Todas las licencias están al día o no hay licencias próximas a expirar
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Cómo funciona el sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-1">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Notificaciones Automáticas</p>
              <p className="text-sm text-muted-foreground">
                El sistema verifica diariamente las licencias y envía recordatorios automáticos al owner
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-1">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Múltiples Recordatorios</p>
              <p className="text-sm text-muted-foreground">
                Se envían 3 recordatorios: a 30, 15 y 7 días antes de la expiración
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-1">
              <AlertCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Información Detallada</p>
              <p className="text-sm text-muted-foreground">
                Cada notificación incluye datos del usuario, tipo de licencia, precio y fecha de expiración
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
