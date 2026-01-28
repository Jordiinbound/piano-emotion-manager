/**
 * SMTP Email Service
 * Envía emails usando SMTP para servidores de email corporativos
 * Piano Emotion Manager - Manus
 */
import nodemailer from 'nodemailer';
import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean; // true para SSL (465), false para TLS (587)
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class SMTPEmailService {
  /**
   * Obtener configuración SMTP del usuario
   */
  static async getUserSMTPConfig(userId: number): Promise<SMTPConfig | null> {
    try {
      const db = await getDb();
      if (!db) return null;

      const userResult = await db
        .select({
          smtpHost: users.smtpHost,
          smtpPort: users.smtpPort,
          smtpUser: users.smtpUser,
          smtpPassword: users.smtpPassword,
        })
        .from(users)
        .where(eq(users.id, userId));

      const user = userResult[0];

      if (!user?.smtpHost || !user?.smtpUser || !user?.smtpPassword) {
        return null;
      }

      return {
        host: user.smtpHost,
        port: user.smtpPort || 587,
        secure: user.smtpPort === 465,
        auth: {
          user: user.smtpUser,
          pass: user.smtpPassword,
        },
      };
    } catch (error) {
      console.error('[SMTP] Error getting config:', error);
      return null;
    }
  }

  /**
   * Enviar email usando SMTP
   */
  static async sendEmail(
    userId: number,
    params: EmailParams
  ): Promise<boolean> {
    try {
      const config = await this.getUserSMTPConfig(userId);

      if (!config) {
        console.error('[SMTP] No configuration found for user:', userId);
        return false;
      }

      // Crear transporter de nodemailer
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
        // Opciones adicionales para mejor compatibilidad
        tls: {
          rejectUnauthorized: false, // Permitir certificados auto-firmados
        },
      });

      // Verificar conexión
      await transporter.verify();

      // Enviar email
      const info = await transporter.sendMail({
        from: params.from || config.auth.user,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      console.log('[SMTP] Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('[SMTP] Error sending email:', error);
      return false;
    }
  }

  /**
   * Probar configuración SMTP
   */
  static async testSMTPConfig(config: SMTPConfig): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.verify();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verificar si el usuario tiene SMTP configurado
   */
  static async hasSMTPConfigured(userId: number): Promise<boolean> {
    const config = await this.getUserSMTPConfig(userId);
    return config !== null;
  }
}
