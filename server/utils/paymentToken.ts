import crypto from 'crypto';

/**
 * Genera un token seguro para enlaces de pago
 * @returns Token aleatorio de 32 caracteres hexadecimales
 */
export function generatePaymentToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
