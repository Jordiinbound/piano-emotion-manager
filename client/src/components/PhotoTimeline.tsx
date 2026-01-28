import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import { PhotoLightbox } from './PhotoLightbox';
import { useTranslation } from '@/hooks/use-translation';

interface PhotoTimelineItem {
  url: string;
  date: Date;
  description?: string;
}

interface PhotoTimelineProps {
  photos: string[]; // Array de URLs de fotos
  title?: string;
}

/**
 * Timeline fotográfico con visualización cronológica
 * Agrupa fotos por fecha y las muestra en orden cronológico
 */
export function PhotoTimeline({ photos, title }: PhotoTimelineProps) {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Agrupar fotos por fecha (por ahora usamos fecha actual, en el futuro se puede extraer de metadata)
  const groupedPhotos = React.useMemo(() => {
    const groups: { [key: string]: PhotoTimelineItem[] } = {};
    
    photos.forEach((url) => {
      // TODO: Extraer fecha real de metadata de la foto o de la base de datos
      // Por ahora usamos la fecha actual como placeholder
      const date = new Date();
      const dateKey = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push({
        url,
        date,
      });
    });
    
    // Ordenar grupos por fecha (más reciente primero)
    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[1][0].date);
      const dateB = new Date(b[1][0].date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [photos]);

  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || t('pianos.photoTimeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('pianos.noPhotosInTimeline')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title || t('pianos.photoTimeline')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {groupedPhotos.map(([dateKey, items], groupIndex) => (
              <div key={dateKey} className="relative">
                {/* Línea vertical del timeline */}
                {groupIndex < groupedPhotos.length - 1 && (
                  <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-border" />
                )}
                
                {/* Fecha */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{dateKey}</h3>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">
                    {items.length} {items.length === 1 ? t('pianos.photo') : t('pianos.photos')}
                  </span>
                </div>
                
                {/* Grid de fotos */}
                <div className="ml-11 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((item, itemIndex) => {
                    const globalIndex = photos.indexOf(item.url);
                    return (
                      <div
                        key={itemIndex}
                        className="relative group cursor-pointer"
                        onClick={() => {
                          setLightboxIndex(globalIndex);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={item.url}
                          alt={`Photo ${globalIndex + 1}`}
                          className="w-full h-40 object-cover rounded-lg border transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Lightbox para visualización ampliada */}
      <PhotoLightbox
        photos={photos}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
    </>
  );
}
