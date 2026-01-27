import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function FacturaEditar() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const invoiceId = Number(params.id);
  
  const { data: invoice, isLoading } = trpc.invoices.getInvoiceById.useQuery({ id: invoiceId });
  const updateMutation = trpc.invoices.updateInvoice.useMutation();
  const { data: clients } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 1000 });

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    date: '',
    dueDate: '',
    status: 'draft' as 'draft' | 'sent' | 'paid' | 'cancelled',
    subtotal: '',
    taxAmount: '',
    total: '',
    notes: '',
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        clientId: String(invoice.clientId || ''),
        clientName: invoice.clientName || '',
        clientEmail: invoice.clientEmail || '',
        clientAddress: invoice.clientAddress || '',
        date: invoice.date ? new Date(invoice.date).toISOString().split('T')[0] : '',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        status: (invoice.status as any) || 'draft',
        subtotal: String(invoice.subtotal || ''),
        taxAmount: String(invoice.taxAmount || ''),
        total: String(invoice.total || ''),
        notes: invoice.notes || '',
      });
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMutation.mutateAsync({ 
        id: invoiceId,
        clientId: Number(formData.clientId),
        clientName: formData.clientName,
        clientEmail: formData.clientEmail || undefined,
        clientAddress: formData.clientAddress || undefined,
        date: formData.date,
        dueDate: formData.dueDate || undefined,
        status: formData.status,
        subtotal: Number(formData.subtotal),
        taxAmount: Number(formData.taxAmount),
        total: Number(formData.total),
        notes: formData.notes || undefined,
      });
      toast.success('Factura actualizada correctamente');
      setLocation('/facturacion');
    } catch (error) {
      toast.error('No se pudo actualizar la factura');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Recalcular total automáticamente cuando cambian subtotal o taxAmount
      if (field === 'subtotal' || field === 'taxAmount') {
        const subtotal = Number(field === 'subtotal' ? value : newData.subtotal) || 0;
        const taxAmount = Number(field === 'taxAmount' ? value : newData.taxAmount) || 0;
        newData.total = String(subtotal + taxAmount);
      }
      
      return newData;
    });
  };

  const handleClientChange = (clientId: string) => {
    const client = clients?.clients.find((c: any) => String(c.id) === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId,
        clientName: client.name || '',
        clientEmail: client.email || '',
        clientAddress: client.address || '',
      }));
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">Cargando...</div>;
  }

  if (!invoice) {
    return <div className="container mx-auto py-6">Factura no encontrada</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/facturacion')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Facturación
        </Button>
        <h1 className="text-3xl font-bold">Editar Factura</h1>
        <p className="text-muted-foreground mt-2">Número: {invoice.invoiceNumber}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Factura</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente *</Label>
                <Select value={formData.clientId} onValueChange={handleClientChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.clients.map((client: any) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del Cliente *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  required
                  placeholder="Nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email del Cliente</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleChange('clientEmail', e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientAddress">Dirección del Cliente</Label>
                <Input
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => handleChange('clientAddress', e.target.value)}
                  placeholder="Calle, número, ciudad..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha de Emisión *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="paid">Pagada</SelectItem>
                    <SelectItem value="cancelled">Anulada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtotal">Subtotal (€) *</Label>
                <Input
                  id="subtotal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.subtotal}
                  onChange={(e) => handleChange('subtotal', e.target.value)}
                  required
                  placeholder="100.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxAmount">IVA (€) *</Label>
                <Input
                  id="taxAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.taxAmount}
                  onChange={(e) => handleChange('taxAmount', e.target.value)}
                  required
                  placeholder="21.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total">Total (€) *</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total}
                  onChange={(e) => handleChange('total', e.target.value)}
                  required
                  placeholder="121.00"
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Calculado automáticamente</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Notas adicionales sobre la factura..."
                rows={4}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/facturacion')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? 'Guardando...' : 'Actualizar Factura'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
