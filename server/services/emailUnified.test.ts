/**
 * Tests para Unified Email Service
 * Piano Emotion Manager - Manus
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnifiedEmailService } from './emailUnified';

// Mock de child_process
vi.mock('child_process', () => ({
  exec: vi.fn((cmd, callback) => {
    if (cmd.includes('gmail_send_email')) {
      callback(null, { stdout: '{"id": "test-message-id"}', stderr: '' });
    } else if (cmd.includes('tool list')) {
      callback(null, { stdout: 'gmail_send_email', stderr: '' });
    } else {
      callback(new Error('Command not found'), { stdout: '', stderr: 'Error' });
    }
  }),
}));

// Mock de SMTPEmailService
vi.mock('./emailSMTP', () => ({
  SMTPEmailService: {
    hasSMTPConfigured: vi.fn().mockResolvedValue(false),
    sendEmail: vi.fn().mockResolvedValue(true),
    getUserSMTPConfig: vi.fn().mockResolvedValue({
      host: 'smtp.test.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@test.com',
        pass: 'password',
      },
    }),
  },
}));

describe('UnifiedEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectEmailProvider', () => {
    it('debería detectar Gmail como proveedor disponible', async () => {
      const provider = await UnifiedEmailService.detectEmailProvider();
      expect(provider).toBe('gmail');
    });

    it('debería retornar "none" si no hay proveedor configurado', async () => {
      // Mock para simular que no hay proveedores
      vi.mock('child_process', () => ({
        exec: vi.fn((cmd, callback) => {
          callback(new Error('Not found'), { stdout: '', stderr: 'Error' });
        }),
      }));

      const provider = await UnifiedEmailService.detectEmailProvider();
      expect(provider).toBe('none');
    });
  });

  describe('canSendEmails', () => {
    it('debería retornar true si hay un proveedor configurado', async () => {
      const canSend = await UnifiedEmailService.canSendEmails();
      expect(canSend).toBe(true);
    });
  });

  describe('getProviderInfo', () => {
    it('debería retornar información del proveedor Gmail', async () => {
      const info = await UnifiedEmailService.getProviderInfo();
      expect(info.provider).toBe('gmail');
    });
  });

  describe('sendEmail', () => {
    it('debería enviar email correctamente', async () => {
      const result = await UnifiedEmailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      });

      expect(result).toBe(true);
    });

    it('debería retornar false si no hay proveedor configurado', async () => {
      // Mock para simular que no hay proveedores
      vi.spyOn(UnifiedEmailService, 'detectEmailProvider').mockResolvedValue('none');

      const result = await UnifiedEmailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      });

      expect(result).toBe(false);
    });
  });

  describe('sendBulkEmail', () => {
    it('debería enviar múltiples emails', async () => {
      const recipients = ['test1@example.com', 'test2@example.com', 'test3@example.com'];

      const result = await UnifiedEmailService.sendBulkEmail(recipients, {
        subject: 'Bulk Test',
        html: '<p>Bulk content</p>',
      });

      expect(result.sent).toBeGreaterThan(0);
      expect(result.sent + result.failed).toBe(recipients.length);
    });
  });
});
