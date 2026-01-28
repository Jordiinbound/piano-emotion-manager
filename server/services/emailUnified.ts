/**
 * Unified Email Service
 * Envía emails usando Gmail (MCP), Outlook o SMTP según lo que tenga configurado el usuario
 * Piano Emotion Manager - Manus
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import { SMTPEmailService } from './emailSMTP';

const execAsync = promisify(exec);

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  userEmail?: string;
}

type EmailProvider = 'gmail' | 'outlook' | 'smtp' | 'none';

export class UnifiedEmailService {
  /**
   * Detectar qué proveedor de email tiene el usuario configurado
   */
  static async detectEmailProvider(userId?: number): Promise<EmailProvider> {
    try {
      // Prioridad 1: SMTP configurado (email corporativo)
      if (userId) {
        const smtpCheck = await SMTPEmailService.hasSMTPConfigured(userId);
        if (smtpCheck) {
          return 'smtp';
        }
      }

      // Prioridad 2: Gmail conectado via MCP
      const gmailCheck = await this.checkGmailConnection();
      if (gmailCheck) {
        return 'gmail';
      }

      // Prioridad 3: Outlook conectado
      const outlookCheck = await this.checkOutlookConnection();
      if (outlookCheck) {
        return 'outlook';
      }

      return 'none';
    } catch (error) {
      console.error('[Email] Error detecting provider:', error);
      return 'none';
    }
  }

  /**
   * Enviar email usando el proveedor disponible
   */
  static async sendEmail(params: EmailParams & { userId?: number }): Promise<boolean> {
    try {
      const provider = await this.detectEmailProvider(params.userId);

      console.log(`[Email] Using provider: ${provider}`);

      switch (provider) {
        case 'smtp':
          if (!params.userId) {
            console.error('[Email] userId required for SMTP');
            return false;
          }
          return await this.sendViaSMTP(params.userId, params);
        case 'gmail':
          return await this.sendViaGmail(params);
        case 'outlook':
          return await this.sendViaOutlook(params);
        default:
          console.error('[Email] No email provider configured');
          return false;
      }
    } catch (error) {
      console.error('[Email] Error sending email:', error);
      return false;
    }
  }

  /**
   * Verificar si Gmail está conectado via MCP
   */
  private static async checkGmailConnection(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        'manus-mcp-cli tool list --server gmail 2>/dev/null'
      );
      return stdout.includes('gmail_send_email') || stdout.includes('send_email');
    } catch (error) {
      return false;
    }
  }

  /**
   * Verificar si Outlook está conectado
   */
  private static async checkOutlookConnection(): Promise<boolean> {
    try {
      // TODO: Implementar verificación de Outlook cuando tengamos MCP o Microsoft Graph
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Enviar email vía Gmail usando MCP
   */
  private static async sendViaGmail(params: EmailParams): Promise<boolean> {
    try {
      const { to, subject, html, userEmail } = params;

      // Crear el mensaje en formato RFC 2822
      const messageParts = [
        `To: ${to}`,
        userEmail ? `From: ${userEmail}` : '',
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        html,
      ];

      const message = messageParts.filter(Boolean).join('\r\n');

      // Codificar en base64url
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Preparar el input para MCP
      const input = JSON.stringify({
        raw: encodedMessage,
      });

      // Enviar usando MCP Gmail
      const { stdout, stderr } = await execAsync(
        `manus-mcp-cli tool call gmail_send_email --server gmail --input '${input.replace(/'/g, "'\\''")}'`
      );

      if (stderr && !stderr.includes('OAuth')) {
        console.error('[Gmail] Send error:', stderr);
        return false;
      }

      console.log('[Gmail] Email sent:', stdout);
      return true;
    } catch (error) {
      console.error('[Gmail] Error sending:', error);
      return false;
    }
  }

  /**
   * Enviar email vía SMTP
   */
  private static async sendViaSMTP(
    userId: number,
    params: EmailParams
  ): Promise<boolean> {
    try {
      return await SMTPEmailService.sendEmail(userId, params);
    } catch (error) {
      console.error('[SMTP] Error sending:', error);
      return false;
    }
  }

  /**
   * Enviar email vía Outlook usando Microsoft Graph API
   */
  private static async sendViaOutlook(params: EmailParams): Promise<boolean> {
    try {
      const { to, subject, html } = params;

      // Preparar el mensaje para Microsoft Graph
      const message = {
        message: {
          subject,
          body: {
            contentType: 'HTML',
            content: html,
          },
          toRecipients: [
            {
              emailAddress: {
                address: to,
              },
            },
          ],
        },
        saveToSentItems: true,
      };

      // TODO: Implementar cuando tengamos MCP de Outlook o credenciales de Microsoft Graph
      console.log('[Outlook] Email sending not yet implemented');
      console.log('[Outlook] Message:', JSON.stringify(message, null, 2));

      return false;
    } catch (error) {
      console.error('[Outlook] Error sending:', error);
      return false;
    }
  }

  /**
   * Obtener información del proveedor configurado
   */
  static async getProviderInfo(userId?: number): Promise<{
    provider: EmailProvider;
    email?: string;
    displayName?: string;
  }> {
    const provider = await this.detectEmailProvider(userId);

    if (provider === 'smtp' && userId) {
      try {
        const config = await SMTPEmailService.getUserSMTPConfig(userId);
        return {
          provider: 'smtp',
          email: config?.auth.user,
          displayName: 'SMTP',
        };
      } catch (error) {
        return { provider: 'smtp' };
      }
    }

    if (provider === 'gmail') {
      try {
        // Obtener información del perfil de Gmail via MCP
        const { stdout } = await execAsync(
          'manus-mcp-cli tool call gmail_get_profile --server gmail --input \'{}\''
        );
        const profile = JSON.parse(stdout);
        return {
          provider: 'gmail',
          email: profile.emailAddress,
          displayName: profile.displayName,
        };
      } catch (error) {
        return { provider: 'gmail' };
      }
    }

    if (provider === 'outlook') {
      // TODO: Obtener información del perfil de Outlook
      return { provider: 'outlook' };
    }

    return { provider: 'none' };
  }

  /**
   * Verificar si el usuario puede enviar emails
   */
  static async canSendEmails(userId?: number): Promise<boolean> {
    const provider = await this.detectEmailProvider(userId);
    return provider !== 'none';
  }

  /**
   * Enviar email en masa (bulk)
   */
  static async sendBulkEmail(
    recipients: string[],
    params: Omit<EmailParams, 'to'> & { userId?: number }
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const success = await this.sendEmail({
        ...params,
        to: recipient,
      });

      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Pequeña pausa entre emails para no saturar
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed };
  }
}
