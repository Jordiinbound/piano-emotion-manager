import PDFDocument from 'pdfkit';

interface ReceiptData {
  receiptNumber: string;
  invoiceNumber: string;
  paymentDate: Date | string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string | null;
  paymentMethod: string;
  transactionId?: string | null;
  amountPaid: string | number;
  notes?: string | null;
  businessInfo?: any;
}

/**
 * Genera un recibo en PDF para una factura pagada
 */
export async function generateReceiptPDF(receiptData: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colores
      const primaryColor = '#2563eb';
      const textColor = '#1f2937';
      const lightGray = '#6b7280';
      const successColor = '#10b981';

      // Header con marca de agua "PAGADO"
      doc
        .fontSize(60)
        .fillColor('#e5e7eb')
        .opacity(0.3)
        .text('PAGADO', 50, 200, { align: 'center' })
        .opacity(1);

      // Título del recibo
      doc
        .fontSize(28)
        .fillColor(successColor)
        .text('RECIBO DE PAGO', 50, 50, { align: 'center' });

      // Número de recibo
      doc
        .fontSize(12)
        .fillColor(lightGray)
        .text(`Recibo Nº: ${receiptData.receiptNumber}`, 50, 90, { align: 'center' });

      // Línea separadora
      doc
        .moveTo(50, 120)
        .lineTo(545, 120)
        .strokeColor('#e5e7eb')
        .stroke();

      // Información del negocio (si existe)
      let yPos = 140;
      if (receiptData.businessInfo) {
        doc
          .fontSize(14)
          .fillColor(textColor)
          .text(receiptData.businessInfo.name || 'Piano Emotion', 50, yPos);
        yPos += 20;

        if (receiptData.businessInfo.address) {
          doc
            .fontSize(10)
            .fillColor(lightGray)
            .text(receiptData.businessInfo.address, 50, yPos);
          yPos += 15;
        }

        if (receiptData.businessInfo.phone || receiptData.businessInfo.email) {
          const contact = [
            receiptData.businessInfo.phone,
            receiptData.businessInfo.email,
          ]
            .filter(Boolean)
            .join(' | ');
          doc.fontSize(10).fillColor(lightGray).text(contact, 50, yPos);
          yPos += 25;
        }
      }

      // Información del cliente
      doc
        .fontSize(12)
        .fillColor(textColor)
        .text('Recibido de:', 50, yPos);
      yPos += 20;

      doc
        .fontSize(14)
        .fillColor(primaryColor)
        .text(receiptData.clientName, 50, yPos);
      yPos += 20;

      if (receiptData.clientEmail) {
        doc
          .fontSize(10)
          .fillColor(lightGray)
          .text(receiptData.clientEmail, 50, yPos);
        yPos += 15;
      }

      if (receiptData.clientAddress) {
        doc
          .fontSize(10)
          .fillColor(lightGray)
          .text(receiptData.clientAddress, 50, yPos);
        yPos += 25;
      } else {
        yPos += 10;
      }

      // Detalles del pago en un recuadro
      yPos += 10;
      const boxY = yPos;
      doc
        .rect(50, boxY, 495, 140)
        .fillAndStroke('#f9fafb', '#e5e7eb');

      yPos = boxY + 20;

      // Factura relacionada
      doc
        .fontSize(11)
        .fillColor(lightGray)
        .text('Factura:', 70, yPos);
      doc
        .fontSize(11)
        .fillColor(textColor)
        .text(receiptData.invoiceNumber, 200, yPos);
      yPos += 25;

      // Fecha de pago
      doc
        .fontSize(11)
        .fillColor(lightGray)
        .text('Fecha de pago:', 70, yPos);
      doc
        .fontSize(11)
        .fillColor(textColor)
        .text(
          new Date(receiptData.paymentDate).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          200,
          yPos
        );
      yPos += 25;

      // Método de pago
      doc
        .fontSize(11)
        .fillColor(lightGray)
        .text('Método de pago:', 70, yPos);
      doc
        .fontSize(11)
        .fillColor(textColor)
        .text(receiptData.paymentMethod, 200, yPos);
      yPos += 25;

      // ID de transacción (si existe)
      if (receiptData.transactionId) {
        doc
          .fontSize(11)
          .fillColor(lightGray)
          .text('ID de transacción:', 70, yPos);
        doc
          .fontSize(9)
          .fillColor(textColor)
          .text(receiptData.transactionId, 200, yPos, { width: 300 });
        yPos += 25;
      }

      // Monto pagado (destacado)
      yPos = boxY + 110;
      doc
        .fontSize(11)
        .fillColor(lightGray)
        .text('Monto pagado:', 70, yPos);
      doc
        .fontSize(20)
        .fillColor(successColor)
        .text(`€${Number(receiptData.amountPaid).toFixed(2)}`, 200, yPos - 5);

      // Notas (si existen)
      yPos = boxY + 160;
      if (receiptData.notes) {
        doc
          .fontSize(11)
          .fillColor(textColor)
          .text('Notas:', 50, yPos);
        yPos += 20;

        doc
          .fontSize(10)
          .fillColor(lightGray)
          .text(receiptData.notes, 50, yPos, { width: 495, align: 'justify' });
        yPos += 40;
      }

      // Footer
      const footerY = 750;
      doc
        .moveTo(50, footerY)
        .lineTo(545, footerY)
        .strokeColor('#e5e7eb')
        .stroke();

      doc
        .fontSize(9)
        .fillColor(lightGray)
        .text(
          'Este recibo certifica el pago completo de la factura indicada.',
          50,
          footerY + 15,
          { align: 'center', width: 495 }
        );

      doc
        .fontSize(8)
        .fillColor(lightGray)
        .text(
          `Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`,
          50,
          footerY + 35,
          { align: 'center', width: 495 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
