/**
 * WhatsApp Business API Integration
 * Piano Emotion Manager
 * 
 * Módulo opcional para envío de mensajes reales a través de WhatsApp Business API
 */

interface WhatsAppConfig {
  enabled: boolean;
  accessToken?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  webhookVerifyToken?: string;
}

interface WhatsAppMessage {
  to: string; // Número de teléfono en formato internacional (ej: +34612345678)
  type: 'text' | 'template' | 'image' | 'document';
  text?: string;
  templateName?: string;
  templateLanguage?: string;
  templateParameters?: string[];
  imageUrl?: string;
  documentUrl?: string;
  documentFilename?: string;
}

interface WhatsAppTemplateMessage {
  name: string;
  language: string;
  components?: Array<{
    type: 'header' | 'body' | 'button';
    parameters: Array<{
      type: 'text' | 'currency' | 'date_time' | 'image' | 'document';
      text?: string;
      image?: { link: string };
      document?: { link: string; filename: string };
    }>;
  }>;
}

/**
 * Obtiene la configuración de WhatsApp desde variables de entorno
 */
function getWhatsAppConfig(): WhatsAppConfig {
  return {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  };
}

/**
 * Verifica si WhatsApp está configurado
 */
export function isWhatsAppConfigured(): boolean {
  const config = getWhatsAppConfig();
  return config.enabled && !!config.accessToken && !!config.phoneNumberId;
}

/**
 * Normaliza un número de teléfono al formato internacional
 */
function normalizePhoneNumber(phone: string): string {
  // Eliminar espacios, guiones y paréntesis
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si no empieza con +, agregar + al inicio
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  return normalized;
}

/**
 * Envía un mensaje de texto simple
 */
async function sendTextMessage(
  to: string,
  text: string,
  config: WhatsAppConfig
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizePhoneNumber(to),
          type: 'text',
          text: {
            preview_url: true,
            body: text,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[WhatsApp] Error sending text message:', error);
      return false;
    }

    const result = await response.json();
    console.log('[WhatsApp] Text message sent successfully:', result.messages[0].id);
    return true;

  } catch (error: any) {
    console.error('[WhatsApp] Error sending text message:', error);
    return false;
  }
}

/**
 * Envía un mensaje usando una plantilla aprobada
 */
async function sendTemplateMessage(
  to: string,
  templateName: string,
  templateLanguage: string,
  parameters: string[],
  config: WhatsAppConfig
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizePhoneNumber(to),
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: templateLanguage,
            },
            components: [
              {
                type: 'body',
                parameters: parameters.map(param => ({
                  type: 'text',
                  text: param,
                })),
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[WhatsApp] Error sending template message:', error);
      return false;
    }

    const result = await response.json();
    console.log('[WhatsApp] Template message sent successfully:', result.messages[0].id);
    return true;

  } catch (error: any) {
    console.error('[WhatsApp] Error sending template message:', error);
    return false;
  }
}

/**
 * Envía una imagen
 */
async function sendImageMessage(
  to: string,
  imageUrl: string,
  caption: string | undefined,
  config: WhatsAppConfig
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizePhoneNumber(to),
          type: 'image',
          image: {
            link: imageUrl,
            ...(caption && { caption }),
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[WhatsApp] Error sending image:', error);
      return false;
    }

    const result = await response.json();
    console.log('[WhatsApp] Image sent successfully:', result.messages[0].id);
    return true;

  } catch (error: any) {
    console.error('[WhatsApp] Error sending image:', error);
    return false;
  }
}

/**
 * Envía un documento
 */
async function sendDocumentMessage(
  to: string,
  documentUrl: string,
  filename: string,
  caption: string | undefined,
  config: WhatsAppConfig
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizePhoneNumber(to),
          type: 'document',
          document: {
            link: documentUrl,
            filename: filename,
            ...(caption && { caption }),
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[WhatsApp] Error sending document:', error);
      return false;
    }

    const result = await response.json();
    console.log('[WhatsApp] Document sent successfully:', result.messages[0].id);
    return true;

  } catch (error: any) {
    console.error('[WhatsApp] Error sending document:', error);
    return false;
  }
}

