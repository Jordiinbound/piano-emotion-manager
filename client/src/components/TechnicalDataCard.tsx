import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

interface TechnicalDataCardProps {
  pianoId: number;
}

export default function TechnicalDataCard({ pianoId }: TechnicalDataCardProps) {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: technicalData, refetch } = trpc.pianoTechnical.getTechnicalData.useQuery({ pianoId });
  const upsertMutation = trpc.pianoTechnical.upsertTechnicalData.useMutation();

  const [formData, setFormData] = useState({
    height: '',
    width: '',
    depth: '',
    weight: '',
    numberOfKeys: '88',
    numberOfPedals: '3',
    numberOfStrings: '',
    hammerType: '',
    soundboardMaterial: '',
    frameMaterial: '',
    keyboardType: '',
    touchWeight: '',
    lastTuningDate: '',
    lastRegulationDate: '',
    lastMaintenanceDate: '',
    technicalNotes: '',
  });

  useEffect(() => {
    if (technicalData) {
      setFormData({
        height: technicalData.height || '',
        width: technicalData.width || '',
        depth: technicalData.depth || '',
        weight: technicalData.weight || '',
        numberOfKeys: String(technicalData.numberOfKeys || 88),
        numberOfPedals: String(technicalData.numberOfPedals || 3),
        numberOfStrings: String(technicalData.numberOfStrings || ''),
        hammerType: technicalData.hammerType || '',
        soundboardMaterial: technicalData.soundboardMaterial || '',
        frameMaterial: technicalData.frameMaterial || '',
        keyboardType: technicalData.keyboardType || '',
        touchWeight: technicalData.touchWeight || '',
        lastTuningDate: technicalData.lastTuningDate?.split('T')[0] || '',
        lastRegulationDate: technicalData.lastRegulationDate?.split('T')[0] || '',
        lastMaintenanceDate: technicalData.lastMaintenanceDate?.split('T')[0] || '',
        technicalNotes: technicalData.technicalNotes || '',
      });
    }
  }, [technicalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await upsertMutation.mutateAsync({
        pianoId,
        height: formData.height ? Number(formData.height) : undefined,
        width: formData.width ? Number(formData.width) : undefined,
        depth: formData.depth ? Number(formData.depth) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        numberOfKeys: formData.numberOfKeys ? Number(formData.numberOfKeys) : undefined,
        numberOfPedals: formData.numberOfPedals ? Number(formData.numberOfPedals) : undefined,
        numberOfStrings: formData.numberOfStrings ? Number(formData.numberOfStrings) : undefined,
        hammerType: formData.hammerType || undefined,
        soundboardMaterial: formData.soundboardMaterial || undefined,
        frameMaterial: formData.frameMaterial || undefined,
        keyboardType: formData.keyboardType || undefined,
        touchWeight: formData.touchWeight || undefined,
        lastTuningDate: formData.lastTuningDate || undefined,
        lastRegulationDate: formData.lastRegulationDate || undefined,
        lastMaintenanceDate: formData.lastMaintenanceDate || undefined,
        technicalNotes: formData.technicalNotes || undefined,
      });
      toast.success(t('pianos.technicalDataSaved'));
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error(t('pianos.couldNotSaveTechnicalData'));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('pianos.technicalData')}</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              {technicalData ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {technicalData ? t('common.edit') : t('common.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('pianos.editTechnicalData')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Medidas físicas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('pianos.physicalMeasurements')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">{t('pianos.height')} (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      value={formData.height}
                      onChange={(e) => handleChange('height', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">{t('pianos.width')} (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.01"
                      value={formData.width}
                      onChange={(e) => handleChange('width', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="depth">{t('pianos.depth')} (cm)</Label>
                    <Input
                      id="depth"
                      type="number"
                      step="0.01"
                      value={formData.depth}
                      onChange={(e) => handleChange('depth', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">{t('pianos.weight')} (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Características técnicas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('pianos.technicalCharacteristics')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numberOfKeys">{t('pianos.numberOfKeys')}</Label>
                    <Input
                      id="numberOfKeys"
                      type="number"
                      value={formData.numberOfKeys}
                      onChange={(e) => handleChange('numberOfKeys', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="numberOfPedals">{t('pianos.numberOfPedals')}</Label>
                    <Input
                      id="numberOfPedals"
                      type="number"
                      value={formData.numberOfPedals}
                      onChange={(e) => handleChange('numberOfPedals', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="numberOfStrings">{t('pianos.numberOfStrings')}</Label>
                    <Input
                      id="numberOfStrings"
                      type="number"
                      value={formData.numberOfStrings}
                      onChange={(e) => handleChange('numberOfStrings', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hammerType">{t('pianos.hammerType')}</Label>
                    <Input
                      id="hammerType"
                      value={formData.hammerType}
                      onChange={(e) => handleChange('hammerType', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="soundboardMaterial">{t('pianos.soundboardMaterial')}</Label>
                    <Input
                      id="soundboardMaterial"
                      value={formData.soundboardMaterial}
                      onChange={(e) => handleChange('soundboardMaterial', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="frameMaterial">{t('pianos.frameMaterial')}</Label>
                    <Input
                      id="frameMaterial"
                      value={formData.frameMaterial}
                      onChange={(e) => handleChange('frameMaterial', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="keyboardType">{t('pianos.keyboardType')}</Label>
                    <Input
                      id="keyboardType"
                      value={formData.keyboardType}
                      onChange={(e) => handleChange('keyboardType', e.target.value)}
                      placeholder="Ébano, marfil sintético..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="touchWeight">{t('pianos.touchWeight')}</Label>
                    <Input
                      id="touchWeight"
                      value={formData.touchWeight}
                      onChange={(e) => handleChange('touchWeight', e.target.value)}
                      placeholder="Ligero, medio, pesado..."
                    />
                  </div>
                </div>
              </div>

              {/* Fechas de mantenimiento */}
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('pianos.maintenanceDates')}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="lastTuningDate">{t('pianos.lastTuningDate')}</Label>
                    <Input
                      id="lastTuningDate"
                      type="date"
                      value={formData.lastTuningDate}
                      onChange={(e) => handleChange('lastTuningDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastRegulationDate">{t('pianos.lastRegulationDate')}</Label>
                    <Input
                      id="lastRegulationDate"
                      type="date"
                      value={formData.lastRegulationDate}
                      onChange={(e) => handleChange('lastRegulationDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastMaintenanceDate">{t('pianos.lastMaintenanceDate')}</Label>
                    <Input
                      id="lastMaintenanceDate"
                      type="date"
                      value={formData.lastMaintenanceDate}
                      onChange={(e) => handleChange('lastMaintenanceDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Notas técnicas */}
              <div>
                <Label htmlFor="technicalNotes">{t('pianos.technicalNotes')}</Label>
                <Textarea
                  id="technicalNotes"
                  value={formData.technicalNotes}
                  onChange={(e) => handleChange('technicalNotes', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!technicalData ? (
          <p className="text-muted-foreground text-center py-8">
            {t('pianos.noTechnicalData')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Medidas */}
            {technicalData.height && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.height')}</p>
                <p className="font-medium">{technicalData.height} cm</p>
              </div>
            )}
            {technicalData.width && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.width')}</p>
                <p className="font-medium">{technicalData.width} cm</p>
              </div>
            )}
            {technicalData.depth && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.depth')}</p>
                <p className="font-medium">{technicalData.depth} cm</p>
              </div>
            )}
            {technicalData.weight && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.weight')}</p>
                <p className="font-medium">{technicalData.weight} kg</p>
              </div>
            )}
            
            {/* Características */}
            <div>
              <p className="text-sm text-muted-foreground">{t('pianos.numberOfKeys')}</p>
              <p className="font-medium">{technicalData.numberOfKeys}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('pianos.numberOfPedals')}</p>
              <p className="font-medium">{technicalData.numberOfPedals}</p>
            </div>
            {technicalData.numberOfStrings && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.numberOfStrings')}</p>
                <p className="font-medium">{technicalData.numberOfStrings}</p>
              </div>
            )}
            {technicalData.hammerType && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.hammerType')}</p>
                <p className="font-medium">{technicalData.hammerType}</p>
              </div>
            )}
            {technicalData.soundboardMaterial && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.soundboardMaterial')}</p>
                <p className="font-medium">{technicalData.soundboardMaterial}</p>
              </div>
            )}
            {technicalData.frameMaterial && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.frameMaterial')}</p>
                <p className="font-medium">{technicalData.frameMaterial}</p>
              </div>
            )}
            {technicalData.keyboardType && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.keyboardType')}</p>
                <p className="font-medium">{technicalData.keyboardType}</p>
              </div>
            )}
            {technicalData.touchWeight && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.touchWeight')}</p>
                <p className="font-medium">{technicalData.touchWeight}</p>
              </div>
            )}
            
            {/* Fechas de mantenimiento */}
            {technicalData.lastTuningDate && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.lastTuningDate')}</p>
                <p className="font-medium">{new Date(technicalData.lastTuningDate).toLocaleDateString()}</p>
              </div>
            )}
            {technicalData.lastRegulationDate && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.lastRegulationDate')}</p>
                <p className="font-medium">{new Date(technicalData.lastRegulationDate).toLocaleDateString()}</p>
              </div>
            )}
            {technicalData.lastMaintenanceDate && (
              <div>
                <p className="text-sm text-muted-foreground">{t('pianos.lastMaintenanceDate')}</p>
                <p className="font-medium">{new Date(technicalData.lastMaintenanceDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}
        
        {technicalData?.technicalNotes && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-2">{t('pianos.technicalNotes')}</p>
            <p>{technicalData.technicalNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
