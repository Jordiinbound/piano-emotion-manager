/**
 * NodeConfigForms - Formularios de configuración para nodos de workflow
 * Piano Emotion Manager
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';

interface NodeConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeType: 'trigger' | 'condition' | 'action' | 'delay';
  initialConfig: any;
  onSave: (config: any) => void;
}

export function NodeConfigDialog({
  open,
  onOpenChange,
  nodeType,
  initialConfig,
  onSave,
}: NodeConfigDialogProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState(initialConfig || {});

  useEffect(() => {
    setConfig(initialConfig || {});
  }, [initialConfig, open]);

  const handleSave = () => {
    onSave(config);
    onOpenChange(false);
  };

  const renderForm = () => {
    switch (nodeType) {
      case 'trigger':
        return <TriggerConfigForm config={config} onChange={setConfig} />;
      case 'condition':
        return <ConditionConfigForm config={config} onChange={setConfig} />;
      case 'action':
        return <ActionConfigForm config={config} onChange={setConfig} />;
      case 'delay':
        return <DelayConfigForm config={config} onChange={setConfig} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (nodeType) {
      case 'trigger':
        return 'Configurar Trigger';
      case 'condition':
        return 'Configurar Condición';
      case 'action':
        return 'Configurar Acción';
      case 'delay':
        return 'Configurar Espera';
      default:
        return 'Configurar Nodo';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Configure los parámetros de este nodo
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {renderForm()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar Configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Formulario de Trigger
// ============================================
function TriggerConfigForm({ config, onChange }: any) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="triggerType">Tipo de Trigger</Label>
        <Select
          value={config.triggerType || 'manual'}
          onValueChange={(value) => updateConfig('triggerType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="client_created">Nuevo Cliente Creado</SelectItem>
            <SelectItem value="service_completed">Servicio Completado</SelectItem>
            <SelectItem value="invoice_due">Factura Vencida</SelectItem>
            <SelectItem value="appointment_created">Cita Creada</SelectItem>
            <SelectItem value="appointment_reminder">Recordatorio de Cita</SelectItem>
            <SelectItem value="payment_received">Pago Recibido</SelectItem>
            <SelectItem value="scheduled">Programado (Cron)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.triggerType === 'scheduled' && (
        <div>
          <Label htmlFor="cronExpression">Expresión Cron</Label>
          <Input
            id="cronExpression"
            value={config.cronExpression || ''}
            onChange={(e) => updateConfig('cronExpression', e.target.value)}
            placeholder="0 9 * * * (Cada día a las 9:00 AM)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Formato: segundo minuto hora día mes día-semana
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="triggerLabel">Etiqueta del Trigger</Label>
        <Input
          id="triggerLabel"
          value={config.label || ''}
          onChange={(e) => updateConfig('label', e.target.value)}
          placeholder="Ej: Cuando se crea un cliente"
        />
      </div>

      <div>
        <Label htmlFor="triggerDescription">Descripción</Label>
        <Textarea
          id="triggerDescription"
          value={config.description || ''}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Descripción detallada del trigger"
          rows={3}
        />
      </div>
    </div>
  );
}

// ============================================
// Formulario de Condición
// ============================================
function ConditionConfigForm({ config, onChange }: any) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="conditionLabel">Etiqueta de la Condición</Label>
        <Input
          id="conditionLabel"
          value={config.label || ''}
          onChange={(e) => updateConfig('label', e.target.value)}
          placeholder="Ej: ¿Cliente es nuevo?"
        />
      </div>

      <div>
        <Label htmlFor="field">Campo a Evaluar</Label>
        <Select
          value={config.field || ''}
          onValueChange={(value) => updateConfig('field', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar campo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client.type">Tipo de Cliente</SelectItem>
            <SelectItem value="client.status">Estado del Cliente</SelectItem>
            <SelectItem value="invoice.amount">Monto de Factura</SelectItem>
            <SelectItem value="invoice.status">Estado de Factura</SelectItem>
            <SelectItem value="service.type">Tipo de Servicio</SelectItem>
            <SelectItem value="appointment.date">Fecha de Cita</SelectItem>
            <SelectItem value="custom">Campo Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.field === 'custom' && (
        <div>
          <Label htmlFor="customField">Campo Personalizado</Label>
          <Input
            id="customField"
            value={config.customField || ''}
            onChange={(e) => updateConfig('customField', e.target.value)}
            placeholder="Ej: data.customProperty"
          />
        </div>
      )}

      <div>
        <Label htmlFor="operator">Operador</Label>
        <Select
          value={config.operator || 'equals'}
          onValueChange={(value) => updateConfig('operator', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar operador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Igual a (=)</SelectItem>
            <SelectItem value="not_equals">Diferente de (≠)</SelectItem>
            <SelectItem value="greater_than">Mayor que (&gt;)</SelectItem>
            <SelectItem value="less_than">Menor que (&lt;)</SelectItem>
            <SelectItem value="greater_or_equal">Mayor o igual (≥)</SelectItem>
            <SelectItem value="less_or_equal">Menor o igual (≤)</SelectItem>
            <SelectItem value="contains">Contiene</SelectItem>
            <SelectItem value="not_contains">No contiene</SelectItem>
            <SelectItem value="starts_with">Comienza con</SelectItem>
            <SelectItem value="ends_with">Termina con</SelectItem>
            <SelectItem value="is_empty">Está vacío</SelectItem>
            <SelectItem value="is_not_empty">No está vacío</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!['is_empty', 'is_not_empty'].includes(config.operator) && (
        <div>
          <Label htmlFor="value">Valor a Comparar</Label>
          <Input
            id="value"
            value={config.value || ''}
            onChange={(e) => updateConfig('value', e.target.value)}
            placeholder="Valor de comparación"
          />
        </div>
      )}

      <div>
        <Label htmlFor="conditionDescription">Descripción</Label>
        <Textarea
          id="conditionDescription"
          value={config.description || ''}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Descripción de la condición"
          rows={2}
        />
      </div>
    </div>
  );
}

// ============================================
// Formulario de Acción
// ============================================
function ActionConfigForm({ config, onChange }: any) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="actionType">Tipo de Acción</Label>
        <Select
          value={config.actionType || 'send_email'}
          onValueChange={(value) => updateConfig('actionType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="send_email">Enviar Email</SelectItem>
            <SelectItem value="send_whatsapp">Enviar WhatsApp</SelectItem>
            <SelectItem value="create_reminder">Crear Recordatorio</SelectItem>
            <SelectItem value="create_appointment">Crear Cita</SelectItem>
            <SelectItem value="update_status">Actualizar Estado</SelectItem>
            <SelectItem value="create_task">Crear Tarea</SelectItem>
            <SelectItem value="send_notification">Enviar Notificación</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.actionType === 'send_email' && (
        <>
          <div>
            <Label htmlFor="emailTo">Destinatario</Label>
            <Input
              id="emailTo"
              value={config.emailTo || ''}
              onChange={(e) => updateConfig('emailTo', e.target.value)}
              placeholder="email@ejemplo.com o {client.email}"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Puedes usar variables: {'{'}client.email{'}'}, {'{'}user.email{'}'}
            </p>
          </div>
          <div>
            <Label htmlFor="emailSubject">Asunto</Label>
            <Input
              id="emailSubject"
              value={config.emailSubject || ''}
              onChange={(e) => updateConfig('emailSubject', e.target.value)}
              placeholder="Asunto del email"
            />
          </div>
          <div>
            <Label htmlFor="emailTemplate">Plantilla de Email</Label>
            <Select
              value={config.emailTemplate || 'custom'}
              onValueChange={(value) => updateConfig('emailTemplate', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plantilla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Bienvenida</SelectItem>
                <SelectItem value="invoice_reminder">Recordatorio de Factura</SelectItem>
                <SelectItem value="appointment_confirmation">Confirmación de Cita</SelectItem>
                <SelectItem value="service_completed">Servicio Completado</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {config.emailTemplate === 'custom' && (
            <div>
              <Label htmlFor="emailBody">Cuerpo del Email</Label>
              <Textarea
                id="emailBody"
                value={config.emailBody || ''}
                onChange={(e) => updateConfig('emailBody', e.target.value)}
                placeholder="Contenido del email"
                rows={5}
              />
            </div>
          )}
        </>
      )}

      {config.actionType === 'send_whatsapp' && (
        <>
          <div>
            <Label htmlFor="whatsappPhone">Número de Teléfono</Label>
            <Input
              id="whatsappPhone"
              value={config.whatsappPhone || ''}
              onChange={(e) => updateConfig('whatsappPhone', e.target.value)}
              placeholder="+34612345678 o {client.phone}"
            />
          </div>
          <div>
            <Label htmlFor="whatsappMessage">Mensaje</Label>
            <Textarea
              id="whatsappMessage"
              value={config.whatsappMessage || ''}
              onChange={(e) => updateConfig('whatsappMessage', e.target.value)}
              placeholder="Mensaje de WhatsApp"
              rows={4}
            />
          </div>
        </>
      )}

      {config.actionType === 'create_reminder' && (
        <>
          <div>
            <Label htmlFor="reminderTitle">Título del Recordatorio</Label>
            <Input
              id="reminderTitle"
              value={config.reminderTitle || ''}
              onChange={(e) => updateConfig('reminderTitle', e.target.value)}
              placeholder="Título"
            />
          </div>
          <div>
            <Label htmlFor="reminderDate">Fecha y Hora</Label>
            <Input
              id="reminderDate"
              type="datetime-local"
              value={config.reminderDate || ''}
              onChange={(e) => updateConfig('reminderDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="reminderNotes">Notas</Label>
            <Textarea
              id="reminderNotes"
              value={config.reminderNotes || ''}
              onChange={(e) => updateConfig('reminderNotes', e.target.value)}
              placeholder="Notas adicionales"
              rows={3}
            />
          </div>
        </>
      )}

      {config.actionType === 'update_status' && (
        <>
          <div>
            <Label htmlFor="entityType">Tipo de Entidad</Label>
            <Select
              value={config.entityType || 'client'}
              onValueChange={(value) => updateConfig('entityType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="invoice">Factura</SelectItem>
                <SelectItem value="service">Servicio</SelectItem>
                <SelectItem value="appointment">Cita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="newStatus">Nuevo Estado</Label>
            <Input
              id="newStatus"
              value={config.newStatus || ''}
              onChange={(e) => updateConfig('newStatus', e.target.value)}
              placeholder="Estado nuevo"
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="actionLabel">Etiqueta de la Acción</Label>
        <Input
          id="actionLabel"
          value={config.label || ''}
          onChange={(e) => updateConfig('label', e.target.value)}
          placeholder="Ej: Enviar email de bienvenida"
        />
      </div>

      <div>
        <Label htmlFor="actionDescription">Descripción</Label>
        <Textarea
          id="actionDescription"
          value={config.description || ''}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Descripción de la acción"
          rows={2}
        />
      </div>
    </div>
  );
}

// ============================================
// Formulario de Delay
// ============================================
function DelayConfigForm({ config, onChange }: any) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="delayLabel">Etiqueta de la Espera</Label>
        <Input
          id="delayLabel"
          value={config.label || ''}
          onChange={(e) => updateConfig('label', e.target.value)}
          placeholder="Ej: Esperar 3 días"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duración</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={config.duration || ''}
            onChange={(e) => updateConfig('duration', parseInt(e.target.value))}
            placeholder="Cantidad"
          />
        </div>
        <div>
          <Label htmlFor="unit">Unidad</Label>
          <Select
            value={config.unit || 'minutes'}
            onValueChange={(value) => updateConfig('unit', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seconds">Segundos</SelectItem>
              <SelectItem value="minutes">Minutos</SelectItem>
              <SelectItem value="hours">Horas</SelectItem>
              <SelectItem value="days">Días</SelectItem>
              <SelectItem value="weeks">Semanas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="executionMode">Modo de Ejecución</Label>
        <Select
          value={config.executionMode || 'sync'}
          onValueChange={(value) => updateConfig('executionMode', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar modo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sync">Síncrono (delays cortos)</SelectItem>
            <SelectItem value="queue">Cola (delays largos - requiere configuración)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {config.executionMode === 'sync' 
            ? 'Recomendado para delays menores a 1 minuto'
            : 'Recomendado para delays de horas, días o semanas (requiere sistema de colas configurado)'}
        </p>
      </div>

      <div>
        <Label htmlFor="delayDescription">Descripción</Label>
        <Textarea
          id="delayDescription"
          value={config.description || ''}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Descripción de la espera"
          rows={2}
        />
      </div>
    </div>
  );
}
