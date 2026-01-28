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

export default function ClienteNuevo() {
  const { t } = useTranslation();
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
      toast.success(t('clients.clientCreated'));
      setLocation('/clientes');
    } catch (error) {
      toast.error(t('clients.couldNotCreateClient'));
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
          {t('clients.backToClients')}
        </Button>
        <h1 className="text-3xl font-bold">{t('clients.newClient')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('clients.clientInformation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('clients.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder={t('clients.namePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientType">{t('clients.clientType')} *</Label>
                <Select value={formData.clientType} onValueChange={(value) => handleChange('clientType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">{t('clients.types.particular')}</SelectItem>
                    <SelectItem value="professional">{t('clients.types.professional')}</SelectItem>
                    <SelectItem value="student">{t('clients.types.student')}</SelectItem>
                    <SelectItem value="conservatory">{t('clients.types.conservatory')}</SelectItem>
                    <SelectItem value="music_school">{t('clients.types.musicSchool')}</SelectItem>
                    <SelectItem value="concert_hall">{t('clients.types.concertHall')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('clients.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder={t('clients.emailPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('clients.phone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder={t('clients.phonePlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t('clients.address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder={t('clients.addressPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t('clients.city')}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder={t('clients.cityPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">{t('clients.postalCode')}</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder={t('clients.postalCodePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">{t('clients.region')}</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  placeholder={t('clients.regionPlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="routeGroup">{t('clients.routeGroup')}</Label>
              <Input
                id="routeGroup"
                value={formData.routeGroup}
                onChange={(e) => handleChange('routeGroup', e.target.value)}
                placeholder={t('clients.routeGroupPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('clients.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t('clients.notesPlaceholder')}
                rows={4}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setLocation('/clientes')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? t('common.saving') : t('clients.saveClient')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
