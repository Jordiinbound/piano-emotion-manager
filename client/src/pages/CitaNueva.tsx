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

export default function CitaNueva() {
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
      toast.success('Cita creada correctamente');
      setLocation('/agenda');
    } catch (error) {
      toast.error('No se pudo crear la cita');
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
          Volver a Agenda
        </Button>
        <h1 className="text-3xl font-bold">Nueva Cita</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Cita</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente *</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)} required>
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
                <Label htmlFor="pianoId">Piano</Label>
                <Select value={formData.pianoId} onValueChange={(value) => handleChange('pianoId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar piano..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin piano</SelectItem>
                    {pianos?.pianos.map((piano: any) => (
                      <SelectItem key={piano.id} value={String(piano.id)}>
                        {piano.brand} {piano.model} ({piano.serialNumber || 'S/N'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  placeholder="Afinación, Reparación..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha y Hora *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos) *</Label>
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
                <Label htmlFor="serviceType">Tipo de Servicio</Label>
                <Input
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={(e) => handleChange('serviceType', e.target.value)}
                  placeholder="Afinación, Reparación..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Programada</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Dirección donde se realizará el servicio..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Notas adicionales sobre la cita..."
                rows={4}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/agenda')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? 'Guardando...' : 'Guardar Cita'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
