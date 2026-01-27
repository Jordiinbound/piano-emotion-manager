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

export default function ClienteNuevo() {
  const [, setLocation] = useLocation();
  const createMutation = trpc.clients.createClient.useMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    clientType: 'particular' as const,
    notes: '',
    region: '',
    city: '',
    postalCode: '',
    routeGroup: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const odId = `CLI-${Date.now()}`;
      await createMutation.mutateAsync({ ...formData, odId });
      toast.success('Cliente creado correctamente');
      setLocation('/clientes');
    } catch (error) {
      toast.error('No se pudo crear el cliente');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/clientes')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Clientes
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Cliente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="Nombre completo del cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientType">Tipo de Cliente *</Label>
                <Select value={formData.clientType} onValueChange={(value) => handleChange('clientType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="professional">Profesional</SelectItem>
                    <SelectItem value="student">Estudiante</SelectItem>
                    <SelectItem value="conservatory">Conservatorio</SelectItem>
                    <SelectItem value="music_school">Escuela de Música</SelectItem>
                    <SelectItem value="concert_hall">Sala de Conciertos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+34 123 456 789"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Calle, número, piso..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Madrid"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="28001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Comunidad</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  placeholder="Madrid"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="routeGroup">Grupo de Ruta</Label>
              <Input
                id="routeGroup"
                value={formData.routeGroup}
                onChange={(e) => handleChange('routeGroup', e.target.value)}
                placeholder="Ruta Centro, Ruta Norte..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Notas adicionales sobre el cliente..."
                rows={4}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/clientes')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? 'Guardando...' : 'Guardar Cliente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
