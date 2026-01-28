/**
 * Email Integration - SendGrid/Mailgun
 * Piano Emotion Manager
 * 
 * Módulo opcional para envío de emails reales a través de SendGrid o Mailgun
 */

interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'none';
  sendgridApiKey?: string;
  mailgunApiKey?: string;
  mailgunDomain?: string;
  fromEmail: string;
  fromName: string;
}

interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Obtiene la configuración de email desde variables de entorno
 */
function getEmailConfig(): EmailConfig {
  return {
    provider: (process.env.EMAIL_PROVIDER as any) || 'none',
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    mailgunApiKey: process.env.MAILGUN_API_KEY,
    mailgunDomain: process.env.MAILGUN_DOMAIN,
    fromEmail: process.env.EMAIL_FROM_ADDRESS || 'noreply@pianoemotion.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Piano Emotion',
  };
}

/**
 * Verifica si el servicio de email está configurado
 */
export function isEmailConfigured(): boolean {
  const config = getEmailConfig();
  
  if (config.provider === 'sendgrid') {
    return !!config.sendgridApiKey;
  }
  
  if (config.provider === 'mailgun') {
    return !!config.mailgunApiKey && !!config.mailgunDomain;
  }
  
  return false;
}

/**
 * Envía un email usando SendGrid
 */
async function sendWithSendGrid(message: EmailMessage, config: EmailConfig): Promise<boolean> {
  if (!config.sendgridApiKey) {
    throw new Error('SendGrid API key not configured');
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(message.to) 
              ? message.to.map(email => ({ email }))
              : [{ email: message.to }],
            ...(message.cc && {
              cc: Array.isArray(message.cc)
                ? message.cc.map(email => ({ email }))
                : [{ email: message.cc }],
            }),
            ...(message.bcc && {
              bcc: Array.isArray(message.bcc)
                ? message.bcc.map(email => ({ email }))
                : [{ email: message.bcc }],
            }),
          },
        ],
        from: {
          email: config.fromEmail,
          name: config.fromName,
        },
        ...(message.replyTo && {
          reply_to: {
            email: message.replyTo,
          },
        }),
        subject: message.subject,
        content: [
          ...(message.html ? [{ type: 'text/html', value: message.html }] : []),
          ...(message.text ? [{ type: 'text/plain', value: message.text }] : []),
        ],
        ...(message.attachments && {
          attachments: message.attachments.map(att => ({
            filename: att.filename,
            content: Buffer.isBuffer(att.content) 
              ? att.content.toString('base64')
              : att.content,
            type: att.contentType || 'application/octet-stream',
            disposition: 'attachment',
          })),
        }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email] SendGrid error:', error);
      return false;
    }

    console.log('[Email] Email sent successfully via SendGrid');
    return true;

  } catch (error: any) {
    console.error('[Email] SendGrid error:', error);
    return false;
  }
}

/**
 * Envía un email usando Mailgun
 */
async function sendWithMailgun(message: EmailMessage, config: EmailConfig): Promise<boolean> {
  if (!config.mailgunApiKey || !config.mailgunDomain) {
    throw new Error('Mailgun API key or domain not configured');
  }

  try {
    const formData = new FormData();
    formData.append('from', `${config.fromName} <${config.fromEmail}>`);
    
    if (Array.isArray(message.to)) {
      message.to.forEach(email => formData.append('to', email));
    } else {
      formData.append('to', message.to);
    }
    
    if (message.cc) {
      if (Array.isArray(message.cc)) {
        message.cc.forEach(email => formData.append('cc', email));
      } else {
        formData.append('cc', message.cc);
      }
    }
    
    if (message.bcc) {
      if (Array.isArray(message.bcc)) {
        message.bcc.forEach(email => formData.append('bcc', email));
      } else {
        formData.append('bcc', message.bcc);
      }
    }
    
    formData.append('subject', message.subject);
    
    if (message.html) {
      formData.append('html', message.html);
    }
    
    if (message.text) {
      formData.append('text', message.text);
    }
    
    if (message.replyTo) {
      formData.append('h:Reply-To', message.replyTo);
    }

    if (message.attachments) {
      message.attachments.forEach(att => {
        const blob = new Blob([att.content], { type: att.contentType || 'application/octet-stream' });
        formData.append('attachment', blob, att.filename);
      });
    }

    const response = await fetch(
      `https://api.mailgun.net/v3/${config.mailgunDomain}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${config.mailgunApiKey}`).toString('base64')}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email] Mailgun error:', error);
      return false;
    }

    console.log('[Email] Email sent successfully via Mailgun');
    return true;

  } catch (error: any) {
    console.error('[Email] Mailgun error:', error);
    return false;
  }
}

