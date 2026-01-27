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

export default function InventarioNuevo() {
  const [, setLocation] = useLocation();
  const createMutation = trpc.inventory.createInventoryItem.useMutation();

  const [formData, setFormData] = useState({
    name: '',
    category: 'other' as const,
    description: '',
    quantity: '0',
    unit: 'unidad',
    minStock: '0',
    costPerUnit: '',
    supplier: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({ 
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        minStock: Number(formData.minStock),
        costPerUnit: formData.costPerUnit ? Number(formData.costPerUnit) : undefined,
        supplier: formData.supplier || undefined,
      });
      toast.success('Item de inventario creado correctamente');
      setLocation('/inventario');
    } catch (error) {
      toast.error('No se pudo crear el item de inventario');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/inventario')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Inventario
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Item de Inventario</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Item</CardTitle>
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
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strings">Cuerdas</SelectItem>
                    <SelectItem value="hammers">Martillos</SelectItem>
                    <SelectItem value="dampers">Apagadores</SelectItem>
                    <SelectItem value="keys">Teclas</SelectItem>
                    <SelectItem value="action_parts">Partes de Acción</SelectItem>
                    <SelectItem value="pedals">Pedales</SelectItem>
                    <SelectItem value="tuning_pins">Clavijas</SelectItem>
                    <SelectItem value="felts">Fieltros</SelectItem>
                    <SelectItem value="tools">Herramientas</SelectItem>
                    <SelectItem value="chemicals">Químicos</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descripción detallada del producto..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  required
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unidad *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  required
                  placeholder="unidad, metro, kg..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Stock Mínimo *</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => handleChange('minStock', e.target.value)}
                  required
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPerUnit">Coste por Unidad (€)</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => handleChange('costPerUnit', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  placeholder="Nombre del proveedor"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/inventario')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? 'Guardando...' : 'Guardar Item'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
