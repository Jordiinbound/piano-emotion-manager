import nodemailer from 'nodemailer';
import { generateInvoicePDF } from './invoicePDF';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
}

interface InvoiceEmailData {
  invoiceNumber: string;
  date: Date | string;
  dueDate?: Date | string | null;
  clientName: string;
  clientEmail: string;
  clientAddress?: string | null;
  items: Array<{ description: string; quantity: number; price: number }>;
  subtotal: string | number;
  taxAmount: string | number;
  total: string | number;
  notes?: string | null;
  businessInfo?: any;
  paymentToken: string;
  paymentUrl: string;
  portalUrl: string;
}

/**
 * Envía una factura por email con PDF adjunto
 */
export async function sendInvoiceEmail(
  emailConfig: EmailConfig,
  invoiceData: InvoiceEmailData
): Promise<boolean> {
  try {
    // Crear transportador SMTP
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });

    // Generar PDF de la factura
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Formatear fecha de vencimiento
    const dueDateText = invoiceData.dueDate
      ? new Date(invoiceData.dueDate).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'No especificada';

    // HTML del email
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Factura</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Nueva Factura</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #1f2937;">
                Estimado/a ${invoiceData.clientName},
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #1f2937; line-height: 1.6;">
                Le enviamos su factura <strong>${invoiceData.invoiceNumber}</strong>. Puede revisar los detalles en el documento PDF adjunto o hacer clic en el botón de abajo para ver y pagar la factura en línea.
              </p>
              
              <!-- Invoice Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #6b7280; font-size: 14px;">Número de factura:</span>
                  </td>
                  <td align="right" style="padding: 8px 0;">
                    <strong style="color: #1f2937; font-size: 14px;">${invoiceData.invoiceNumber}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #6b7280; font-size: 14px;">Fecha de emisión:</span>
                  </td>
                  <td align="right" style="padding: 8px 0;">
                    <strong style="color: #1f2937; font-size: 14px;">${new Date(invoiceData.date).toLocaleDateString('es-ES')}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #6b7280; font-size: 14px;">Fecha de vencimiento:</span>
                  </td>
                  <td align="right" style="padding: 8px 0;">
                    <strong style="color: #1f2937; font-size: 14px;">${dueDateText}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-top: 2px solid #e5e7eb; padding-top: 16px;">
                    <span style="color: #2563eb; font-size: 16px; font-weight: bold;">Total:</span>
                  </td>
                  <td align="right" style="padding: 8px 0; border-top: 2px solid #e5e7eb; padding-top: 16px;">
                    <strong style="color: #2563eb; font-size: 20px;">€${Number(invoiceData.total).toFixed(2)}</strong>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${invoiceData.paymentUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                      Ver y Pagar Factura
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      ¿Quieres ver tu historial completo? 
                      <a href="${invoiceData.portalUrl}" style="color: #2563eb; text-decoration: none; font-weight: 600;">Accede a tu portal</a>
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                Si tiene alguna pregunta sobre esta factura, no dude en contactarnos. Estamos aquí para ayudarle.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                🔒 Pago seguro procesado por Stripe
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Este es un email automático, por favor no responda a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Enviar email
    const info = await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.user}>`,
      to: invoiceData.clientEmail,
      subject: `Nueva factura ${invoiceData.invoiceNumber} - ${emailConfig.fromName}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Factura-${invoiceData.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    console.log('[Email] Factura enviada:', info.messageId);
    return true;
  } catch (error) {
    console.error('[Email] Error al enviar factura:', error);
    return false;
  }
}