/**
 * Envía un mensaje de WhatsApp (función principal)
 */
export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<{
  success: boolean;
  error?: string;
}> {
  const config = getWhatsAppConfig();

  // Validar configuración
  if (!config.enabled) {
    console.warn('[WhatsApp] WhatsApp integration is not enabled');
    return {
      success: false,
      error: 'WhatsApp integration is not enabled. Please set WHATSAPP_ENABLED=true',
    };
  }

  if (!config.accessToken || !config.phoneNumberId) {
    console.error('[WhatsApp] WhatsApp not configured properly');
    return {
      success: false,
      error: 'WhatsApp not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID',
    };
  }

  // Validar mensaje
  if (!message.to) {
    return {
      success: false,
      error: 'No recipient phone number specified',
    };
  }

  try {
    let success = false;

    switch (message.type) {
      case 'text':
        if (!message.text) {
          return { success: false, error: 'No text content specified' };
        }
        success = await sendTextMessage(message.to, message.text, config);
        break;

      case 'template':
        if (!message.templateName || !message.templateLanguage) {
          return { success: false, error: 'Template name and language required' };
        }
        success = await sendTemplateMessage(
          message.to,
          message.templateName,
          message.templateLanguage,
          message.templateParameters || [],
          config
        );
        break;

      case 'image':
        if (!message.imageUrl) {
          return { success: false, error: 'No image URL specified' };
        }
        success = await sendImageMessage(message.to, message.imageUrl, message.text, config);
        break;

      case 'document':
        if (!message.documentUrl || !message.documentFilename) {
          return { success: false, error: 'Document URL and filename required' };
        }
        success = await sendDocumentMessage(
          message.to,
          message.documentUrl,
          message.documentFilename,
          message.text,
          config
        );
        break;

      default:
        return { success: false, error: 'Unsupported message type' };
    }

    return {
      success,
      error: success ? undefined : 'Failed to send WhatsApp message',
    };

  } catch (error: any) {
    console.error('[WhatsApp] Error sending message:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Reemplaza variables en el contenido del mensaje
 */
export function replaceWhatsAppVariables(content: string, variables: Record<string, any>): string {
  let result = content;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(value || ''));
  }
  
  return result;
}

/**
 * Plantillas de WhatsApp predefinidas (deben estar aprobadas en Meta Business)
 */
export const whatsappTemplates = {
  welcome: {
    name: 'welcome_message',
    language: 'es',
    description: 'Mensaje de bienvenida para nuevos clientes',
  },
  appointment_reminder: {
    name: 'appointment_reminder',
    language: 'es',
    description: 'Recordatorio de cita próxima',
  },
  invoice_reminder: {
    name: 'invoice_reminder',
    language: 'es',
    description: 'Recordatorio de factura pendiente',
  },
  service_completed: {
    name: 'service_completed',
    language: 'es',
    description: 'Notificación de servicio completado',
  },
};

/**
 * Verifica el webhook de WhatsApp (para configuración inicial)
 */
export function verifyWhatsAppWebhook(mode: string, token: string, challenge: string): string | null {
  const config = getWhatsAppConfig();
  
  if (mode === 'subscribe' && token === config.webhookVerifyToken) {
    console.log('[WhatsApp] Webhook verified successfully');
    return challenge;
  }
  
  console.error('[WhatsApp] Webhook verification failed');
  return null;
}

/**
 * Procesa mensajes entrantes de WhatsApp (para respuestas automáticas)
 */
export function processWhatsAppWebhook(body: any): {
  from: string;
  message: string;
  timestamp: number;
} | null {
  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return null;
    }

    return {
      from: message.from,
      message: message.text?.body || '',
      timestamp: parseInt(message.timestamp),
    };

  } catch (error) {
    console.error('[WhatsApp] Error processing webhook:', error);
    return null;
  }
}
