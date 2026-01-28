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

export default function InventarioNuevo() {
  const { t } = useTranslation();
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
      toast.success(t('inventory.itemCreated'));
      setLocation('/inventario');
    } catch (error) {
      toast.error(t('inventory.couldNotCreateItem'));
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
          {t('inventory.backToInventory')}
        </Button>
        <h1 className="text-3xl font-bold">{t('inventory.newItem')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('inventory.itemInformation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('inventory.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder={t('inventory.namePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('inventory.category')} *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strings">{t('inventory.categories.strings')}</SelectItem>
                    <SelectItem value="hammers">{t('inventory.categories.hammers')}</SelectItem>
                    <SelectItem value="dampers">{t('inventory.categories.dampers')}</SelectItem>
                    <SelectItem value="keys">{t('inventory.categories.keys')}</SelectItem>
                    <SelectItem value="action_parts">{t('inventory.categories.action_parts')}</SelectItem>
                    <SelectItem value="pedals">{t('inventory.categories.pedals')}</SelectItem>
                    <SelectItem value="tuning_pins">{t('inventory.categories.tuning_pins')}</SelectItem>
                    <SelectItem value="felts">{t('inventory.categories.felts')}</SelectItem>
                    <SelectItem value="tools">{t('inventory.categories.tools')}</SelectItem>
                    <SelectItem value="chemicals">{t('inventory.categories.chemicals')}</SelectItem>
                    <SelectItem value="other">{t('inventory.categories.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">{t('inventory.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={t('inventory.descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">{t('inventory.quantity')} *</Label>
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
                <Label htmlFor="unit">{t('inventory.unit')} *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  required
                  placeholder={t('inventory.unitPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">{t('inventory.minStock')} *</Label>
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
                <Label htmlFor="costPerUnit">{t('inventory.costPerUnit')}</Label>
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
                <Label htmlFor="supplier">{t('inventory.supplier')}</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  placeholder={t('inventory.supplierPlaceholder')}
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/inventario')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? t('common.saving') : t('inventory.saveItem')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
