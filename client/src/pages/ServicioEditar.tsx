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

export default function ServicioEditar() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const serviceId = Number(params.id);
  
  const { data: service, isLoading } = trpc.services.getServiceById.useQuery({ id: serviceId });
  const updateMutation = trpc.services.updateService.useMutation();
  const { data: clients } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 1000 });
  const { data: pianos } = trpc.pianos.getPianos.useQuery({ page: 1, pageSize: 1000 });

  const [formData, setFormData] = useState({
    clientId: '',
    pianoId: '',
    serviceType: 'tuning' as 'tuning' | 'repair' | 'regulation' | 'maintenance_basic' | 'maintenance_complete' | 'maintenance_premium' | 'inspection' | 'restoration' | 'other',
    date: '',
    cost: '',
    duration: '',
    notes: '',
  });

  useEffect(() => {
    if (service) {
      setFormData({
        clientId: String(service.clientId || ''),
        pianoId: String(service.pianoId || ''),
        serviceType: (service.serviceType as any) || 'tuning',
        date: service.date ? new Date(service.date).toISOString().split('T')[0] : '',
        cost: String(service.cost || ''),
        duration: String(service.duration || ''),
        notes: service.notes || '',
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMutation.mutateAsync({ 
        id: serviceId,
        clientId: Number(formData.clientId),
        pianoId: Number(formData.pianoId),
        serviceType: formData.serviceType,
        date: formData.date,
        cost: Number(formData.cost),
        duration: Number(formData.duration),
        notes: formData.notes || undefined,
      });
      toast.success('Servicio actualizado correctamente');
      setLocation('/servicios');
    } catch (error) {
      toast.error('No se pudo actualizar el servicio');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">Cargando...</div>;
  }

  if (!service) {
    return <div className="container mx-auto py-6">Servicio no encontrado</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/servicios')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Servicios
        </Button>
        <h1 className="text-3xl font-bold">Editar Servicio</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Servicio</CardTitle>
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
                <Label htmlFor="pianoId">Piano *</Label>
                <Select value={formData.pianoId} onValueChange={(value) => handleChange('pianoId', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar piano..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pianos?.pianos.map((piano: any) => (
                      <SelectItem key={piano.id} value={String(piano.id)}>
                        {piano.brand} {piano.model} - {piano.clientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Tipo de Servicio *</Label>
                <Select value={formData.serviceType} onValueChange={(value) => handleChange('serviceType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuning">Afinación</SelectItem>
                    <SelectItem value="repair">Reparación</SelectItem>
                    <SelectItem value="regulation">Regulación</SelectItem>
                    <SelectItem value="maintenance_basic">Mantenimiento Básico</SelectItem>
                    <SelectItem value="maintenance_complete">Mantenimiento Completo</SelectItem>
                    <SelectItem value="maintenance_premium">Mantenimiento Premium</SelectItem>
                    <SelectItem value="inspection">Inspección</SelectItem>
                    <SelectItem value="restoration">Restauración</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Coste (€) *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => handleChange('cost', e.target.value)}
                  required
                  placeholder="150.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  required
                  placeholder="90"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Notas adicionales sobre el servicio..."
                rows={4}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/servicios')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? 'Guardando...' : 'Actualizar Servicio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
