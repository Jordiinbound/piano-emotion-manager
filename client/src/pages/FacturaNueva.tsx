import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import SignatureCanvas from '@/components/SignatureCanvas';

export default function FacturaNueva() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const createMutation = trpc.invoices.createInvoice.useMutation();
  const { data: clients } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 1000 });

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft' as const,
    subtotal: '',
    taxAmount: '',
    total: '',
    notes: '',
    clientSignature: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({ 
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
        clientSignature: formData.clientSignature || undefined,
      });
      toast.success(t('invoices.invoiceCreated'));
      setLocation('/facturacion');
    } catch (error) {
      toast.error(t('invoices.couldNotCreateInvoice'));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Calcular total automáticamente
      if (field === 'subtotal' || field === 'taxAmount') {
        const subtotal = Number(field === 'subtotal' ? value : updated.subtotal) || 0;
        const taxAmount = Number(field === 'taxAmount' ? value : updated.taxAmount) || 0;
        updated.total = String(subtotal + taxAmount);
      }
      
      return updated;
    });
  };

  const handleClientChange = (clientId: string) => {
    const client = clients?.clients.find((c: any) => c.id === Number(clientId));
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId,
        clientName: client.name,
        clientEmail: client.email || '',
        clientAddress: client.address || '',
      }));
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/facturacion')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('invoices.backToInvoices')}
        </Button>
        <h1 className="text-3xl font-bold">{t('invoices.newInvoice')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('invoices.invoiceInformation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">{t('invoices.client')} *</Label>
                <Select value={formData.clientId} onValueChange={handleClientChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('invoices.selectClient')} />
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
                <Label htmlFor="clientName">{t('invoices.clientName')} *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  required
                  placeholder={t('invoices.clientNamePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">{t('invoices.clientEmail')}</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleChange('clientEmail', e.target.value)}
                  placeholder={t('invoices.clientEmailPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientAddress">{t('invoices.clientAddress')}</Label>
                <Input
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => handleChange('clientAddress', e.target.value)}
                  placeholder={t('invoices.clientAddressPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t('invoices.date')} *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">{t('invoices.dueDate')}</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t('invoices.status')} *</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('invoices.statuses.draft')}</SelectItem>
                    <SelectItem value="sent">{t('invoices.statuses.sent')}</SelectItem>
                    <SelectItem value="paid">{t('invoices.statuses.paid')}</SelectItem>
                    <SelectItem value="cancelled">{t('invoices.statuses.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtotal">{t('invoices.subtotal')} *</Label>
                <Input
                  id="subtotal"
                  type="number"
                  step="0.01"
                  value={formData.subtotal}
                  onChange={(e) => handleChange('subtotal', e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxAmount">{t('invoices.taxAmount')} *</Label>
                <Input
                  id="taxAmount"
                  type="number"
                  step="0.01"
                  value={formData.taxAmount}
                  onChange={(e) => handleChange('taxAmount', e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total">{t('invoices.total')} *</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  value={formData.total}
                  onChange={(e) => handleChange('total', e.target.value)}
                  required
                  placeholder="0.00"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('invoices.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t('invoices.notesPlaceholder')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('invoices.clientSignature')}</Label>
              <SignatureCanvas
                onSave={(signature) => handleChange('clientSignature', signature)}
                existingSignature={formData.clientSignature}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/facturacion')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? t('common.saving') : t('invoices.saveInvoice')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
