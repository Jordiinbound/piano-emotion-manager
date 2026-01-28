/**
 * WhatsApp Service Tests
 * Piano Emotion Manager - Manus
 */

import { describe, it, expect } from 'vitest';
import { WhatsAppService } from './whatsappService';

describe('WhatsApp Service', () => {
  describe('formatPhoneNumber', () => {
    it('should format Spanish phone number with country code', () => {
      const result = WhatsAppService.formatPhoneNumber('+34 612 345 678');
      expect(result).toBe('34612345678');
    });

    it('should format Spanish phone number without country code', () => {
      const result = WhatsAppService.formatPhoneNumber('612 345 678');
      expect(result).toBe('34612345678');
    });

    it('should remove spaces, dashes and parentheses', () => {
      const result = WhatsAppService.formatPhoneNumber('+34 (612) 345-678');
      expect(result).toBe('34612345678');
    });

    it('should handle international format with 00', () => {
      const result = WhatsAppService.formatPhoneNumber('0034612345678');
      expect(result).toBe('34612345678');
    });

    it('should keep international numbers as-is', () => {
      const result = WhatsAppService.formatPhoneNumber('+1 555 123 4567');
      expect(result).toBe('15551234567');
    });
  });

  describe('generateWhatsAppLink', () => {
    it('should generate valid WhatsApp link', () => {
      const result = WhatsAppService.generateWhatsAppLink(
        '+34 612 345 678',
        'Hola, esto es un mensaje de prueba'
      );

      expect(result.url).toContain('https://wa.me/');
      expect(result.url).toContain('34612345678');
      expect(result.url).toContain('text=');
      expect(result.phoneNumber).toBe('34612345678');
    });

    it('should encode message properly', () => {
      const result = WhatsAppService.generateWhatsAppLink(
        '+34 612 345 678',
        'Mensaje con espacios y símbolos: ¡Hola! ¿Cómo estás?'
      );

      expect(result.url).toContain('https://wa.me/34612345678?text=');
      // URL should be encoded
      expect(result.url).toContain('%');
    });
  });

  describe('generateAppointmentConfirmationLink', () => {
    it('should generate appointment confirmation link', () => {
      const result = WhatsAppService.generateAppointmentConfirmationLink(
        '+34 612 345 678',
        'Juan Pérez',
        'Afinación',
        '15/02/2026',
        '10:00',
        'Calle Mayor 123'
      );

      expect(result.url).toContain('https://wa.me/');
      expect(result.url).toContain('34612345678');
      expect(result.url).toContain('Juan');
      expect(result.url).toContain('Afinaci%C3%B3n'); // Encoded
      expect(result.phoneNumber).toBe('34612345678');
    });
  });

  describe('generateServiceCompletedLink', () => {
    it('should generate service completed link', () => {
      const result = WhatsAppService.generateServiceCompletedLink(
        '+34 612 345 678',
        'María García',
        'Regulación',
        'Yamaha U1'
      );

      expect(result.url).toContain('https://wa.me/');
      expect(result.url).toContain('34612345678');
      expect(result.url).toContain('Mar%C3%ADa'); // Encoded
      expect(result.url).toContain('Regulaci%C3%B3n'); // Encoded
      expect(result.phoneNumber).toBe('34612345678');
    });
  });

  describe('generateInvoiceSentLink', () => {
    it('should generate invoice sent link', () => {
      const result = WhatsAppService.generateInvoiceSentLink(
        '+34 612 345 678',
        'Carlos López',
        'INV-2026-001',
        '150.00€',
        '28/02/2026'
      );

      expect(result.url).toContain('https://wa.me/');
      expect(result.url).toContain('34612345678');
      expect(result.url).toContain('INV-2026-001');
      expect(result.url).toContain('150.00');
      expect(result.phoneNumber).toBe('34612345678');
    });
  });

  describe('generateMaintenanceReminderLink', () => {
    it('should generate maintenance reminder link', () => {
      const result = WhatsAppService.generateMaintenanceReminderLink(
        '+34 612 345 678',
        'Ana Martínez',
        'Steinway Grand',
        '15/08/2025',
        'Afinación y regulación'
      );

      expect(result.url).toContain('https://wa.me/');
      expect(result.url).toContain('34612345678');
      expect(result.url).toContain('Steinway');
      expect(result.url).toContain('Afinaci%C3%B3n'); // Encoded
      expect(result.phoneNumber).toBe('34612345678');
    });
  });

  describe('generateGeneralMessageLink', () => {
    it('should generate general message link with default template', () => {
      const result = WhatsAppService.generateGeneralMessageLink(
        '+34 612 345 678',
        'Pedro Sánchez'
      );

      expect(result.url).toContain('https://wa.me/');
      expect(result.url).toContain('34612345678');
      expect(result.url).toContain('Pedro');
      expect(result.phoneNumber).toBe('34612345678');
    });

    it('should generate general message link with custom message', () => {
      const result = WhatsAppService.generateGeneralMessageLink(
        '+34 612 345 678',
        'Pedro Sánchez',
        'Este es un mensaje personalizado'
      );

      expect(result.url).toContain('https://wa.me/');
      expect(result.url).toContain('34612345678');
      expect(result.url).toContain('personalizado');
      expect(result.phoneNumber).toBe('34612345678');
    });
  });
});
