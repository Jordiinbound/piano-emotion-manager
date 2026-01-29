/**
 * Job Programado - Verificar aprobaciones pendientes
 * Piano Emotion Manager
 * 
 * Este job se ejecuta cada hora para verificar workflows pendientes de aprobación
 * por más de 24 horas y enviar notificaciones por email.
 */

import { checkPendingApprovalsAndNotify } from '../email-notifications';

/**
 * Ejecutar verificación de aprobaciones pendientes
 */
export async function runPendingApprovalsCheck() {
  console.log('[Job] Iniciando verificación de aprobaciones pendientes...');
  
  try {
    const result = await checkPendingApprovalsAndNotify();
    
    console.log('[Job] Verificación completada:', {
      total: result.total,
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
    
    return result;
  } catch (error) {
    console.error('[Job] Error en verificación de aprobaciones:', error);
    throw error;
  }
}

// Para ejecutar manualmente: node --loader tsx server/jobs/check-pending-approvals.ts
