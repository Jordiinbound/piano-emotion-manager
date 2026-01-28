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

export default function ServicioNuevo() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const createMutation = trpc.services.createService.useMutation();
  const { data: clients } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 1000 });
  const { data: pianos } = trpc.pianos.getPianos.useQuery({ page: 1, pageSize: 1000 });

  const [formData, setFormData] = useState({
    clientId: '',
    pianoId: '',
    serviceType: 'tuning' as const,
    date: new Date().toISOString().split('T')[0],
    cost: '',
    duration: '',
    notes: '',
    clientSignature: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({ 
        clientId: Number(formData.clientId),
        pianoId: Number(formData.pianoId),
        serviceType: formData.serviceType,
        date: formData.date,
        cost: Number(formData.cost),
        duration: formData.duration ? Number(formData.duration) : undefined,
        notes: formData.notes || undefined,
        clientSignature: formData.clientSignature || undefined,
      });
      toast.success(t('services.serviceCreated'));
      setLocation('/servicios');
    } catch (error) {
      toast.error(t('services.couldNotCreateService'));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/servicios')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('services.backToServices')}
        </Button>
        <h1 className="text-3xl font-bold">{t('services.newService')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('services.serviceInformation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">{t('services.client')} *</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('services.selectClient')} />
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
                <Label htmlFor="pianoId">{t('services.piano')} *</Label>
                <Select value={formData.pianoId} onValueChange={(value) => handleChange('pianoId', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('services.selectPiano')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('services.noPiano')}</SelectItem>
                    {pianos?.pianos.map((piano: any) => (
                      <SelectItem key={piano.id} value={String(piano.id)}>
                        {piano.brand} {piano.model} ({piano.serialNumber || 'S/N'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">{t('services.serviceType')} *</Label>
                <Select value={formData.serviceType} onValueChange={(value) => handleChange('serviceType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuning">{t('services.types.tuning')}</SelectItem>
                    <SelectItem value="repair">{t('services.types.repair')}</SelectItem>
                    <SelectItem value="regulation">{t('services.types.regulation')}</SelectItem>
                    <SelectItem value="maintenance_basic">{t('services.types.maintenance_basic')}</SelectItem>
                    <SelectItem value="maintenance_complete">{t('services.types.maintenance_complete')}</SelectItem>
                    <SelectItem value="maintenance_premium">{t('services.types.maintenance_premium')}</SelectItem>
                    <SelectItem value="inspection">{t('services.types.inspection')}</SelectItem>
                    <SelectItem value="restoration">{t('services.types.restoration')}</SelectItem>
                    <SelectItem value="other">{t('services.types.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t('services.date')} *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">{t('services.cost')} *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleChange('cost', e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">{t('services.duration')}</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('services.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t('services.notesPlaceholder')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('services.clientSignature')}</Label>
              <SignatureCanvas
                onSave={(signature) => handleChange('clientSignature', signature)}
                existingSignature={formData.clientSignature}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/servicios')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? t('common.saving') : t('services.saveService')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
