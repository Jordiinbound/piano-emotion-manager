import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { FileText, Plus, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

interface InspectionReportsCardProps {
  pianoId: number;
  clientId: number | null;
}

export default function InspectionReportsCard({ pianoId, clientId }: InspectionReportsCardProps) {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: '',
    overallCondition: 'good' as const,
    findings: '',
    recommendations: '',
  });

  const { data: reports, refetch } = trpc.pianoTechnical.getInspectionReports.useQuery({ pianoId });
  const createMutation = trpc.pianoTechnical.createInspectionReport.useMutation();
  const deleteMutation = trpc.pianoTechnical.deleteInspectionReport.useMutation();
  const generatePDFMutation = trpc.pianoTechnical.generateInspectionPDF.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({
        pianoId,
        clientId: clientId || undefined,
        title: formData.title,
        inspectionDate: formData.inspectionDate,
        inspectorName: formData.inspectorName || undefined,
        overallCondition: formData.overallCondition,
        findings: formData.findings || undefined,
        recommendations: formData.recommendations || undefined,
      });
      toast.success(t('pianos.inspectionReportCreated'));
      setIsDialogOpen(false);
      setFormData({
        title: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectorName: '',
        overallCondition: 'good',
        findings: '',
        recommendations: '',
      });
      refetch();
    } catch (error) {
      toast.error(t('pianos.couldNotCreateInspectionReport'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('pianos.confirmDeleteInspectionReport'))) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success(t('pianos.inspectionReportDeleted'));
      refetch();
    } catch (error) {
      toast.error(t('pianos.couldNotDeleteInspectionReport'));
    }
  };

  const handleGeneratePDF = async (reportId: number) => {
    setIsGeneratingPDF(reportId);
    try {
      const result = await generatePDFMutation.mutateAsync({ reportId });
      
      if (result.success && result.url) {
        // Descargar el PDF
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.filename || 'informe-inspeccion.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(t('pianos.pdfGenerated'));
        refetch();
      }
    } catch (error) {
      toast.error(t('pianos.couldNotGeneratePDF'));
    } finally {
      setIsGeneratingPDF(null);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const conditionColors: Record<string, string> = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    fair: 'bg-yellow-500',
    poor: 'bg-orange-500',
    needs_repair: 'bg-red-500',
  };

  const conditionLabels: Record<string, string> = {
    excellent: t('pianos.excellent'),
    good: t('pianos.good'),
    fair: t('pianos.fair'),
    poor: t('pianos.poor'),
    needs_repair: t('pianos.needsRepair'),
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('pianos.inspectionReports')}</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t('pianos.newInspectionReport')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('pianos.newInspectionReport')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">{t('pianos.reportTitle')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Inspección anual 2026"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inspectionDate">{t('pianos.inspectionDate')} *</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    value={formData.inspectionDate}
                    onChange={(e) => handleChange('inspectionDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="inspectorName">{t('pianos.inspectorName')}</Label>
                  <Input
                    id="inspectorName"
                    value={formData.inspectorName}
                    onChange={(e) => handleChange('inspectorName', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="overallCondition">{t('pianos.overallCondition')} *</Label>
                <select
                  id="overallCondition"
                  value={formData.overallCondition}
                  onChange={(e) => handleChange('overallCondition', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="excellent">{t('pianos.excellent')}</option>
                  <option value="good">{t('pianos.good')}</option>
                  <option value="fair">{t('pianos.fair')}</option>
                  <option value="poor">{t('pianos.poor')}</option>
                  <option value="needs_repair">{t('pianos.needsRepair')}</option>
                </select>
              </div>

              <div>
                <Label htmlFor="findings">{t('pianos.findings')}</Label>
                <Textarea
                  id="findings"
                  value={formData.findings}
                  onChange={(e) => handleChange('findings', e.target.value)}
                  rows={4}
                  placeholder="Hallazgos de la inspección..."
                />
              </div>

              <div>
                <Label htmlFor="recommendations">{t('pianos.recommendations')}</Label>
                <Textarea
                  id="recommendations"
                  value={formData.recommendations}
                  onChange={(e) => handleChange('recommendations', e.target.value)}
                  rows={4}
                  placeholder="Recomendaciones y acciones sugeridas..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('common.creating') : t('common.create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!reports || reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('pianos.noInspectionReports')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(report.inspectionDate).toLocaleDateString()}
                        {report.inspectorName && ` • ${report.inspectorName}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={conditionColors[report.overallCondition]}>
                        {conditionLabels[report.overallCondition]}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleGeneratePDF(report.id)}
                        disabled={isGeneratingPDF === report.id}
                        title={t('pianos.generatePDF')}
                      >
                        <Download className={`h-4 w-4 ${isGeneratingPDF === report.id ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(report.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {report.findings && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">{t('pianos.findings')}:</p>
                      <p className="text-sm text-muted-foreground">{report.findings}</p>
                    </div>
                  )}

                  {report.recommendations && (
                    <div>
                      <p className="text-sm font-medium mb-1">{t('pianos.recommendations')}:</p>
                      <p className="text-sm text-muted-foreground">{report.recommendations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
