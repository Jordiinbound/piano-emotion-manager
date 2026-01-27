/**
 * Export Invoices Utility
 * Piano Emotion Manager
 * 
 * Utilidades para exportar facturas a Excel y CSV
 */

import * as XLSX from 'xlsx';

interface Invoice {
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string | null;
  date: Date | string;
  dueDate?: Date | string | null;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  subtotal: string | number;
  taxAmount: string | number;
  total: string | number;
  notes?: string | null;
}

/**
 * Formatea una fecha para exportación
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Traduce el estado de la factura
 */
function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Borrador',
    sent: 'Enviada',
    paid: 'Pagada',
    cancelled: 'Anulada',
  };
  return statusMap[status] || status;
}

/**
 * Prepara los datos de facturas para exportación
 */
function prepareInvoiceData(invoices: Invoice[]) {
  return invoices.map((invoice) => ({
    'Número de Factura': invoice.invoiceNumber,
    'Cliente': invoice.clientName,
    'Email': invoice.clientEmail || '',
    'Fecha de Emisión': formatDate(invoice.date),
    'Fecha de Vencimiento': formatDate(invoice.dueDate),
    'Estado': translateStatus(invoice.status),
    'Subtotal (€)': typeof invoice.subtotal === 'string' 
      ? parseFloat(invoice.subtotal).toFixed(2)
      : invoice.subtotal.toFixed(2),
    'IVA (€)': typeof invoice.taxAmount === 'string'
      ? parseFloat(invoice.taxAmount).toFixed(2)
      : invoice.taxAmount.toFixed(2),
    'Total (€)': typeof invoice.total === 'string'
      ? parseFloat(invoice.total).toFixed(2)
      : invoice.total.toFixed(2),
    'Notas': invoice.notes || '',
  }));
}

/**
 * Exporta facturas a Excel
 */
export function exportToExcel(invoices: Invoice[], filename: string = 'facturas') {
  try {
    // Preparar datos
    const data = prepareInvoiceData(invoices);

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 18 }, // Número de Factura
      { wch: 25 }, // Cliente
      { wch: 30 }, // Email
      { wch: 18 }, // Fecha de Emisión
      { wch: 20 }, // Fecha de Vencimiento
      { wch: 12 }, // Estado
      { wch: 14 }, // Subtotal
      { wch: 12 }, // IVA
      { wch: 14 }, // Total
      { wch: 40 }, // Notas
    ];
    ws['!cols'] = colWidths;

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas');

    // Descargar archivo
    XLSX.writeFile(wb, `${filename}.xlsx`);

    return true;
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    return false;
  }
}

/**
 * Exporta facturas a CSV
 */
export function exportToCSV(invoices: Invoice[], filename: string = 'facturas') {
  try {
    // Preparar datos
    const data = prepareInvoiceData(invoices);

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas');

    // Descargar archivo CSV
    XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' });

    return true;
  } catch (error) {
    console.error('Error al exportar a CSV:', error);
    return false;
  }
}

/**
 * Genera un nombre de archivo con fecha
 */
export function generateFilename(prefix: string = 'facturas'): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  return `${prefix}_${dateStr}`;
}
