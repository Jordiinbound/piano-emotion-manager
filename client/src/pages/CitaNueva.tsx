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

export default function CitaNueva() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const createMutation = trpc.appointments.createAppointment.useMutation();
  const { data: clients } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 1000 });
  const { data: pianos } = trpc.pianos.getPianos.useQuery({ page: 1, pageSize: 1000 });

  const [formData, setFormData] = useState({
    clientId: '',
    pianoId: '',
    title: '',
    date: new Date().toISOString().slice(0, 16),
    duration: '60',
    serviceType: '',
    status: 'scheduled' as const,
    notes: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({ 
        clientId: Number(formData.clientId),
        pianoId: formData.pianoId ? Number(formData.pianoId) : undefined,
        title: formData.title,
        date: formData.date,
        duration: Number(formData.duration),
        serviceType: formData.serviceType || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
        address: formData.address || undefined,
      });
      toast.success(t('appointments.appointmentCreated'));
      setLocation('/agenda');
    } catch (error) {
      toast.error(t('appointments.couldNotCreateAppointment'));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/agenda')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('appointments.backToCalendar')}
        </Button>
        <h1 className="text-3xl font-bold">{t('appointments.newAppointment')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('appointments.appointmentInformation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">{t('appointments.client')} *</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('appointments.selectClient')} />
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
                <Label htmlFor="pianoId">{t('appointments.piano')}</Label>
                <Select value={formData.pianoId} onValueChange={(value) => handleChange('pianoId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('appointments.selectPiano')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('appointments.noPiano')}</SelectItem>
                    {pianos?.pianos.map((piano: any) => (
                      <SelectItem key={piano.id} value={String(piano.id)}>
                        {piano.brand} {piano.model} ({piano.serialNumber || 'S/N'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">{t('appointments.title')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  placeholder={t('appointments.titlePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t('appointments.dateAndTime')} *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">{t('appointments.duration')} *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  required
                  placeholder="60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">{t('appointments.serviceType')}</Label>
                <Input
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={(e) => handleChange('serviceType', e.target.value)}
                  placeholder={t('appointments.serviceTypePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t('appointments.status')} *</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">{t('appointments.statuses.scheduled')}</SelectItem>
                    <SelectItem value="confirmed">{t('appointments.statuses.confirmed')}</SelectItem>
                    <SelectItem value="completed">{t('appointments.statuses.completed')}</SelectItem>
                    <SelectItem value="cancelled">{t('appointments.statuses.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t('appointments.address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder={t('appointments.addressPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('appointments.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t('appointments.notesPlaceholder')}
                rows={4}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/agenda')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? t('common.saving') : t('appointments.saveAppointment')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
