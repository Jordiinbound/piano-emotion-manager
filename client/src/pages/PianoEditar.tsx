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
import { useTranslation } from '@/hooks/use-translation';

export default function PianoEditar() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams();
  const pianoId = Number(params.id);
  
  const { data: piano, isLoading } = trpc.pianos.getPianoById.useQuery({ id: pianoId });
  const updateMutation = trpc.pianos.updatePiano.useMutation();
  const { data: clients } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 1000 });

  const [formData, setFormData] = useState({
    clientId: '',
    brand: '',
    model: '',
    serialNumber: '',
    category: 'vertical' as const,
    condition: 'good' as const,
    location: '',
    notes: '',
  });

  useEffect(() => {
    if (piano) {
      setFormData({
        clientId: String(piano.clientId || ''),
        brand: piano.brand || '',
        model: piano.model || '',
        serialNumber: piano.serialNumber || '',
        category: (piano.category as any) || 'vertical',
        condition: (piano.condition as any) || 'good',
        location: piano.location || '',
        notes: piano.notes || '',
      });
    }
  }, [piano]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMutation.mutateAsync({ 
        id: pianoId,
        clientId: Number(formData.clientId),
        brand: formData.brand,
        model: formData.model,
        serialNumber: formData.serialNumber || undefined,
        category: formData.category,
        condition: formData.condition,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      });
      toast.success(t('pianos.pianoUpdated'));
      setLocation('/pianos');
    } catch (error) {
      toast.error(t('pianos.couldNotUpdatePiano'));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">{t('common.loading')}</div>;
  }

  if (!piano) {
    return <div className="container mx-auto py-6">{t('pianos.pianoNotFound')}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/pianos')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('pianos.backToPianos')}
        </Button>
        <h1 className="text-3xl font-bold">{t('pianos.editPiano')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pianos.pianoInformation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">{t('pianos.client')} *</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('pianos.selectClient')} />
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
                <Label htmlFor="brand">{t('pianos.brand')} *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  required
                  placeholder={t('pianos.brandPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">{t('pianos.model')} *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  required
                  placeholder={t('pianos.modelPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">{t('pianos.serialNumber')}</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  placeholder={t('pianos.serialNumberPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('pianos.category')} *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">{t('pianos.categories.vertical')}</SelectItem>
                    <SelectItem value="grand">{t('pianos.categories.grand')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">{t('pianos.condition')} *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">{t('pianos.conditions.excellent')}</SelectItem>
                    <SelectItem value="good">{t('pianos.conditions.good')}</SelectItem>
                    <SelectItem value="fair">{t('pianos.conditions.fair')}</SelectItem>
                    <SelectItem value="poor">{t('pianos.conditions.poor')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">{t('pianos.location')}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder={t('pianos.locationPlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('pianos.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t('pianos.notesPlaceholder')}
                rows={4}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/pianos')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? t('common.saving') : t('pianos.updatePiano')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
