/**
 * WhatsApp Service
 * Piano Emotion Manager - Manus
 * 
 * Servicio para generar enlaces de WhatsApp (wa.me) con mensajes pre-rellenados
 */

// ============================================================================
// TIPOS
// ============================================================================

export interface WhatsAppMessageOptions {
  phoneNumber: string;
  message: string;
}

export interface WhatsAppLinkResult {
  url: string;
  phoneNumber: string;
}

// ============================================================================
// PLANTILLAS DE MENSAJES
// ============================================================================

export const MESSAGE_TEMPLATES = {
  appointmentConfirmation: (clientName: string, serviceName: string, date: string, time: string, address: string) => 
    `Hola ${clientName},\n\nConfirmamos tu cita para ${serviceName}:\n📅 Fecha: ${date}\n🕐 Hora: ${time}\n📍 Dirección: ${address}\n\n¡Te esperamos!`,

  appointmentReminder: (clientName: string, serviceName: string, date: string, time: string) =>
    `Hola ${clientName},\n\nTe recordamos tu cita de ${serviceName}:\n📅 ${date} a las ${time}\n\n¡Nos vemos pronto!`,

  serviceCompleted: (clientName: string, serviceName: string, pianoName: string) =>
    `Hola ${clientName},\n\nHemos completado el servicio de ${serviceName} en tu ${pianoName}.\n\n¿Tienes alguna pregunta o comentario?`,

  invoiceSent: (clientName: string, invoiceNumber: string, totalAmount: string, dueDate: string) =>
    `Hola ${clientName},\n\nTe enviamos la factura #${invoiceNumber} por un total de ${totalAmount}.\n\nFecha de vencimiento: ${dueDate}\n\n¡Gracias por tu confianza!`,

  paymentReminder: (clientName: string, invoiceNumber: string, totalAmount: string, daysOverdue: number) =>
    `Hola ${clientName},\n\nTe recordamos que la factura #${invoiceNumber} por ${totalAmount} tiene ${daysOverdue} días de retraso.\n\n¿Podemos ayudarte con algo?`,

  maintenanceReminder: (clientName: string, pianoName: string, lastServiceDate: string, recommendedService: string) =>
    `Hola ${clientName},\n\nTu ${pianoName} tuvo su último servicio el ${lastServiceDate}.\n\nTe recomendamos programar: ${recommendedService}\n\n¿Cuándo te vendría bien?`,

  quoteSent: (clientName: string, quoteNumber: string, totalAmount: string, validUntil: string) =>
    `Hola ${clientName},\n\nTe enviamos el presupuesto #${quoteNumber} por ${totalAmount}.\n\nVálido hasta: ${validUntil}\n\n¿Tienes alguna pregunta?`,

  reviewRequest: (clientName: string, serviceName: string) =>
    `Hola ${clientName},\n\n¿Qué te pareció el servicio de ${serviceName}?\n\nNos encantaría conocer tu opinión. ¡Gracias!`,

  generalMessage: (clientName: string) =>
    `Hola ${clientName},\n\n`,
};

// ============================================================================
// SERVICIO WHATSAPP
// ============================================================================

export class WhatsAppService {
  /**
   * Formatea un número de teléfono para WhatsApp
   * Elimina espacios, guiones y el símbolo +
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // Eliminar espacios, guiones, paréntesis y el símbolo +
    let formatted = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    
    // Si el número empieza con 00, reemplazar por nada (formato internacional)
    if (formatted.startsWith('00')) {
      formatted = formatted.substring(2);
    }
    
    // Si el número no empieza con código de país, asumir España (+34)
    if (!formatted.match(/^[1-9]\d{10,14}$/)) {
      // Si empieza con 6, 7, 8 o 9 (números españoles), agregar 34
      if (formatted.match(/^[6789]\d{8}$/)) {
        formatted = '34' + formatted;
      }
    }
    
    return formatted;
  }

  /**
   * Genera un enlace de WhatsApp con mensaje pre-rellenado
   */
  static generateWhatsAppLink(phoneNumber: string, message: string): WhatsAppLinkResult {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    return {
      url,
      phoneNumber: formattedPhone,
    };
  }

