/**
 * WhatsApp Notifications Service Tests
 * Piano Emotion Manager - Manus
 */

import { describe, it, expect } from 'vitest';
import { WhatsAppNotificationsService } from './whatsappNotifications';

describe('WhatsAppNotificationsService', () => {
  describe('filterUpcomingAppointments', () => {
    it('should filter appointments for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const appointments = [
        {
          id: 1,
          clientId: 1,
          clientName: 'Juan Pérez',
          clientPhone: '612345678',
          serviceName: 'Afinación',
          date: tomorrow,
        },
        {
          id: 2,
          clientId: 2,
          clientName: 'María García',
          clientPhone: '623456789',
          serviceName: 'Reparación',
          date: dayAfterTomorrow,
        },
      ];

      const result = WhatsAppNotificationsService.filterUpcomingAppointments(appointments, 1);

      expect(result).toHaveLength(1);
      expect(result[0].clientName).toBe('Juan Pérez');
      expect(result[0].daysUntil).toBe(1);
    });

    it('should return empty array if no appointments match', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const appointments = [
        {
          id: 1,
          clientId: 1,
          clientName: 'Juan Pérez',
          clientPhone: '612345678',
          serviceName: 'Afinación',
          date: yesterday,
        },
      ];

      const result = WhatsAppNotificationsService.filterUpcomingAppointments(appointments, 1);

      expect(result).toHaveLength(0);
    });
  });

  describe('filterOverdueInvoices', () => {
    it('should filter overdue invoices', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const invoices = [
        {
          id: 1,
          invoiceNumber: 'INV-001',
          clientId: 1,
          clientName: 'Juan Pérez',
          clientPhone: '612345678',
          total: 150.00,
          dueDate: yesterday,
          status: 'sent',
        },
        {
          id: 2,
          invoiceNumber: 'INV-002',
          clientId: 2,
          clientName: 'María García',
          clientPhone: '623456789',
          total: 200.00,
          dueDate: tomorrow,
          status: 'sent',
        },
      ];

      const result = WhatsAppNotificationsService.filterOverdueInvoices(invoices, 1);

      expect(result).toHaveLength(1);
      expect(result[0].invoiceNumber).toBe('INV-001');
      expect(result[0].daysOverdue).toBeGreaterThanOrEqual(1);
    });

    it('should exclude paid and cancelled invoices', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const invoices = [
        {
          id: 1,
          invoiceNumber: 'INV-001',
          clientId: 1,
          clientName: 'Juan Pérez',
          clientPhone: '612345678',
          total: 150.00,
          dueDate: yesterday,
          status: 'paid',
        },
        {
          id: 2,
          invoiceNumber: 'INV-002',
          clientId: 2,
          clientName: 'María García',
          clientPhone: '623456789',
          total: 200.00,
          dueDate: yesterday,
          status: 'cancelled',
        },
      ];

      const result = WhatsAppNotificationsService.filterOverdueInvoices(invoices, 1);

      expect(result).toHaveLength(0);
    });
  });

  describe('generateAppointmentReminders', () => {
    it('should generate WhatsApp URLs for appointment reminders', () => {
      const reminders = [
        {
          clientId: 1,
          clientName: 'Juan Pérez',
          clientPhone: '612345678',
          appointmentId: 1,
          serviceName: 'Afinación',
          date: '28/01/2026',
          time: '10:00',
          daysUntil: 1,
        },
      ];

      const result = WhatsAppNotificationsService.generateAppointmentReminders(reminders);

      expect(result).toHaveLength(1);
      expect(result[0].clientName).toBe('Juan Pérez');
      expect(result[0].type).toBe('appointment');
      expect(result[0].whatsappUrl).toContain('wa.me');
      expect(result[0].whatsappUrl).toContain('34612345678');
    });

    it('should filter out clients without phone', () => {
      const reminders = [
        {
          clientId: 1,
          clientName: 'Juan Pérez',
          clientPhone: '',
          appointmentId: 1,
          serviceName: 'Afinación',
          date: '28/01/2026',
          time: '10:00',
          daysUntil: 1,
        },
      ];

      const result = WhatsAppNotificationsService.generateAppointmentReminders(reminders);

      expect(result).toHaveLength(0);
    });
  });

  describe('generatePaymentReminders', () => {
    it('should generate WhatsApp URLs for payment reminders', () => {
      const reminders = [
        {
          clientId: 1,
          clientName: 'Juan Pérez',
          clientPhone: '612345678',
          invoiceId: 1,
          invoiceNumber: 'INV-001',
          totalAmount: '150.00€',
          daysOverdue: 3,
        },
      ];

      const result = WhatsAppNotificationsService.generatePaymentReminders(reminders);

      expect(result).toHaveLength(1);
      expect(result[0].clientName).toBe('Juan Pérez');
      expect(result[0].type).toBe('payment');
      expect(result[0].whatsappUrl).toContain('wa.me');
      expect(result[0].whatsappUrl).toContain('34612345678');
    });
  });

  describe('generateMaintenanceReminders', () => {
    it('should generate WhatsApp URLs for maintenance reminders', () => {
      const pianos = [
        {
          clientId: 1,
          clientName: 'Juan Pérez',
          clientPhone: '612345678',
          pianoName: 'Yamaha U1',
          lastServiceDate: '28/07/2025',
          recommendedService: 'Afinación y revisión general',
        },
      ];

      const result = WhatsAppNotificationsService.generateMaintenanceReminders(pianos);

      expect(result).toHaveLength(1);
      expect(result[0].clientName).toBe('Juan Pérez');
      expect(result[0].type).toBe('appointment');
      expect(result[0].whatsappUrl).toContain('wa.me');
      expect(result[0].whatsappUrl).toContain('34612345678');
    });

    it('should filter out clients without phone', () => {
      const pianos = [
        {
          clientId: 1,
          clientName: 'Juan Pérez',
          clientPhone: '',
          pianoName: 'Yamaha U1',
          lastServiceDate: '28/07/2025',
          recommendedService: 'Afinación y revisión general',
        },
      ];

      const result = WhatsAppNotificationsService.generateMaintenanceReminders(pianos);

      expect(result).toHaveLength(0);
    });
  });
});
