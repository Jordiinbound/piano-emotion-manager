import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Edit, Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PriceHistoryCardProps {
  pianoId: number;
}

const priceTypeColors = {
  purchase: '#3b82f6', // blue
  sale: '#10b981', // green
  appraisal: '#f59e0b', // amber
  market: '#8b5cf6', // purple
  insurance: '#ef4444', // red
};

// Los labels se obtienen dinámicamente del sistema de traducción

export default function PriceHistoryCard({ pianoId }: PriceHistoryCardProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  
  const { data: history, refetch } = trpc.pianoTechnical.getPianoPriceHistory.useQuery({ pianoId });
  const addMutation = trpc.pianoTechnical.addPriceRecord.useMutation();
  const updateMutation = trpc.pianoTechnical.updatePriceRecord.useMutation();
  const deleteMutation = trpc.pianoTechnical.deletePriceRecord.useMutation();

  const [formData, setFormData] = useState({
    price: '',
    priceType: 'market' as 'purchase' | 'sale' | 'appraisal' | 'market' | 'insurance',
    date: '',
    source: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      price: '',
      priceType: 'market',
      date: '',
      source: '',
      notes: '',
    });
    setEditingRecord(null);
  };

  const handleOpenDialog = (record?: any) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        price: record.price || '',
        priceType: record.priceType || 'market',
        date: record.date || '',
        source: record.source || '',
        notes: record.notes || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({
          id: editingRecord.id,
          ...formData,
        });
        toast.success(t('pianos.priceRecordUpdated'));
      } else {
        await addMutation.mutateAsync({
          pianoId,
          ...formData,
        });
        toast.success(t('pianos.priceRecordAdded'));
      }
      
      refetch();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('pianos.confirmDeletePriceRecord'))) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success(t('pianos.priceRecordDeleted'));
      refetch();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  // Preparar datos para el gráfico
  const chartData = history
    ? [...history]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((record) => ({
          date: formatDate(record.date),
          [record.priceType]: parseFloat(record.price),
          fullDate: record.date,
        }))
    : [];

  // Agrupar datos por tipo de precio para el gráfico
  const groupedChartData = chartData.reduce((acc, curr) => {
    const existing = acc.find((item) => item.date === curr.date);
    if (existing) {
      Object.assign(existing, curr);
    } else {
      acc.push(curr);
    }
    return acc;
  }, [] as any[]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('pianos.priceHistory')}
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t('pianos.addPrice')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? t('pianos.editPrice') : t('pianos.addPrice')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{t('pianos.price')} *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priceType">{t('pianos.priceType')} *</Label>
                  <Select
                    value={formData.priceType}
                    onValueChange={(value: any) => setFormData({ ...formData, priceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">{t('pianos.purchase')}</SelectItem>
                      <SelectItem value="sale">{t('pianos.sale')}</SelectItem>
                      <SelectItem value="appraisal">{t('pianos.appraisal')}</SelectItem>
                      <SelectItem value="market">{t('pianos.market')}</SelectItem>
                      <SelectItem value="insurance">{t('pianos.insurance')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="date">{t('common.date')} *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="source">{t('pianos.source')}</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder={t('pianos.sourcePlaceholder')}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="notes">{t('common.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {editingRecord ? t('common.save') : t('common.add')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {!history || history.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('pianos.noPriceHistory')}</p>
            <Button variant="outline" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t('pianos.addFirstPrice')}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Gráfico de línea */}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={groupedChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `€${value}`} />
                  <Tooltip
                    formatter={(value: number) => formatPrice(value)}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  {Object.entries(priceTypeColors).map(([type, color]) => (
                    <Line
                      key={type}
                      type="monotone"
                      dataKey={type}
                      stroke={color}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={t(`pianos.priceType.${type}`)}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Lista de registros */}
            <div className="space-y-3">
              <h4 className="font-semibold">{t('pianos.priceRecords')}</h4>
              {history.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: priceTypeColors[record.priceType] }}
                        />
                        <span className="font-semibold text-lg">{formatPrice(record.price)}</span>
                        <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
                          {t(`pianos.priceType.${record.priceType}`)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(record.date)}</span>
                        {record.source && <span>• {record.source}</span>}
                      </div>
                      
                      {record.notes && (
                        <p className="mt-2 text-sm text-muted-foreground">{record.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDialog(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
