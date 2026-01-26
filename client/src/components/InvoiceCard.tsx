/**
 * InvoiceCard Component - Professional Minimalist Design
 * Piano Emotion Manager
 * 
 * Diseño profesional y minimalista para mostrar información de facturas
 */

interface InvoiceCardProps {
  invoice: {
    id: number;
    invoiceNumber: string;
    clientName: string;
    date: string; // ISO timestamp
    status: 'draft' | 'sent' | 'paid' | 'cancelled';
    total: string | number;
  };
  onClick?: () => void;
}

export function InvoiceCard({ invoice, onClick }: InvoiceCardProps) {
  // Formatear fecha
  const date = new Date(invoice.date);
  const dateString = date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  // Traducir estado
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    draft: { label: 'Borrador', color: '#6B7280', bgColor: '#F3F4F6' },
    sent: { label: 'Enviada', color: '#e07a5f', bgColor: '#fef3f0' },
    paid: { label: 'Pagada', color: '#4A7C59', bgColor: '#e8f5e9' },
    cancelled: { label: 'Anulada', color: '#6B7280', bgColor: '#F3F4F6' },
  };

  const statusInfo = statusMap[invoice.status] || statusMap.draft;

  // Formatear total
  const total = typeof invoice.total === 'string' ? parseFloat(invoice.total) : invoice.total;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header: Número de factura y estado */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-900">{invoice.invoiceNumber}</h3>
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider"
          style={{
            color: statusInfo.color,
            backgroundColor: statusInfo.bgColor,
          }}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Cliente */}
      <p className="text-sm text-gray-600 font-medium mb-3">{invoice.clientName}</p>

      {/* Footer: Fecha y total */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">{dateString}</span>
        <span className="text-base font-bold text-[#e07a5f]">€{total.toFixed(2)}</span>
      </div>
    </div>
  );
}
