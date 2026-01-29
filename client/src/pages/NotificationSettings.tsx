/**
 * NotificationSettings - Configuración de preferencias de notificaciones
 * Piano Emotion Manager
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Bell, Volume2, Vibrate, Mail, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function NotificationSettings() {
  const { user } = useAuth();
  // toast importado de sonner
  const [isSaving, setIsSaving] = useState(false);

  // Query para obtener preferencias actuales
  const { data: preferences, isLoading, refetch } = trpc.auth.getNotificationPreferences.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Mutation para actualizar preferencias
  const updatePreferencesMutation = trpc.auth.updateNotificationPreferences.useMutation({
    onSuccess: () => {
      toast.success('Configuración guardada', {
        description: 'Tus preferencias de notificaciones han sido actualizadas.',
      });
      refetch();
      setIsSaving(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setIsSaving(false);
    },
  });

  const [localPreferences, setLocalPreferences] = useState({
    notificationSound: preferences?.notificationSound ?? true,
    notificationVibration: preferences?.notificationVibration ?? true,
    notificationApprovalPending: preferences?.notificationApprovalPending ?? true,
    notificationWorkflowCompleted: preferences?.notificationWorkflowCompleted ?? true,
    notificationWorkflowFailed: preferences?.notificationWorkflowFailed ?? true,
    notificationSystem: preferences?.notificationSystem ?? true,
    notificationEmailEnabled: preferences?.notificationEmailEnabled ?? true,
  });

  // Actualizar preferencias locales cuando se cargan del servidor
  useState(() => {
    if (preferences) {
      setLocalPreferences({
        notificationSound: !!preferences.notificationSound,
        notificationVibration: !!preferences.notificationVibration,
        notificationApprovalPending: !!preferences.notificationApprovalPending,
        notificationWorkflowCompleted: !!preferences.notificationWorkflowCompleted,
        notificationWorkflowFailed: !!preferences.notificationWorkflowFailed,
        notificationSystem: !!preferences.notificationSystem,
        notificationEmailEnabled: !!preferences.notificationEmailEnabled,
      });
    }
  });

  const handleToggle = (key: keyof typeof localPreferences) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    updatePreferencesMutation.mutate(localPreferences);
  };

  const hasChanges = preferences && (
    localPreferences.notificationSound !== !!preferences.notificationSound ||
    localPreferences.notificationVibration !== !!preferences.notificationVibration ||
    localPreferences.notificationApprovalPending !== !!preferences.notificationApprovalPending ||
    localPreferences.notificationWorkflowCompleted !== !!preferences.notificationWorkflowCompleted ||
    localPreferences.notificationWorkflowFailed !== !!preferences.notificationWorkflowFailed ||
    localPreferences.notificationSystem !== !!preferences.notificationSystem ||
    localPreferences.notificationEmailEnabled !== !!preferences.notificationEmailEnabled
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bell className="h-12 w-12 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando preferencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración de Notificaciones</h1>
        <p className="text-muted-foreground mt-2">
          Personaliza cómo y cuándo recibes notificaciones
        </p>
      </div>

      {/* Métodos de notificación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Métodos de Notificación
          </CardTitle>
          <CardDescription>
            Elige cómo quieres recibir las notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Sonido
              </Label>
              <p className="text-sm text-muted-foreground">
                Reproducir un sonido al recibir notificaciones
              </p>
            </div>
            <Switch
              id="sound"
              checked={localPreferences.notificationSound}
              onCheckedChange={() => handleToggle('notificationSound')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vibration" className="flex items-center gap-2">
                <Vibrate className="h-4 w-4" />
                Vibración
              </Label>
              <p className="text-sm text-muted-foreground">
                Vibrar el dispositivo al recibir notificaciones (solo móviles)
              </p>
            </div>
            <Switch
              id="vibration"
              checked={localPreferences.notificationVibration}
              onCheckedChange={() => handleToggle('notificationVibration')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Notificaciones por Email
              </Label>
              <p className="text-sm text-muted-foreground">
                Enviar email para aprobaciones críticas no atendidas en 24 horas
              </p>
            </div>
            <Switch
              id="email"
              checked={localPreferences.notificationEmailEnabled}
              onCheckedChange={() => handleToggle('notificationEmailEnabled')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tipos de notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Tipos de Notificaciones
          </CardTitle>
          <CardDescription>
            Selecciona qué tipos de notificaciones quieres recibir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="approval" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                Aprobaciones Pendientes
              </Label>
              <p className="text-sm text-muted-foreground">
                Workflows que requieren tu aprobación para continuar
              </p>
            </div>
            <Switch
              id="approval"
              checked={localPreferences.notificationApprovalPending}
              onCheckedChange={() => handleToggle('notificationApprovalPending')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="completed" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Workflows Completados
              </Label>
              <p className="text-sm text-muted-foreground">
                Workflows que se han ejecutado exitosamente
              </p>
            </div>
            <Switch
              id="completed"
              checked={localPreferences.notificationWorkflowCompleted}
              onCheckedChange={() => handleToggle('notificationWorkflowCompleted')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="failed" className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Workflows Fallidos
              </Label>
              <p className="text-sm text-muted-foreground">
                Workflows que han encontrado errores durante su ejecución
              </p>
            </div>
            <Switch
              id="failed"
              checked={localPreferences.notificationWorkflowFailed}
              onCheckedChange={() => handleToggle('notificationWorkflowFailed')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system" className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Notificaciones del Sistema
              </Label>
              <p className="text-sm text-muted-foreground">
                Actualizaciones y mensajes importantes del sistema
              </p>
            </div>
            <Switch
              id="system"
              checked={localPreferences.notificationSystem}
              onCheckedChange={() => handleToggle('notificationSystem')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botón de guardar */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => setLocalPreferences({
            notificationSound: !!preferences?.notificationSound,
            notificationVibration: !!preferences?.notificationVibration,
            notificationApprovalPending: !!preferences?.notificationApprovalPending,
            notificationWorkflowCompleted: !!preferences?.notificationWorkflowCompleted,
            notificationWorkflowFailed: !!preferences?.notificationWorkflowFailed,
            notificationSystem: !!preferences?.notificationSystem,
            notificationEmailEnabled: !!preferences?.notificationEmailEnabled,
          })}
          disabled={!hasChanges || isSaving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
