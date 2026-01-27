import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: Date | string;
  dueDate?: Date | string | null;
  clientName: string;
  clientEmail?: string | null;
  clientAddress?: string | null;
  items: InvoiceItem[];
  subtotal: string | number;
  taxAmount: string | number;
  total: string | number;
  notes?: string | null;
  businessInfo?: any;
}

/**
 * Genera un PDF de factura y devuelve un buffer
 */
export async function generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    // Capturar los chunks del PDF
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Colores
    const primaryColor = '#2563eb';
    const textColor = '#1f2937';
    const lightGray = '#f3f4f6';

    // Encabezado con información del negocio
    doc.fontSize(24).fillColor(primaryColor).text('FACTURA', 50, 50);
    
    // Información del negocio (lado derecho)
    const businessInfo = invoice.businessInfo || {};
    doc.fontSize(10).fillColor(textColor);
    doc.text(businessInfo.name || 'Piano Emotion', 350, 50, { align: 'right' });
    if (businessInfo.address) {
      doc.text(businessInfo.address, 350, 65, { align: 'right' });
    }
    if (businessInfo.phone) {
      doc.text(`Tel: ${businessInfo.phone}`, 350, 80, { align: 'right' });
    }
    if (businessInfo.email) {
      doc.text(businessInfo.email, 350, 95, { align: 'right' });
    }
    if (businessInfo.taxId) {
      doc.text(`NIF: ${businessInfo.taxId}`, 350, 110, { align: 'right' });
    }

    // Línea separadora
    doc.moveTo(50, 140).lineTo(545, 140).stroke();

    // Información de la factura y cliente
    doc.fontSize(10).fillColor(textColor);
    
    // Número y fecha de factura
    doc.text('Número de Factura:', 50, 160);
    doc.text(invoice.invoiceNumber, 150, 160);
    
    doc.text('Fecha:', 50, 175);
    doc.text(new Date(invoice.date).toLocaleDateString('es-ES'), 150, 175);
    
    if (invoice.dueDate) {
      doc.text('Vencimiento:', 50, 190);
      doc.text(new Date(invoice.dueDate).toLocaleDateString('es-ES'), 150, 190);
    }

    // Información del cliente (lado derecho)
    doc.fontSize(12).fillColor(primaryColor).text('CLIENTE', 350, 160);
    doc.fontSize(10).fillColor(textColor);
    doc.text(invoice.clientName, 350, 180);
    if (invoice.clientEmail) {
      doc.text(invoice.clientEmail, 350, 195);
    }
    if (invoice.clientAddress) {
      doc.text(invoice.clientAddress, 350, 210, { width: 195 });
    }

    // Tabla de items
    const tableTop = 260;
    doc.fontSize(10).fillColor('#ffffff');
    
    // Encabezado de la tabla
    doc.rect(50, tableTop, 495, 25).fill(primaryColor);
    doc.fillColor('#ffffff');
    doc.text('Descripción', 60, tableTop + 8);
    doc.text('Cant.', 350, tableTop + 8, { width: 50, align: 'center' });
    doc.text('Precio', 410, tableTop + 8, { width: 60, align: 'right' });
    doc.text('Total', 480, tableTop + 8, { width: 60, align: 'right' });

    // Items de la factura
    let yPosition = tableTop + 35;
    doc.fillColor(textColor);
    
    invoice.items.forEach((item, index) => {
      const itemTotal = item.quantity * item.price;
      
      // Fondo alternado
      if (index % 2 === 0) {
        doc.rect(50, yPosition - 5, 495, 25).fill(lightGray);
      }
      
      doc.fillColor(textColor);
      doc.text(item.description, 60, yPosition, { width: 280 });
      doc.text(item.quantity.toString(), 350, yPosition, { width: 50, align: 'center' });
      doc.text(`€${item.price.toFixed(2)}`, 410, yPosition, { width: 60, align: 'right' });
      doc.text(`€${itemTotal.toFixed(2)}`, 480, yPosition, { width: 60, align: 'right' });
      
      yPosition += 25;
    });

    // Totales
    yPosition += 20;
    doc.fontSize(10);
    
    doc.text('Subtotal:', 380, yPosition);
    doc.text(`€${Number(invoice.subtotal).toFixed(2)}`, 480, yPosition, { width: 60, align: 'right' });
    
    yPosition += 20;
    doc.text('IVA (21%):', 380, yPosition);
    doc.text(`€${Number(invoice.taxAmount).toFixed(2)}`, 480, yPosition, { width: 60, align: 'right' });
    
    // Línea antes del total
    yPosition += 15;
    doc.moveTo(380, yPosition).lineTo(545, yPosition).stroke();
    
    yPosition += 10;
    doc.fontSize(12).fillColor(primaryColor);
    doc.text('TOTAL:', 380, yPosition);
    doc.text(`€${Number(invoice.total).toFixed(2)}`, 480, yPosition, { width: 60, align: 'right' });

    // Notas
    if (invoice.notes) {
      yPosition += 40;
      doc.fontSize(10).fillColor(textColor);
      doc.text('Notas:', 50, yPosition);
      doc.text(invoice.notes, 50, yPosition + 15, { width: 495 });
    }

    // Pie de página
    doc.fontSize(8).fillColor('#6b7280');
    doc.text(
      'Gracias por su confianza. Para cualquier consulta, no dude en contactarnos.',
      50,
      750,
      { align: 'center', width: 495 }
    );

    doc.end();
  });
}
