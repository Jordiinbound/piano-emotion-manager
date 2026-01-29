/**
 * Email Notifications - Sistema de notificaciones por email para aprobaciones críticas
 * Piano Emotion Manager
 */

import { getDb } from './db';
import { users, workflowExecutions, workflows, notifications } from '../drizzle/schema';
import { eq, and, lt, isNull } from 'drizzle-orm';
import nodemailer from 'nodemailer';

/**
 * Enviar email de notificación para aprobación pendiente
 */
export async function sendApprovalEmail(params: {
  userId: number;
  workflowName: string;
  executionId: number;
  approvalMessage: string;
  approvalUrl: string;
}) {
  const db = await getDb();
  
  // Obtener datos del usuario
  const [user] = await db.select({
    email: users.email,
    name: users.name,
    notificationEmailEnabled: users.notificationEmailEnabled,
    smtpHost: users.smtpHost,
    smtpPort: users.smtpPort,
    smtpUser: users.smtpUser,
    smtpPassword: users.smtpPassword,
    smtpSecure: users.smtpSecure,
    smtpFromName: users.smtpFromName,
  })
  .from(users)
  .where(eq(users.id, params.userId));

  if (!user || !user.email) {
    console.log(`[Email] Usuario ${params.userId} no tiene email configurado`);
    return { success: false, error: 'No email configured' };
  }

  if (!user.notificationEmailEnabled) {
    console.log(`[Email] Usuario ${params.userId} tiene notificaciones por email deshabilitadas`);
    return { success: false, error: 'Email notifications disabled' };
  }

  if (!user.smtpHost || !user.smtpUser || !user.smtpPassword) {
    console.log(`[Email] Usuario ${params.userId} no tiene SMTP configurado`);
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      host: user.smtpHost,
      port: user.smtpPort || 587,
      secure: !!user.smtpSecure,
      auth: {
        user: user.smtpUser,
        pass: user.smtpPassword,
      },
    });

    // Plantilla de email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .workflow-name {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin: 20px 0;
          }
          .message {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .button:hover {
            background: #5568d3;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">⏳ Aprobación Pendiente</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Piano Emotion Manager</p>
        </div>
        
        <div class="content">
          <p>Hola <strong>${user.name || 'Usuario'}</strong>,</p>
          
          <div class="warning">
            <strong>⚠️ Atención:</strong> Un workflow requiere tu aprobación hace más de 24 horas.
          </div>
          
          <div class="workflow-name">
            📋 ${params.workflowName}
          </div>
          
          <div class="message">
            <strong>Mensaje:</strong><br>
            ${params.approvalMessage || 'Este workflow requiere tu aprobación para continuar.'}
          </div>
          
          <p>Este workflow está pausado esperando tu decisión. Por favor, revisa los detalles y aprueba o rechaza la ejecución.</p>
          
          <center>
            <a href="${params.approvalUrl}" class="button">
              Ver Detalles y Aprobar
            </a>
          </center>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            <strong>ID de Ejecución:</strong> #${params.executionId}
          </p>
        </div>
        
        <div class="footer">
          <p>Este es un email automático de Piano Emotion Manager.</p>
          <p>Si no deseas recibir estas notificaciones, puedes deshabilitarlas en tu configuración de perfil.</p>
        </div>
      </body>
      </html>
    `;

    // Enviar email
    const info = await transporter.sendMail({
      from: `"${user.smtpFromName || 'Piano Emotion Manager'}" <${user.smtpUser}>`,
      to: user.email,
      subject: `⏳ Aprobación Pendiente: ${params.workflowName}`,
      html: htmlContent,
    });

    console.log(`[Email] Enviado a ${user.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('[Email] Error al enviar:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Verificar aprobaciones pendientes y enviar emails
 * Esta función debe ser llamada periódicamente (ej: cada hora)
 */
export async function checkPendingApprovalsAndNotify() {
  try {
    const db = await getDb();
    
    // Calcular timestamp de hace 24 horas
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    console.log('[Email] Verificando aprobaciones pendientes...');
    
    // Buscar workflows pendientes de aprobación por más de 24 horas
    const pendingApprovals = await db.select({
    executionId: workflowExecutions.id,
    workflowId: workflowExecutions.workflowId,
    workflowName: workflows.name,
    userId: workflowExecutions.userId,
    pendingApprovalData: workflowExecutions.pendingApprovalData,
    pausedAt: workflowExecutions.pausedAt,
  })
  .from(workflowExecutions)
  .leftJoin(workflows, eq(workflowExecutions.workflowId, workflows.id))
  .where(
    and(
      eq(workflowExecutions.status, 'pending_approval'),
      lt(workflowExecutions.pausedAt, twentyFourHoursAgo)
    )
  );

  console.log(`[Email] Encontradas ${pendingApprovals.length} aprobaciones pendientes`);

  let emailsSent = 0;
  let emailsFailed = 0;

  // Validar que pendingApprovals sea un array
  if (!Array.isArray(pendingApprovals)) {
    console.error('[Email] pendingApprovals no es un array:', typeof pendingApprovals);
    return {
      total: 0,
      sent: 0,
      failed: 0,
    };
  }

  for (const approval of pendingApprovals) {
    // Validar que approval sea un objeto válido
    if (!approval || typeof approval !== 'object') {
      console.error('[Email] Aprobación inválida:', approval);
      continue;
    }
    if (!approval.userId || !approval.workflowName) continue;

    // Verificar si ya se envió email para esta ejecución
    const [existingNotification] = await db.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, approval.userId),
          eq(notifications.type, 'approval_pending'),
          eq(notifications.data, JSON.stringify({ executionId: approval.executionId }))
        )
      )
      .limit(1);

    // Si ya existe una notificación, verificar si ya se envió email
    if (existingNotification && existingNotification.data) {
      try {
        const dataStr = typeof existingNotification.data === 'string' 
          ? existingNotification.data 
          : JSON.stringify(existingNotification.data);
        const notifData = JSON.parse(dataStr);
        if (notifData && notifData.emailSent) {
          console.log(`[Email] Ya se envió email para ejecución ${approval.executionId}`);
          continue;
        }
      } catch (e) {
        console.error('[Email] Error parsing notification data:', e);
      }
    }

    // Parsear datos de aprobación
    let approvalMessage = 'Este workflow requiere tu aprobación para continuar.';
    if (approval.pendingApprovalData) {
      try {
        const approvalData = JSON.parse(approval.pendingApprovalData as string);
        approvalMessage = approvalData.message || approvalMessage;
      } catch (e) {
        // Ignorar errores de parsing
      }
    }

    // Enviar email
    const result = await sendApprovalEmail({
      userId: approval.userId,
      workflowName: approval.workflowName,
      executionId: approval.executionId,
      approvalMessage,
      approvalUrl: `${process.env.VITE_OAUTH_PORTAL_URL || 'http://localhost:3000'}/workflows/approvals`,
    });

    if (result.success) {
      emailsSent++;
      
      // Actualizar notificación para marcar que se envió email
      if (existingNotification) {
        let currentData = {};
        try {
          if (existingNotification.data) {
            const dataStr = typeof existingNotification.data === 'string'
              ? existingNotification.data
              : JSON.stringify(existingNotification.data);
            currentData = JSON.parse(dataStr) || {};
          }
        } catch (e) {
          console.error('[Email] Error parsing existing notification data:', e);
        }
        await db.update(notifications)
          .set({
            data: JSON.stringify({
              ...currentData,
              emailSent: true,
              emailSentAt: new Date().toISOString(),
            }),
          })
          .where(eq(notifications.id, existingNotification.id));
      }
    } else {
      emailsFailed++;
    }
  }

    console.log(`[Email] Resumen: ${emailsSent} enviados, ${emailsFailed} fallidos`);
    
    return {
      total: pendingApprovals.length,
      sent: emailsSent,
      failed: emailsFailed,
    };
  } catch (error) {
    console.error('[Email] Error en checkPendingApprovalsAndNotify:', error);
    return {
      total: 0,
      sent: 0,
      failed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
