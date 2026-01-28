/**
 * Marketing Service
 * Servicio para gestión de campañas de marketing, plantillas de mensajes y envíos masivos
 */

/**
 * Tipos de plantillas de mensajes disponibles
 */
export const messageTemplateTypes = [
  'appointment_reminder',      // Recordatorio de cita
  'service_completed',         // Servicio completado
  'maintenance_reminder',      // Recordatorio de mantenimiento
  'invoice_sent',              // Factura enviada
  'welcome',                   // Bienvenida a nuevo cliente
  'birthday',                  // Felicitación de cumpleaños
  'promotion',                 // Promoción/Oferta
  'follow_up',                 // Seguimiento post-servicio
  'reactivation',              // Reactivación de cliente inactivo
  'custom',                    // Mensaje personalizado
] as const;

export type MessageTemplateType = typeof messageTemplateTypes[number];

/**
 * Variables disponibles para cada tipo de plantilla
 */
export const templateVariables: Record<MessageTemplateType, string[]> = {
  appointment_reminder: [
    '{{cliente_nombre}}',
    '{{cliente_nombre_completo}}',
    '{{fecha_cita}}',
    '{{hora_cita}}',
    '{{direccion}}',
    '{{tipo_servicio}}',
    '{{nombre_negocio}}',
    '{{telefono_negocio}}',
  ],
  service_completed: [
    '{{cliente_nombre}}',
    '{{fecha_servicio}}',
    '{{tipo_servicio}}',
    '{{importe}}',
    '{{notas}}',
    '{{nombre_negocio}}',
  ],
  maintenance_reminder: [
    '{{cliente_nombre}}',
    '{{piano_marca}}',
    '{{piano_modelo}}',
    '{{ultimo_servicio}}',
    '{{meses_desde_servicio}}',
    '{{nombre_negocio}}',
  ],
  invoice_sent: [
    '{{cliente_nombre}}',
    '{{numero_factura}}',
    '{{importe}}',
    '{{fecha_factura}}',
    '{{nombre_negocio}}',
  ],
  welcome: [
    '{{cliente_nombre}}',
    '{{nombre_negocio}}',
    '{{telefono_negocio}}',
    '{{email_negocio}}',
  ],
  birthday: [
    '{{cliente_nombre}}',
    '{{nombre_negocio}}',
  ],
  promotion: [
    '{{cliente_nombre}}',
    '{{nombre_promocion}}',
    '{{descuento}}',
    '{{fecha_validez}}',
    '{{nombre_negocio}}',
  ],
  follow_up: [
    '{{cliente_nombre}}',
    '{{tipo_servicio}}',
    '{{fecha_servicio}}',
    '{{dias_desde_servicio}}',
    '{{nombre_negocio}}',
  ],
  reactivation: [
    '{{cliente_nombre}}',
    '{{ultimo_servicio}}',
    '{{meses_inactivo}}',
    '{{nombre_negocio}}',
  ],
  custom: [
    '{{cliente_nombre}}',
    '{{cliente_nombre_completo}}',
    '{{nombre_negocio}}',
  ],
};

/**
 * Plantillas por defecto para cada tipo
 */
