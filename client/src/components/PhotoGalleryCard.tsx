import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Image as ImageIcon, Plus, Trash2, Upload, ArrowLeftRight, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import { PhotoLightbox } from './PhotoLightbox';
import { ComparePhotosModal } from './ComparePhotosModal';

interface PhotoGalleryCardProps {
  pianoId: number;
  photos: string[] | null;
}

export default function PhotoGalleryCard({ pianoId, photos: initialPhotos }: PhotoGalleryCardProps) {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<string[]>(initialPhotos || []);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Estados para modo de comparación
  const [compareMode, setCompareMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareImages, setCompareImages] = useState<{ before: string; after: string } | null>(null);

  const uploadMutation = trpc.pianos.uploadPianoPhoto.useMutation();
  const deleteMutation = trpc.pianos.deletePianoPhoto.useMutation();

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

        // Subir foto a R2 usando el endpoint tRPC
        const result = await uploadMutation.mutateAsync({
          pianoId,
          photoBase64: base64,
          filename: file.name,
        });

        if (result.success && result.url) {
          newPhotoUrls.push(result.url);
        }
      }

      // Actualizar estado local con las nuevas URLs de R2
      const updatedPhotos = [...photos, ...newPhotoUrls];
      setPhotos(updatedPhotos);

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

    const photoUrl = photos[index];
    
    try {
      // Eliminar de R2 y actualizar BD
      await deleteMutation.mutateAsync({
        pianoId,
        photoUrl,
      });

      // Actualizar estado local
      const updatedPhotos = photos.filter((_, i) => i !== index);
      setPhotos(updatedPhotos);

      toast.success(t('pianos.photoDeleted'));
    } catch (error) {
      toast.error(t('pianos.couldNotDeletePhoto'));
    }
  };

  // Funciones para modo de comparación
  const handleToggleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedPhotos([]);
  };

  const handleSelectPhoto = (index: number) => {
    if (!compareMode) return;

    if (selectedPhotos.includes(index)) {
      // Deseleccionar foto
      setSelectedPhotos(selectedPhotos.filter((i) => i !== index));
    } else if (selectedPhotos.length < 2) {
      // Seleccionar foto (máximo 2)
      setSelectedPhotos([...selectedPhotos, index]);
    } else {
      toast.error(t('pianos.maxTwoPhotos'));
    }
  };

  const handleComparePhotos = () => {
    if (selectedPhotos.length !== 2) {
      toast.error(t('pianos.selectTwoPhotos'));
      return;
    }

    setCompareImages({
      before: photos[selectedPhotos[0]],
      after: photos[selectedPhotos[1]],
    });
    setCompareModalOpen(true);
  };

  const handleSwapComparePhotos = () => {
    if (!compareImages) return;
    setCompareImages({
      before: compareImages.after,
      after: compareImages.before,
    });
  };

  const handleCancelCompare = () => {
    setCompareMode(false);
    setSelectedPhotos([]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('pianos.photoGallery')}</CardTitle>
        <div className="flex items-center gap-2">
          {compareMode ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelCompare}
              >
                <X className="mr-2 h-4 w-4" />
                {t('common.cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleComparePhotos}
                disabled={selectedPhotos.length !== 2}
              >
                <Check className="mr-2 h-4 w-4" />
                {t('pianos.compare')} ({selectedPhotos.length}/2)
              </Button>
            </>
          ) : (
            <>
              {photos.length >= 2 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleCompareMode}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  {t('pianos.comparePhotos')}
                </Button>
              )}
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
            </>
          )}
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
            {photos.map((photo, index) => {
              const isSelected = selectedPhotos.includes(index);
              const selectionOrder = selectedPhotos.indexOf(index) + 1;
              
              return (
                <div 
                  key={index} 
                  className={`relative group ${
                    compareMode ? 'cursor-pointer' : ''
                  } ${
                    isSelected ? 'ring-4 ring-primary rounded-lg' : ''
                  }`}
                  onClick={() => {
                    if (compareMode) {
                      handleSelectPhoto(index);
                    } else {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }
                  }}
                >
                  <img
                    src={photo}
                    alt={`Piano photo ${index + 1}`}
                    className={`w-full h-48 object-cover rounded-lg border ${
                      compareMode ? 'cursor-pointer' : 'cursor-pointer'
                    } ${
                      isSelected ? 'opacity-90' : ''
                    }`}
                  />
                  
                  {/* Indicador de selección en modo comparación */}
                  {compareMode && isSelected && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shadow-lg">
                      {selectionOrder}
                    </div>
                  )}
                  
                  {/* Botón de eliminar (solo visible cuando NO está en modo comparación) */}
                  {!compareMode && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(index);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Overlay de selección en modo comparación */}
                  {compareMode && isSelected && (
                    <div className="absolute inset-0 rounded-lg transition-all bg-primary/20 border-4 border-primary" />
                  )}
                  {compareMode && !isSelected && (
                    <div className="absolute inset-0 rounded-lg transition-all hover:bg-primary/10" />
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          {t('pianos.photoUploadHint')}
        </p>
      </CardContent>
      
      {/* Lightbox para visualización ampliada con zoom */}
      <PhotoLightbox
        photos={photos}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
      
      {/* Modal de comparación antes/después */}
      {compareImages && (
        <ComparePhotosModal
          isOpen={compareModalOpen}
          onClose={() => setCompareModalOpen(false)}
          beforeImage={compareImages.before}
          afterImage={compareImages.after}
          onSwap={handleSwapComparePhotos}
        />
      )}
    </Card>
  );
}