  /**
   * Genera enlace para confirmación de cita
   */
  static generateAppointmentConfirmationLink(
    phoneNumber: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string,
    address: string
  ): WhatsAppLinkResult {
    const message = MESSAGE_TEMPLATES.appointmentConfirmation(clientName, serviceName, date, time, address);
    return this.generateWhatsAppLink(phoneNumber, message);
  }

  /**
   * Genera enlace para recordatorio de cita
   */
  static generateAppointmentReminderLink(
    phoneNumber: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string
  ): WhatsAppLinkResult {
    const message = MESSAGE_TEMPLATES.appointmentReminder(clientName, serviceName, date, time);
    return this.generateWhatsAppLink(phoneNumber, message);
  }

  /**
   * Genera enlace para servicio completado
   */
  static generateServiceCompletedLink(
    phoneNumber: string,
    clientName: string,
    serviceName: string,
    pianoName: string
  ): WhatsAppLinkResult {
    const message = MESSAGE_TEMPLATES.serviceCompleted(clientName, serviceName, pianoName);
    return this.generateWhatsAppLink(phoneNumber, message);
  }

  /**
   * Genera enlace para envío de factura
   */
  static generateInvoiceSentLink(
    phoneNumber: string,
    clientName: string,
    invoiceNumber: string,
    totalAmount: string,
    dueDate: string
  ): WhatsAppLinkResult {
    const message = MESSAGE_TEMPLATES.invoiceSent(clientName, invoiceNumber, totalAmount, dueDate);
    return this.generateWhatsAppLink(phoneNumber, message);
  }

  /**
   * Genera enlace para recordatorio de pago
   */
  static generatePaymentReminderLink(
    phoneNumber: string,
    clientName: string,
    invoiceNumber: string,
    totalAmount: string,
    daysOverdue: number
  ): WhatsAppLinkResult {
    const message = MESSAGE_TEMPLATES.paymentReminder(clientName, invoiceNumber, totalAmount, daysOverdue);
    return this.generateWhatsAppLink(phoneNumber, message);
  }

  /**
   * Genera enlace para recordatorio de mantenimiento
   */
  static generateMaintenanceReminderLink(
    phoneNumber: string,
    clientName: string,
    pianoName: string,
    lastServiceDate: string,
    recommendedService: string
  ): WhatsAppLinkResult {
    const message = MESSAGE_TEMPLATES.maintenanceReminder(clientName, pianoName, lastServiceDate, recommendedService);
    return this.generateWhatsAppLink(phoneNumber, message);
  }

  /**
   * Genera enlace para envío de presupuesto
   */
  static generateQuoteSentLink(
    phoneNumber: string,
    clientName: string,
    quoteNumber: string,
    totalAmount: string,
    validUntil: string
  ): WhatsAppLinkResult {
    const message = MESSAGE_TEMPLATES.quoteSent(clientName, quoteNumber, totalAmount, validUntil);
    return this.generateWhatsAppLink(phoneNumber, message);
  }

  /**
   * Genera enlace para solicitud de valoración
   */
  static generateReviewRequestLink(
    phoneNumber: string,
    clientName: string,
    serviceName: string
  ): WhatsAppLinkResult {
    const message = MESSAGE_TEMPLATES.reviewRequest(clientName, serviceName);
    return this.generateWhatsAppLink(phoneNumber, message);
  }

  /**
   * Genera enlace para mensaje general
   */
  static generateGeneralMessageLink(
    phoneNumber: string,
    clientName: string,
    customMessage?: string
  ): WhatsAppLinkResult {
    const message = customMessage || MESSAGE_TEMPLATES.generalMessage(clientName);
    return this.generateWhatsAppLink(phoneNumber, message);
  }
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Genera enlace de WhatsApp simple
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  return WhatsAppService.generateWhatsAppLink(phoneNumber, message).url;
}

/**
 * Formatea número de teléfono para WhatsApp
 */
export function formatPhoneNumber(phoneNumber: string): string {
  return WhatsAppService.formatPhoneNumber(phoneNumber);
}
