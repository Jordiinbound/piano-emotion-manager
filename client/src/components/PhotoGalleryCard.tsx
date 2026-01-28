import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

interface PhotoGalleryCardProps {
  pianoId: number;
  photos: string[] | null;
}

export default function PhotoGalleryCard({ pianoId, photos: initialPhotos }: PhotoGalleryCardProps) {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<string[]>(initialPhotos || []);
  const [isUploading, setIsUploading] = useState(false);

  const updateMutation = trpc.pianos.updatePiano.useMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newPhotoUrls: string[] = [];
      
      for (const file of Array.from(files)) {
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: ${t('pianos.fileTooLarge')}`);
          continue;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name}: ${t('pianos.invalidFileType')}`);
          continue;
        }

        // Convertir a base64 para enviar al servidor
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // Aquí deberías llamar a un endpoint que suba la foto a S3
        // Por ahora, simplemente agregamos la URL base64 (temporal)
        newPhotoUrls.push(base64);
      }

      const updatedPhotos = [...photos, ...newPhotoUrls];
      setPhotos(updatedPhotos);

      // Actualizar el piano con las nuevas fotos
      await updateMutation.mutateAsync({
        id: pianoId,
        photos: updatedPhotos,
      });

      toast.success(t('pianos.photosUploaded'));
    } catch (error) {
      toast.error(t('pianos.couldNotUploadPhotos'));
    } finally {
      setIsUploading(false);
      // Limpiar el input
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (index: number) => {
    if (!confirm(t('pianos.confirmDeletePhoto'))) return;

    try {
      const updatedPhotos = photos.filter((_, i) => i !== index);
      setPhotos(updatedPhotos);

      await updateMutation.mutateAsync({
        id: pianoId,
        photos: updatedPhotos.length > 0 ? updatedPhotos : null,
      });

      toast.success(t('pianos.photoDeleted'));
    } catch (error) {
      toast.error(t('pianos.couldNotDeletePhoto'));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('pianos.photoGallery')}</CardTitle>
        <div>
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            size="sm"
            onClick={() => document.getElementById('photo-upload')?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                {t('common.uploading')}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {t('pianos.addPhotos')}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('pianos.noPhotos')}</p>
            <Button
              variant="outline"
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('pianos.uploadFirstPhoto')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Piano photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeletePhoto(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          {t('pianos.photoUploadHint')}
        </p>
      </CardContent>
    </Card>
  );
}
