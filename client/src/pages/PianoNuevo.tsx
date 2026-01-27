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

export default function PianoNuevo() {
  const [, setLocation] = useLocation();
  const createMutation = trpc.pianos.createPiano.useMutation();
  const { data: clients } = trpc.clients.getClients.useQuery({ page: 1, pageSize: 1000 });

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    category: 'vertical' as const,
    pianoType: '',
    condition: '',
    location: '',
    clientId: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({ 
        brand: formData.brand,
        model: formData.model,
        serialNumber: formData.serialNumber || undefined,
        category: formData.category,
        pianoType: formData.pianoType || formData.brand,
        condition: formData.condition || undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        clientId: formData.clientId ? Number(formData.clientId) : 0,
      });
      toast.success('Piano creado correctamente');
      setLocation('/pianos');
    } catch (error) {
      toast.error('No se pudo crear el piano');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/pianos')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Pianos
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Piano</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Piano</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  required
                  placeholder="Yamaha, Steinway, Kawai..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  required
                  placeholder="U1, C3X, GL-30..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Número de Serie</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  placeholder="123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="grand">De Cola</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condición *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excelente</SelectItem>
                    <SelectItem value="good">Buena</SelectItem>
                    <SelectItem value="fair">Regular</SelectItem>
                    <SelectItem value="poor">Mala</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin cliente</SelectItem>
                    {clients?.clients.map((client: any) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Dirección donde se encuentra el piano..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Notas adicionales sobre el piano..."
                rows={4}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/pianos')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? 'Guardando...' : 'Guardar Piano'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
