/**
 * Jobs Scheduler - Inicialización de jobs programados
 * Piano Emotion Manager
 */

import { runPendingApprovalsCheck } from './check-pending-approvals';

/**
 * Inicializar todos los jobs programados
 */
export function initializeJobs() {
  console.log('[Jobs] Inicializando jobs programados...');
  
  // Job de verificación de aprobaciones pendientes (cada hora)
  const HOUR_IN_MS = 60 * 60 * 1000;
  
  // Ejecutar inmediatamente al iniciar
  runPendingApprovalsCheck().catch(error => {
    console.error('[Jobs] Error en ejecución inicial de pending approvals:', error);
  });
  
  // Programar ejecución cada hora
  setInterval(() => {
    runPendingApprovalsCheck().catch(error => {
      console.error('[Jobs] Error en ejecución programada de pending approvals:', error);
    });
  }, HOUR_IN_MS);
  
  console.log('[Jobs] Jobs programados iniciados correctamente');
  console.log('[Jobs] - Pending Approvals Check: cada 1 hora');
}
