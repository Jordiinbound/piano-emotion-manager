/**
 * Variable Selector Component
 * Piano Emotion Manager
 * 
 * Selector de variables dinámicas para workflows
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Braces, Search } from 'lucide-react';

interface Variable {
  key: string;
  label: string;
  description: string;
  category: string;
}

interface VariableSelectorProps {
  triggerType?: string;
  onSelectVariable: (variable: string) => void;
}

// Variables disponibles según el tipo de trigger
const VARIABLES_BY_TRIGGER: Record<string, Variable[]> = {
  client_created: [
    { key: 'client_name', label: 'Nombre del Cliente', description: 'Nombre completo del cliente', category: 'Cliente' },
    { key: 'client_email', label: 'Email del Cliente', description: 'Dirección de correo electrónico', category: 'Cliente' },
    { key: 'client_phone', label: 'Teléfono del Cliente', description: 'Número de teléfono', category: 'Cliente' },
    { key: 'client_address', label: 'Dirección del Cliente', description: 'Dirección completa', category: 'Cliente' },
    { key: 'created_date', label: 'Fecha de Creación', description: 'Fecha en que se creó el cliente', category: 'Sistema' },
  ],
  appointment_created: [
    { key: 'client_name', label: 'Nombre del Cliente', description: 'Nombre completo del cliente', category: 'Cliente' },
    { key: 'client_email', label: 'Email del Cliente', description: 'Dirección de correo electrónico', category: 'Cliente' },
    { key: 'client_phone', label: 'Teléfono del Cliente', description: 'Número de teléfono', category: 'Cliente' },
    { key: 'appointment_date', label: 'Fecha de la Cita', description: 'Fecha programada para la cita', category: 'Cita' },
    { key: 'appointment_time', label: 'Hora de la Cita', description: 'Hora programada para la cita', category: 'Cita' },
    { key: 'service_type', label: 'Tipo de Servicio', description: 'Tipo de servicio a realizar', category: 'Servicio' },
    { key: 'piano_model', label: 'Modelo del Piano', description: 'Marca y modelo del piano', category: 'Piano' },
  ],
  service_completed: [
    { key: 'client_name', label: 'Nombre del Cliente', description: 'Nombre completo del cliente', category: 'Cliente' },
    { key: 'client_email', label: 'Email del Cliente', description: 'Dirección de correo electrónico', category: 'Cliente' },
    { key: 'service_type', label: 'Tipo de Servicio', description: 'Tipo de servicio realizado', category: 'Servicio' },
    { key: 'service_date', label: 'Fecha del Servicio', description: 'Fecha en que se realizó el servicio', category: 'Servicio' },
    { key: 'technician_name', label: 'Nombre del Técnico', description: 'Técnico que realizó el servicio', category: 'Servicio' },
    { key: 'piano_model', label: 'Modelo del Piano', description: 'Marca y modelo del piano', category: 'Piano' },
    { key: 'service_notes', label: 'Notas del Servicio', description: 'Observaciones del servicio', category: 'Servicio' },
  ],
  invoice_created: [
    { key: 'client_name', label: 'Nombre del Cliente', description: 'Nombre completo del cliente', category: 'Cliente' },
    { key: 'client_email', label: 'Email del Cliente', description: 'Dirección de correo electrónico', category: 'Cliente' },
    { key: 'invoice_number', label: 'Número de Factura', description: 'Número de la factura', category: 'Factura' },
    { key: 'invoice_amount', label: 'Importe de la Factura', description: 'Importe total de la factura', category: 'Factura' },
    { key: 'invoice_date', label: 'Fecha de la Factura', description: 'Fecha de emisión', category: 'Factura' },
    { key: 'due_date', label: 'Fecha de Vencimiento', description: 'Fecha límite de pago', category: 'Factura' },
  ],
  manual: [
    { key: 'current_date', label: 'Fecha Actual', description: 'Fecha de hoy', category: 'Sistema' },
    { key: 'current_time', label: 'Hora Actual', description: 'Hora actual', category: 'Sistema' },
    { key: 'user_name', label: 'Nombre del Usuario', description: 'Usuario que ejecuta el workflow', category: 'Sistema' },
  ],
};

export default function VariableSelector({ triggerType = 'manual', onSelectVariable }: VariableSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const availableVariables = VARIABLES_BY_TRIGGER[triggerType] || VARIABLES_BY_TRIGGER.manual;

  const filteredVariables = availableVariables.filter(
    (variable) =>
      variable.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variable.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variable.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectVariable = (variableKey: string) => {
    onSelectVariable(`{{${variableKey}}}`);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Agrupar variables por categoría
  const groupedVariables = filteredVariables.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {} as Record<string, Variable[]>);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Braces className="h-4 w-4" />
          Insertar Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {Object.keys(groupedVariables).length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No se encontraron variables
            </div>
          ) : (
            Object.entries(groupedVariables).map(([category, variables]) => (
              <div key={category} className="mb-4">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category}
                </div>
                <div className="space-y-1">
                  {variables.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => handleSelectVariable(variable.key)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{variable.label}</span>
                        <Badge variant="secondary" className="text-xs font-mono">
                          {`{{${variable.key}}}`}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{variable.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t bg-muted/50">
          <p className="text-xs text-muted-foreground">
            Las variables se reemplazarán automáticamente con los valores reales al ejecutar el workflow.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
