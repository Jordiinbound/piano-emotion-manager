/**
 * Workflow Variables - Sistema de variables dinámicas para workflows
 * Piano Emotion Manager
 */

/**
 * Reemplaza variables en una cadena de texto con valores reales
 * Formato de variables: {entity.field} o {entity.nested.field}
 * Ejemplo: "Hola {client.name}, tu cita es el {appointment.date}"
 */
export function replaceVariables(template: string, data: any): string {
  if (!template || typeof template !== 'string') {
    return template;
  }

  // Regex para encontrar variables en formato {entity.field}
  const variableRegex = /\{([a-zA-Z0-9_.]+)\}/g;

  return template.replace(variableRegex, (match, path) => {
    try {
      // Dividir el path en partes (ej: "client.name" -> ["client", "name"])
      const parts = path.split('.');
      let value: any = data;

      // Navegar por el objeto usando el path
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          // Si no se encuentra la variable, devolver el placeholder original
          return match;
        }
      }

      // Convertir el valor a string
      if (value === null || value === undefined) {
        return '';
      }

      // Si es un objeto Date, formatearlo
      if (value instanceof Date) {
        return value.toLocaleString('es-ES');
      }

      // Si es un objeto, convertirlo a JSON
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      return String(value);
    } catch (error) {
      console.error('[Variables] Error al reemplazar variable:', path, error);
      return match;
    }
  });
}

/**
 * Extrae todas las variables de un template
 * Retorna un array de paths de variables
 */
export function extractVariables(template: string): string[] {
  if (!template || typeof template !== 'string') {
    return [];
  }

  const variableRegex = /\{([a-zA-Z0-9_.]+)\}/g;
  const variables: string[] = [];
  let match;

  while ((match = variableRegex.exec(template)) !== null) {
    variables.push(match[1]);
  }

  return [...new Set(variables)]; // Eliminar duplicados
}

/**
 * Valida que todas las variables requeridas estén presentes en los datos
 */
export function validateVariables(template: string, data: any): { valid: boolean; missing: string[] } {
  const variables = extractVariables(template);
  const missing: string[] = [];

  for (const variable of variables) {
    const parts = variable.split('.');
    let value: any = data;
    let found = true;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        found = false;
        break;
      }
    }

    if (!found) {
      missing.push(variable);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Obtiene el valor de una variable específica de los datos
 */
export function getVariableValue(path: string, data: any): any {
  const parts = path.split('.');
  let value: any = data;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Obtiene variables disponibles según el tipo de trigger
 */
export function getAvailableVariables(triggerType: string): Record<string, string[]> {
  const commonVariables = {
    workflow: ['id', 'name', 'createdAt', 'status'],
    user: ['id', 'name', 'email', 'role']
  };

  switch (triggerType) {
    case 'client_created':
      return {
        ...commonVariables,
        client: [
          'id',
          'name',
          'email',
          'phone',
          'address',
          'city',
          'postalCode',
          'notes',
          'createdAt'
        ]
      };

    case 'appointment_created':
      return {
        ...commonVariables,
        appointment: [
          'id',
          'clientId',
          'pianoId',
          'date',
          'time',
          'type',
          'status',
          'notes',
          'createdAt'
        ],
        client: ['id', 'name', 'email', 'phone'],
        piano: ['id', 'brand', 'model', 'serialNumber']
      };

    case 'service_completed':
      return {
        ...commonVariables,
        service: [
          'id',
          'clientId',
          'pianoId',
          'type',
          'date',
          'cost',
          'notes',
          'status',
          'createdAt'
        ],
        client: ['id', 'name', 'email', 'phone'],
        piano: ['id', 'brand', 'model', 'serialNumber']
      };

    case 'invoice_due':
      return {
        ...commonVariables,
        invoice: [
          'id',
          'clientId',
          'number',
          'amount',
          'dueDate',
          'status',
          'notes',
          'createdAt'
        ],
        client: ['id', 'name', 'email', 'phone', 'address']
      };

    case 'manual':
    default:
      return commonVariables;
  }
}

/**
 * Formatea variables para mostrar en UI
 */
export function formatVariableForDisplay(variable: string): string {
  const parts = variable.split('.');
  const entity = parts[0];
  const field = parts.slice(1).join('.');

  const entityNames: Record<string, string> = {
    client: 'Cliente',
    appointment: 'Cita',
    service: 'Servicio',
    invoice: 'Factura',
    piano: 'Piano',
    user: 'Usuario',
    workflow: 'Workflow'
  };

  const fieldNames: Record<string, string> = {
    id: 'ID',
    name: 'Nombre',
    email: 'Email',
    phone: 'Teléfono',
    address: 'Dirección',
    city: 'Ciudad',
    postalCode: 'Código Postal',
    notes: 'Notas',
    date: 'Fecha',
    time: 'Hora',
    type: 'Tipo',
    status: 'Estado',
    cost: 'Costo',
    amount: 'Monto',
    dueDate: 'Fecha de Vencimiento',
    number: 'Número',
    brand: 'Marca',
    model: 'Modelo',
    serialNumber: 'Número de Serie',
    createdAt: 'Fecha de Creación',
    clientId: 'ID de Cliente',
    pianoId: 'ID de Piano',
    role: 'Rol'
  };

  const entityName = entityNames[entity] || entity;
  const fieldName = fieldNames[field] || field;

  return `${entityName} - ${fieldName}`;
}