export const defaultTemplates: Record<MessageTemplateType, { name: string; content: string }> = {
  appointment_reminder: {
    name: 'Recordatorio de Cita',
    content: `Hola {{cliente_nombre}},

Le recordamos su cita programada:

📅 *Fecha:* {{fecha_cita}}
⏰ *Hora:* {{hora_cita}}
📍 *Dirección:* {{direccion}}
🔧 *Servicio:* {{tipo_servicio}}

Si necesita modificar o cancelar la cita, por favor contáctenos con antelación.

Un saludo,
{{nombre_negocio}}`,
  },
  service_completed: {
    name: 'Servicio Completado',
    content: `Hola {{cliente_nombre}},

Le confirmamos que el servicio ha sido completado satisfactoriamente:

📅 *Fecha:* {{fecha_servicio}}
🔧 *Tipo:* {{tipo_servicio}}
💰 *Importe:* {{importe}}

{{notas}}

Gracias por confiar en nosotros.

Un saludo,
{{nombre_negocio}}`,
  },
  maintenance_reminder: {
    name: 'Recordatorio de Mantenimiento',
    content: `Hola {{cliente_nombre}},

Le recordamos que su piano *{{piano_marca}} {{piano_modelo}}* podría necesitar mantenimiento.

📅 *Último servicio:* {{ultimo_servicio}}
⏰ *Hace:* {{meses_desde_servicio}} meses

Para mantener su piano en óptimas condiciones, recomendamos una afinación cada 6-12 meses.

¿Le gustaría programar una cita? Responda a este mensaje y le ayudaremos.

Un saludo,
{{nombre_negocio}}`,
  },
  invoice_sent: {
    name: 'Factura Enviada',
    content: `Hola {{cliente_nombre}},

Le enviamos la factura correspondiente:

📄 *Factura:* {{numero_factura}}
💰 *Importe:* {{importe}}
📅 *Fecha:* {{fecha_factura}}

Puede descargar la factura desde su correo electrónico.

Gracias por su confianza.

Un saludo,
{{nombre_negocio}}`,
  },
  welcome: {
    name: 'Bienvenida',
    content: `Hola {{cliente_nombre}},

¡Bienvenido/a a {{nombre_negocio}}!

Estamos encantados de tenerle como cliente. A partir de ahora, cuidaremos de su piano con la máxima profesionalidad.

Si tiene alguna pregunta, no dude en contactarnos:
📞 {{telefono_negocio}}
📧 {{email_negocio}}

Un saludo,
{{nombre_negocio}}`,
  },
  birthday: {
    name: 'Felicitación de Cumpleaños',
    content: `¡Feliz cumpleaños, {{cliente_nombre}}! 🎂

Desde {{nombre_negocio}} le deseamos un día muy especial.

¡Que cumpla muchos más!`,
  },
  promotion: {
    name: 'Promoción',
    content: `Hola {{cliente_nombre}},

¡Tenemos una oferta especial para usted!

🎉 *{{nombre_promocion}}*
💰 *Descuento:* {{descuento}}
📅 *Válido hasta:* {{fecha_validez}}

No deje pasar esta oportunidad. Contáctenos para más información.

Un saludo,
{{nombre_negocio}}`,
  },
  follow_up: {
    name: 'Seguimiento Post-Servicio',
    content: `Hola {{cliente_nombre}},

Hace {{dias_desde_servicio}} días realizamos el servicio de {{tipo_servicio}} en su piano.

¿Está satisfecho/a con el resultado? Nos encantaría conocer su opinión.

Si tiene alguna pregunta o necesita algún ajuste, no dude en contactarnos.

Un saludo,
{{nombre_negocio}}`,
  },
  reactivation: {
    name: 'Reactivación de Cliente',
    content: `Hola {{cliente_nombre}},

¡Le echamos de menos! Hace {{meses_inactivo}} meses que no nos visita.

Su último servicio fue: {{ultimo_servicio}}

¿Le gustaría programar una revisión de su piano? Estaremos encantados de ayudarle.

Un saludo,
{{nombre_negocio}}`,
  },
  custom: {
    name: 'Mensaje Personalizado',
    content: `Hola {{cliente_nombre}},

[Escriba aquí su mensaje personalizado]

Un saludo,
{{nombre_negocio}}`,
  },
};

/**
 * Reemplaza las variables en una plantilla con los valores proporcionados
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, value || '');
  }
  
  return result;
}

/**
 * Valida que una plantilla contenga solo variables permitidas para su tipo
 */
export function validateTemplateVariables(
  content: string,
  templateType: MessageTemplateType
): { valid: boolean; invalidVariables: string[] } {
  const allowedVariables = templateVariables[templateType];
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const foundVariables: string[] = [];
  
  let match;
  while ((match = variableRegex.exec(content)) !== null) {
    const variable = `{{${match[1]}}}`;
    if (!allowedVariables.includes(variable)) {
      foundVariables.push(variable);
    }
  }
  
  return {
    valid: foundVariables.length === 0,
    invalidVariables: foundVariables,
  };
}

/**
 * Genera el contenido del mensaje para un cliente específico
 */
export function generateMessageForClient(
  template: string,
  clientData: {
    nombre: string;
    nombreCompleto?: string;
    // Añadir más campos según sea necesario
  },
  additionalData?: Record<string, string>
): string {
  const variables: Record<string, string> = {
    cliente_nombre: clientData.nombre,
    cliente_nombre_completo: clientData.nombreCompleto || clientData.nombre,
    ...additionalData,
  };
  
  return replaceTemplateVariables(template, variables);
}
