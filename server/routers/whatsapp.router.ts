/**
 * WhatsApp Router
 * Piano Emotion Manager - Manus
 * 
 * Endpoints para generar enlaces de WhatsApp con mensajes pre-rellenados
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { WhatsAppService } from '../services/whatsappService';

export const whatsappRouter = router({
  /**
   * Genera enlace de WhatsApp con mensaje personalizado
   */
  generateLink: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = WhatsAppService.generateWhatsAppLink(input.phoneNumber, input.message);
      return result;
    }),

  /**
   * Genera enlace para confirmación de cita
   */
  generateAppointmentConfirmation: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      clientName: z.string(),
      serviceName: z.string(),
      date: z.string(),
      time: z.string(),
      address: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = WhatsAppService.generateAppointmentConfirmationLink(
        input.phoneNumber,
        input.clientName,
        input.serviceName,
        input.date,
        input.time,
        input.address
      );
      return result;
    }),

  /**
   * Genera enlace para recordatorio de cita
   */
  generateAppointmentReminder: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      clientName: z.string(),
      serviceName: z.string(),
      date: z.string(),
      time: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = WhatsAppService.generateAppointmentReminderLink(
        input.phoneNumber,
        input.clientName,
        input.serviceName,
        input.date,
        input.time
      );
      return result;
    }),

  /**
   * Genera enlace para servicio completado
   */
  generateServiceCompleted: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      clientName: z.string(),
      serviceName: z.string(),
      pianoName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = WhatsAppService.generateServiceCompletedLink(
        input.phoneNumber,
        input.clientName,
        input.serviceName,
        input.pianoName
      );
      return result;
    }),

  /**
   * Genera enlace para envío de factura
   */
  generateInvoiceSent: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      clientName: z.string(),
      invoiceNumber: z.string(),
      totalAmount: z.string(),
      dueDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = WhatsAppService.generateInvoiceSentLink(
        input.phoneNumber,
        input.clientName,
        input.invoiceNumber,
        input.totalAmount,
        input.dueDate
      );
      return result;
    }),

  /**
   * Genera enlace para recordatorio de pago
   */
  generatePaymentReminder: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      clientName: z.string(),
      invoiceNumber: z.string(),
      totalAmount: z.string(),
      daysOverdue: z.number(),
    }))
    .mutation(async ({ input }) => {
      const result = WhatsAppService.generatePaymentReminderLink(
        input.phoneNumber,
        input.clientName,
        input.invoiceNumber,
        input.totalAmount,
        input.daysOverdue
      );
      return result;
    }),

  /**
   * Genera enlace para recordatorio de mantenimiento
   */
  generateMaintenanceReminder: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      clientName: z.string(),
      pianoName: z.string(),
      lastServiceDate: z.string(),
      recommendedService: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = WhatsAppService.generateMaintenanceReminderLink(
        input.phoneNumber,
        input.clientName,
        input.pianoName,
        input.lastServiceDate,
        input.recommendedService
      );
      return result;
    }),

  /**
   * Genera enlace para envío de presupuesto
   */
  generateQuoteSent: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      clientName: z.string(),
      quoteNumber: z.string(),
      totalAmount: z.string(),
      validUntil: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = WhatsAppService.generateQuoteSentLink(
        input.phoneNumber,
        input.clientName,
        input.quoteNumber,
        input.totalAmount,
        input.validUntil
      );
      return result;
    }),

  /**
   * Genera enlace para solicitud de valoración
   */
  generateReviewRequest: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      clientName: z.string(),
      serviceName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = WhatsAppService.generateReviewRequestLink(
        input.phoneNumber,
        input.clientName,
        input.serviceName
      );
      return result;
    }),

  /**
   * Genera enlace para mensaje general
   */
  generateGeneralMessage: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      clientName: z.string(),
      customMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = WhatsAppService.generateGeneralMessageLink(
        input.phoneNumber,
        input.clientName,
        input.customMessage
      );
      return result;
    }),
});
