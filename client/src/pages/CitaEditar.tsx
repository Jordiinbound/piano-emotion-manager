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

export default function CitaEditar() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams();
  const appointmentId = Number(params.id);
  
  const { data: appointment, isLoading } = trpc.appointments.getAppointmentById.useQuery({ id: appointmentId });
  const updateMutation = trpc.appointments.updateAppointment.useMutation();
  const { data: clients } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 1000 });
  const { data: pianos } = trpc.pianos.getPianos.useQuery({ page: 1, pageSize: 1000 });

  const [formData, setFormData] = useState({
    clientId: '',
    pianoId: '',
    title: '',
    date: '',
    time: '',
    duration: '',
    serviceType: '',
    status: 'scheduled' as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
    notes: '',
    address: '',
  });

  useEffect(() => {
    if (appointment) {
      const appointmentDate = appointment.date ? new Date(appointment.date) : new Date();
      const dateStr = appointmentDate.toISOString().split('T')[0];
      const timeStr = appointmentDate.toTimeString().slice(0, 5);
      
      setFormData({
        clientId: String(appointment.clientId || ''),
        pianoId: String(appointment.pianoId || ''),
        title: appointment.title || '',
        date: dateStr,
        time: timeStr,
        duration: String(appointment.duration || '60'),
        serviceType: appointment.serviceType || '',
        status: (appointment.status as any) || 'scheduled',
        notes: appointment.notes || '',
        address: appointment.address || '',
      });
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Combinar fecha y hora en ISO string
      const dateTimeStr = `${formData.date}T${formData.time}:00`;
      
      await updateMutation.mutateAsync({ 
        id: appointmentId,
        clientId: Number(formData.clientId),
        pianoId: formData.pianoId ? Number(formData.pianoId) : undefined,
        title: formData.title,
        date: dateTimeStr,
        duration: Number(formData.duration),
        serviceType: formData.serviceType || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
        address: formData.address || undefined,
      });
      toast.success(t('appointments.appointmentUpdated'));
      setLocation('/agenda');
    } catch (error) {
      toast.error(t('appointments.couldNotUpdateAppointment'));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">{t('common.loading')}</div>;
  }

  if (!appointment) {
    return <div className="container mx-auto py-6">{t('appointments.appointmentNotFound')}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/agenda')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('appointments.backToCalendar')}
        </Button>
        <h1 className="text-3xl font-bold">{t('appointments.editAppointment')}</h1>
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
                <Label htmlFor="pianoId">{t('appointments.pianoOptional')}</Label>
                <Select value={formData.pianoId} onValueChange={(value) => handleChange('pianoId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('appointments.selectPiano')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('appointments.noPiano')}</SelectItem>
                    {pianos?.pianos.map((piano: any) => (
                      <SelectItem key={piano.id} value={String(piano.id)}>
                        {piano.brand} {piano.model} - {piano.clientName}
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
                <Label htmlFor="date">{t('appointments.date')} *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">{t('appointments.time')} *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">{t('appointments.duration')} *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">{t('appointments.address')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder={t('appointments.addressPlaceholder')}
                />
              </div>
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
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? t('common.saving') : t('appointments.updateAppointment')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
