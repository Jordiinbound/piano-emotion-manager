import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ArrowLeftRight, X } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { useTranslation } from '@/hooks/use-translation';

interface ComparePhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  beforeImage: string;
  afterImage: string;
  onSwap?: () => void;
}

/**
 * Modal para comparación de fotos antes/después
 * Muestra el BeforeAfterSlider en un modal de pantalla completa
 */
export function ComparePhotosModal({
  isOpen,
  onClose,
  beforeImage,
  afterImage,
  onSwap,
}: ComparePhotosModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {t('pianos.comparePhotos')}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {onSwap && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSwap}
                  className="gap-2"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  {t('pianos.swapPhotos')}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 overflow-hidden">
          <BeforeAfterSlider
            beforeImage={beforeImage}
            afterImage={afterImage}
            beforeLabel={t('pianos.before')}
            afterLabel={t('pianos.after')}
            className="h-full rounded-lg"
          />
        </div>

        <div className="px-6 py-4 border-t bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            {t('pianos.comparePhotosHint')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
