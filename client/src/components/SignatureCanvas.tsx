/**
 * SignatureCanvas Component
 * Piano Emotion Manager
 * 
 * Componente reutilizable para capturar firmas digitales
 */

import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Pen, Eraser, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface SignatureCanvasProps {
  onSave: (signatureDataURL: string) => void;
  onCancel?: () => void;
  title?: string;
  existingSignature?: string;
}

export default function SignatureCanvas({
  onSave,
  onCancel,
  title,
  existingSignature,
}: SignatureCanvasProps) {
  const { t } = useTranslation();
  const signaturePadRef = useRef<SignaturePad>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const dataURL = signaturePadRef.current.toDataURL('image/png');
      onSave(dataURL);
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pen className="h-5 w-5" />
          {title || t('signature.title')}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Canvas de firma */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
            {existingSignature ? (
              <div className="relative">
                <img
                  src={existingSignature}
                  alt={t('signature.existing')}
                  className="w-full h-[200px] object-contain"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Limpiar firma existente
                      handleClear();
                    }}
                  >
                    <Eraser className="mr-2 h-4 w-4" />
                    {t('signature.clear')}
                  </Button>
                </div>
              </div>
            ) : (
              <SignaturePad
                ref={signaturePadRef}
                canvasProps={{
                  className: 'w-full h-[200px] cursor-crosshair',
                  style: { touchAction: 'none' },
                }}
                onBegin={handleBegin}
                backgroundColor="rgb(255, 255, 255)"
                penColor="rgb(0, 0, 0)"
              />
            )}
          </div>

          {/* Hint */}
          <p className="text-sm text-muted-foreground text-center">
            {t('signature.hint')}
          </p>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isEmpty && !existingSignature}
              className="flex-1"
            >
              <Eraser className="mr-2 h-4 w-4" />
              {t('signature.clear')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isEmpty && !existingSignature}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              {t('signature.save')}
            </Button>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