/**
 * Envía un email (función principal)
 */
export async function sendEmail(message: EmailMessage): Promise<{
  success: boolean;
  error?: string;
}> {
  const config = getEmailConfig();

  // Validar configuración
  if (config.provider === 'none') {
    console.warn('[Email] Email provider not configured. Email not sent.');
    return {
      success: false,
      error: 'Email provider not configured. Please set EMAIL_PROVIDER environment variable.',
    };
  }

  // Validar mensaje
  if (!message.to || (Array.isArray(message.to) && message.to.length === 0)) {
    return {
      success: false,
      error: 'No recipient specified',
    };
  }

  if (!message.subject) {
    return {
      success: false,
      error: 'No subject specified',
    };
  }

  if (!message.html && !message.text) {
    return {
      success: false,
      error: 'No content specified (html or text required)',
    };
  }

  try {
    let success = false;

    if (config.provider === 'sendgrid') {
      success = await sendWithSendGrid(message, config);
    } else if (config.provider === 'mailgun') {
      success = await sendWithMailgun(message, config);
    }

    return {
      success,
      error: success ? undefined : 'Failed to send email',
    };

  } catch (error: any) {
    console.error('[Email] Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Reemplaza variables en el contenido del email
 */
export function replaceEmailVariables(content: string, variables: Record<string, any>): string {
  let result = content;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(value || ''));
  }
  
  return result;
}

/**
 * Plantillas de email predefinidas
 */
export const emailTemplates = {
  welcome: {
    subject: 'Bienvenido a Piano Emotion',
    html: `
      <h1>¡Bienvenido {client.name}!</h1>
      <p>Gracias por confiar en nosotros para el cuidado de tu piano.</p>
      <p>Estamos aquí para ayudarte con cualquier necesidad que tengas.</p>
      <p>Saludos,<br>El equipo de Piano Emotion</p>
    `,
  },
  invoice_reminder: {
    subject: 'Recordatorio de Factura Pendiente',
    html: `
      <h1>Recordatorio de Pago</h1>
      <p>Hola {client.name},</p>
      <p>Te recordamos que tienes una factura pendiente de pago:</p>
      <ul>
        <li>Número: {invoice.number}</li>
        <li>Monto: {invoice.amount}€</li>
        <li>Vencimiento: {invoice.dueDate}</li>
      </ul>
      <p>Por favor, realiza el pago a la brevedad posible.</p>
      <p>Gracias por tu atención.</p>
    `,
  },
  appointment_confirmation: {
    subject: 'Confirmación de Cita',
    html: `
      <h1>Cita Confirmada</h1>
      <p>Hola {client.name},</p>
      <p>Tu cita ha sido confirmada:</p>
      <ul>
        <li>Fecha: {appointment.date}</li>
        <li>Hora: {appointment.time}</li>
        <li>Servicio: {appointment.service}</li>
      </ul>
      <p>Te esperamos en la dirección indicada.</p>
      <p>Saludos,<br>Piano Emotion</p>
    `,
  },
  service_completed: {
    subject: 'Servicio Completado',
    html: `
      <h1>Servicio Completado</h1>
      <p>Hola {client.name},</p>
      <p>Hemos completado el servicio en tu piano:</p>
      <ul>
        <li>Servicio: {service.type}</li>
        <li>Fecha: {service.date}</li>
      </ul>
      <p>Esperamos que estés satisfecho con nuestro trabajo.</p>
      <p>¡Gracias por confiar en nosotros!</p>
    `,
  },
};
