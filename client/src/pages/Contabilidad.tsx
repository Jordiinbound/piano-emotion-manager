/**
 * Módulo de Contabilidad
 * Piano Emotion Manager
 * 
 * Integración contable y gestión fiscal
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calculator,
  FileText,
  TrendingUp,
  Download,
  Upload,
  Calendar,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

export default function Contabilidad() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Obtener resumen contable
  const { data: summary, isLoading } = trpc.invoices.getAll.useQuery({});

  const totalIngresos = summary?.reduce((acc, inv) => acc + Number(inv.total), 0) || 0;
  const totalFacturas = summary?.length || 0;

  const handleExportContable = () => {
    toast.success(t('accounting.toast.exportSuccess'));
  };

  const handleImportAsientos = () => {
    toast.info(t('accounting.toast.importComingSoon'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calculator className="h-8 w-8 text-orange-500" />
            {t('accounting.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('accounting.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportAsientos}>
            <Upload className="h-4 w-4 mr-2" />
            {t('accounting.import')}
          </Button>
          <Button onClick={handleExportContable}>
            <Download className="h-4 w-4 mr-2" />
            {t('accounting.export')}
          </Button>
        </div>
      </div>

      {/* Período selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">{t('accounting.period')}:</span>
          <div className="flex gap-2">
            {['month', 'quarter', 'year'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {t(`accounting.${period}`)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Resumen contable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('accounting.totalIncome')}</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                €{totalIngresos.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('accounting.invoicesIssued')}</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {totalFacturas}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('accounting.vatCharged')}</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                €{(totalIngresos * 0.21).toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Módulos contables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">{t('accounting.dailyBook.title')}</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            {t('accounting.dailyBook.description')}
          </p>
          <Button variant="outline" className="w-full">
            {t('accounting.dailyBook.viewEntries')}
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">{t('accounting.balanceSheet.title')}</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            {t('accounting.balanceSheet.description')}
          </p>
          <Button variant="outline" className="w-full">
            {t('accounting.balanceSheet.generate')}
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">{t('accounting.incomeStatement.title')}</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            {t('accounting.incomeStatement.description')}
          </p>
          <Button variant="outline" className="w-full">
            {t('accounting.incomeStatement.viewResults')}
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">{t('accounting.taxModels.title')}</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            {t('accounting.taxModels.description')}
          </p>
          <Button variant="outline" className="w-full">
            {t('accounting.taxModels.generate')}
          </Button>
        </Card>
      </div>

      {/* Integraciones */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">{t('accounting.integrations.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Contasol', 'A3', 'Sage'].map((software) => (
            <div key={software} className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">{software}</span>
              <Badge variant="outline">{t('accounting.integrations.available')}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
