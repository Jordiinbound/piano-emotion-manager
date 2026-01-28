/**
 * PDF Service
 * Piano Emotion Manager - Manus
 * 
 * Servicio unificado para generación de PDFs usando Puppeteer
 */

import puppeteer from 'puppeteer';
import { generateInvoiceHTML, type InvoiceData } from './invoicePDF';

// ============================================================================
// TIPOS
// ============================================================================

export interface PDFOptions {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  landscape?: boolean;
}

export interface PDFGenerationResult {
  success: boolean;
  buffer?: Buffer;
  error?: string;
}

// ============================================================================
// SERVICIO PDF
// ============================================================================

export class PDFService {
  /**
   * Convierte HTML a PDF usando Puppeteer
   */
  static async htmlToPDF(
    html: string,
    options: PDFOptions = {}
  ): Promise<PDFGenerationResult> {
    let browser;
    
    try {
      // Lanzar navegador headless
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();
      
      // Cargar HTML
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Generar PDF
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        margin: options.margin || {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: options.printBackground !== false,
        landscape: options.landscape || false,
      });

      await browser.close();

      return {
        success: true,
        buffer: Buffer.from(pdfBuffer),
      };
    } catch (error) {
      console.error('[PDF] Error generating PDF:', error);
      
      if (browser) {
        await browser.close();
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Genera PDF de factura
   */
  static async generateInvoicePDF(
    data: InvoiceData,
    options?: PDFOptions
  ): Promise<PDFGenerationResult> {
    try {
      const html = generateInvoiceHTML(data);
      return await this.htmlToPDF(html, options);
    } catch (error) {
      console.error('[PDF] Error generating invoice PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Genera PDF de presupuesto (similar a factura pero sin impuestos)
   */
  static async generateQuotePDF(
    data: InvoiceData,
    options?: PDFOptions
  ): Promise<PDFGenerationResult> {
    try {
      // Modificar el HTML de factura para convertirlo en presupuesto
      const html = generateInvoiceHTML(data).replace(/FACTURA/g, 'PRESUPUESTO');
      return await this.htmlToPDF(html, options);
    } catch (error) {
      console.error('[PDF] Error generating quote PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Genera PDF de reporte personalizado
   */
  static async generateReportPDF(
    html: string,
    options?: PDFOptions
  ): Promise<PDFGenerationResult> {
    return await this.htmlToPDF(html, options);
  }

  /**
   * Genera PDF desde URL
   */
  static async generatePDFFromURL(
    url: string,
    options?: PDFOptions
  ): Promise<PDFGenerationResult> {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: options?.format || 'A4',
        margin: options?.margin || {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: options?.printBackground !== false,
        landscape: options?.landscape || false,
      });

      await browser.close();

      return {
        success: true,
        buffer: Buffer.from(pdfBuffer),
      };
    } catch (error) {
      console.error('[PDF] Error generating PDF from URL:', error);
      
      if (browser) {
        await browser.close();
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}


// ============================================================================
// FUNCIONES DE EXPORTACIÓN
// ============================================================================

/**
 * Generate clients list PDF
 */
export async function generateClientsPDF(clients: any[]): Promise<Buffer> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Lista de Clientes</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #2196F3; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #2196F3; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:hover { background-color: #f5f5f5; }
      </style>
    </head>
    <body>
      <h1>Lista de Clientes</h1>
      <p>Total de clientes: ${clients.length}</p>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Pianos</th>
            <th>Servicios</th>
          </tr>
        </thead>
        <tbody>
          ${clients.map(client => `
            <tr>
              <td>${client.name}</td>
              <td>${client.email || '-'}</td>
              <td>${client.phone || '-'}</td>
              <td>${client.pianosCount || 0}</td>
              <td>${client.servicesCount || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const result = await PDFService.htmlToPDF(html);
  if (!result.success || !result.buffer) {
    throw new Error('Failed to generate PDF');
  }
  return result.buffer;
}

/**
 * Generate services list PDF
 */
export async function generateServicesPDF(services: any[]): Promise<Buffer> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Lista de Servicios</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #4CAF50; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th { background-color: #4CAF50; color: white; padding: 8px; text-align: left; }
        td { padding: 6px; border-bottom: 1px solid #ddd; }
        tr:hover { background-color: #f5f5f5; }
      </style>
    </head>
    <body>
      <h1>Lista de Servicios</h1>
      <p>Total de servicios: ${services.length}</p>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Piano</th>
            <th>Tipo</th>
            <th>Duración</th>
            <th>Costo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${services.map(service => `
            <tr>
              <td>${new Date(service.serviceDate).toLocaleDateString('es-ES')}</td>
              <td>${service.clientName}</td>
              <td>${service.pianoInfo}</td>
              <td>${service.serviceType}</td>
              <td>${service.duration}h</td>
              <td>€${service.cost}</td>
              <td>${service.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const result = await PDFService.htmlToPDF(html);
  if (!result.success || !result.buffer) {
    throw new Error('Failed to generate PDF');
  }
  return result.buffer;
}

/**
 * Generate invoices list PDF
 */
export async function generateInvoicesPDF(invoices: any[]): Promise<Buffer> {
  const totalAmount = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Lista de Facturas</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #FF9800; text-align: center; }
        .summary { background-color: #FFF3E0; padding: 15px; border-radius: 5px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th { background-color: #FF9800; color: white; padding: 8px; text-align: left; }
        td { padding: 6px; border-bottom: 1px solid #ddd; }
        tr:hover { background-color: #f5f5f5; }
        .paid { color: green; font-weight: bold; }
        .pending { color: orange; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Lista de Facturas</h1>
      <div class="summary">
        <p><strong>Total de facturas:</strong> ${invoices.length}</p>
        <p><strong>Total facturado:</strong> €${totalAmount.toFixed(2)}</p>
        <p><strong>Total cobrado:</strong> €${paidAmount.toFixed(2)}</p>
        <p><strong>Pendiente:</strong> €${(totalAmount - paidAmount).toFixed(2)}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Subtotal</th>
            <th>IVA</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.map(invoice => `
            <tr>
              <td>${invoice.invoiceNumber}</td>
              <td>${new Date(invoice.createdAt).toLocaleDateString('es-ES')}</td>
              <td>${invoice.clientName}</td>
              <td>€${invoice.subtotal}</td>
              <td>€${invoice.tax}</td>
              <td>€${invoice.total}</td>
              <td class="${invoice.status === 'paid' ? 'paid' : 'pending'}">${invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const result = await PDFService.htmlToPDF(html);
  if (!result.success || !result.buffer) {
    throw new Error('Failed to generate PDF');
  }
  return result.buffer;
}

/**
 * Generate inventory PDF
 */
export async function generateInventoryPDF(inventory: any[]): Promise<Buffer> {
  const totalValue = inventory.reduce((sum, i) => sum + (i.quantity || 0) * (i.price || 0), 0);
  const lowStockCount = inventory.filter(i => (i.quantity || 0) < (i.minStock || 5)).length;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Inventario</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #795548; text-align: center; }
        .summary { background-color: #EFEBE9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th { background-color: #795548; color: white; padding: 8px; text-align: left; }
        td { padding: 6px; border-bottom: 1px solid #ddd; }
        tr:hover { background-color: #f5f5f5; }
        .low-stock { background-color: #FFEBEE; }
      </style>
    </head>
    <body>
      <h1>Inventario</h1>
      <div class="summary">
        <p><strong>Total de items:</strong> ${inventory.length}</p>
        <p><strong>Valor total:</strong> €${totalValue.toFixed(2)}</p>
        <p><strong>Items con stock bajo:</strong> ${lowStockCount}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>Stock Mín.</th>
            <th>Precio Unit.</th>
            <th>Valor Total</th>
          </tr>
        </thead>
        <tbody>
          ${inventory.map(item => {
            const isLowStock = (item.quantity || 0) < (item.minStock || 5);
            return `
              <tr class="${isLowStock ? 'low-stock' : ''}">
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.minStock || 5}</td>
                <td>€${(item.price || 0).toFixed(2)}</td>
                <td>€${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const result = await PDFService.htmlToPDF(html);
  if (!result.success || !result.buffer) {
    throw new Error('Failed to generate PDF');
  }
  return result.buffer;
}

/**
 * Generate pianos list PDF
 */
export async function generatePianosPDF(pianos: any[]): Promise<Buffer> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Lista de Pianos</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #9C27B0; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th { background-color: #9C27B0; color: white; padding: 8px; text-align: left; }
        td { padding: 6px; border-bottom: 1px solid #ddd; }
        tr:hover { background-color: #f5f5f5; }
      </style>
    </head>
    <body>
      <h1>Lista de Pianos</h1>
      <p>Total de pianos: ${pianos.length}</p>
      <table>
        <thead>
          <tr>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Nº Serie</th>
            <th>Tipo</th>
            <th>Año</th>
            <th>Cliente</th>
            <th>Ubicación</th>
            <th>Condición</th>
            <th>Último Servicio</th>
          </tr>
        </thead>
        <tbody>
          ${pianos.map(piano => `
            <tr>
              <td>${piano.brand}</td>
              <td>${piano.model}</td>
              <td>${piano.serialNumber}</td>
              <td>${piano.type}</td>
              <td>${piano.year}</td>
              <td>${piano.clientName}</td>
              <td>${piano.location}</td>
              <td>${piano.condition}</td>
              <td>${piano.lastServiceDate ? new Date(piano.lastServiceDate).toLocaleDateString('es-ES') : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const result = await PDFService.htmlToPDF(html);
  if (!result.success || !result.buffer) {
    throw new Error('Failed to generate PDF');
  }
  return result.buffer;
}
