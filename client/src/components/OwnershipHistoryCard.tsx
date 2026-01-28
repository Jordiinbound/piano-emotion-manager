import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Edit, Trash2, User, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

interface OwnershipHistoryCardProps {
  pianoId: number;
}

export default function OwnershipHistoryCard({ pianoId }: OwnershipHistoryCardProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  
  const { data: history, refetch } = trpc.pianoTechnical.getPianoOwnershipHistory.useQuery({ pianoId });
  const addMutation = trpc.pianoTechnical.addOwnershipRecord.useMutation();
  const updateMutation = trpc.pianoTechnical.updateOwnershipRecord.useMutation();
  const deleteMutation = trpc.pianoTechnical.deleteOwnershipRecord.useMutation();

  const [formData, setFormData] = useState({
    ownerName: '',
    ownerContact: '',
    ownerAddress: '',
    purchaseDate: '',
    saleDate: '',
    purchasePrice: '',
    salePrice: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      ownerName: '',
      ownerContact: '',
      ownerAddress: '',
      purchaseDate: '',
      saleDate: '',
      purchasePrice: '',
      salePrice: '',
      notes: '',
    });
    setEditingRecord(null);
  };

  const handleOpenDialog = (record?: any) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        ownerName: record.ownerName || '',
        ownerContact: record.ownerContact || '',
        ownerAddress: record.ownerAddress || '',
        purchaseDate: record.purchaseDate || '',
        saleDate: record.saleDate || '',
        purchasePrice: record.purchasePrice || '',
        salePrice: record.salePrice || '',
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
        toast.success(t('pianos.ownershipRecordUpdated'));
      } else {
        await addMutation.mutateAsync({
          pianoId,
          ...formData,
        });
        toast.success(t('pianos.ownershipRecordAdded'));
      }
      
      refetch();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('pianos.confirmDeleteOwnershipRecord'))) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success(t('pianos.ownershipRecordDeleted'));
      refetch();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: string | null) => {
    if (!price) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(parseFloat(price));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t('pianos.ownershipHistory')}
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t('pianos.addOwner')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? t('pianos.editOwner') : t('pianos.addOwner')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="ownerName">{t('pianos.ownerName')} *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="ownerContact">{t('pianos.ownerContact')}</Label>
                  <Input
                    id="ownerContact"
                    value={formData.ownerContact}
                    onChange={(e) => setFormData({ ...formData, ownerContact: e.target.value })}
                    placeholder={t('pianos.phoneOrEmail')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="ownerAddress">{t('pianos.ownerAddress')}</Label>
                  <Input
                    id="ownerAddress"
                    value={formData.ownerAddress}
                    onChange={(e) => setFormData({ ...formData, ownerAddress: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="purchaseDate">{t('pianos.purchaseDate')}</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="saleDate">{t('pianos.saleDate')}</Label>
                  <Input
                    id="saleDate"
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="purchasePrice">{t('pianos.purchasePrice')}</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="salePrice">{t('pianos.salePrice')}</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    placeholder="0.00"
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
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('pianos.noOwnershipHistory')}</p>
            <Button variant="outline" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t('pianos.addFirstOwner')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <div
                key={record.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{record.ownerName}</h4>
                    {record.ownerContact && (
                      <p className="text-sm text-muted-foreground">{record.ownerContact}</p>
                    )}
                    {record.ownerAddress && (
                      <p className="text-sm text-muted-foreground">{record.ownerAddress}</p>
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
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">{t('pianos.purchased')}</p>
                      <p className="font-medium">{formatDate(record.purchaseDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">{t('pianos.sold')}</p>
                      <p className="font-medium">{formatDate(record.saleDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">{t('pianos.purchasePrice')}</p>
                      <p className="font-medium">{formatPrice(record.purchasePrice)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">{t('pianos.salePrice')}</p>
                      <p className="font-medium">{formatPrice(record.salePrice)}</p>
                    </div>
                  </div>
                </div>
                
                {record.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-sm">{record.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
