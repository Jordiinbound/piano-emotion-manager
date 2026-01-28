import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Edit, FileText, Image, Wrench, Calendar } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import TechnicalDataCard from '../components/TechnicalDataCard';
import InspectionReportsCard from '../components/InspectionReportsCard';
import PhotoGalleryCard from '../components/PhotoGalleryCard';
import { PhotoTimeline } from '../components/PhotoTimeline';

export default function PianoDetalle() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams();
  const pianoId = Number(params.id);
  
  const { data: piano, isLoading } = trpc.pianos.getPianoById.useQuery({ id: pianoId });
  const { data: client } = trpc.clients.getClientById.useQuery(
    { id: piano?.clientId || 0 },
    { enabled: !!piano?.clientId }
  );

  if (isLoading) {
    return <div className="container mx-auto py-6">{t('common.loading')}</div>;
  }

  if (!piano) {
    return <div className="container mx-auto py-6">{t('pianos.pianoNotFound')}</div>;
  }

  const conditionLabels: Record<string, string> = {
    excellent: t('pianos.excellent'),
    good: t('pianos.good'),
    fair: t('pianos.fair'),
    poor: t('pianos.poor'),
    needs_repair: t('pianos.needsRepair'),
  };

  const categoryLabels: Record<string, string> = {
    vertical: t('pianos.vertical'),
    grand: t('pianos.grand'),
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => setLocation('/pianos')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('pianos.backToPianos')}
          </Button>
          <h1 className="text-3xl font-bold">
            {piano.brand} {piano.model || ''}
          </h1>
          <p className="text-muted-foreground mt-1">
            {client?.name || t('pianos.unknownClient')}
          </p>
        </div>
        <Button onClick={() => setLocation(`/pianos/${pianoId}/editar`)}>
          <Edit className="mr-2 h-4 w-4" />
          {t('common.edit')}
        </Button>
      </div>

      {/* Información general */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('pianos.generalInformation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('pianos.brand')}</p>
              <p className="font-medium">{piano.brand}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('pianos.model')}</p>
              <p className="font-medium">{piano.model || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('pianos.serialNumber')}</p>
              <p className="font-medium">{piano.serialNumber || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('pianos.category')}</p>
              <p className="font-medium">{categoryLabels[piano.category || 'vertical'] || piano.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('pianos.condition')}</p>
              <p className="font-medium">{conditionLabels[piano.condition || 'good'] || piano.condition}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('pianos.location')}</p>
              <p className="font-medium">{piano.location || '-'}</p>
            </div>
          </div>
          {piano.notes && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{t('pianos.notes')}</p>
              <p className="mt-1">{piano.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs para secciones adicionales */}
      <Tabs defaultValue="technical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="technical">
            <Wrench className="mr-2 h-4 w-4" />
            {t('pianos.technicalData')}
          </TabsTrigger>
          <TabsTrigger value="inspections">
            <FileText className="mr-2 h-4 w-4" />
            {t('pianos.inspectionReports')}
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Image className="mr-2 h-4 w-4" />
            {t('pianos.photoGallery')}
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Calendar className="mr-2 h-4 w-4" />
            {t('pianos.photoTimeline')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="mt-6">
          <TechnicalDataCard pianoId={pianoId} />
        </TabsContent>

        <TabsContent value="inspections" className="mt-6">
          <InspectionReportsCard pianoId={pianoId} clientId={piano.clientId} />
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <PhotoGalleryCard pianoId={pianoId} photos={piano.photos as string[] | null} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <PhotoTimeline photos={(piano.photos as string[]) || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
