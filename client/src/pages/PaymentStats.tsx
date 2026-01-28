/**
 * Payment Statistics Dashboard
 * Piano Emotion Manager
 * 
 * Dashboard de estadísticas de pagos y facturación
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, DollarSign, FileText, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useTranslation } from '@/hooks/use-translation';

export default function PaymentStats() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Obtener estadísticas
  const { data: stats, isLoading } = trpc.invoices.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = stats?.total || 0;
  const pendingAmount = stats?.pending || 0;
  const paidAmount = stats?.paid || 0;
  const draftCount = stats?.draft || 0;
  const totalCount = stats?.count || 0;
  
  // Calcular valores derivados
  const overdueAmount = 0; // No tenemos esta métrica aún
  const paidCount = 0; // No tenemos contadores por estado
  const sentCount = 0;

  // Calcular porcentajes
  const paidPercentage = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
  const sentPercentage = totalCount > 0 ? (sentCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('paymentStats.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('paymentStats.description')}
          </p>
        </div>

        {/* Selector de rango de tiempo */}
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            {t('paymentStats.week')}
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            {t('paymentStats.month')}
          </Button>
          <Button
            variant={timeRange === 'quarter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('quarter')}
          >
            {t('paymentStats.quarter')}
          </Button>
          <Button
            variant={timeRange === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('year')}
          >
            {t('paymentStats.year')}
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ingresos totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('paymentStats.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {t('paymentStats.paidInvoices', { count: paidCount })}
            </p>
          </CardContent>
        </Card>

        {/* Pendiente de cobro */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('paymentStats.pendingCollection')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">€{pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {t('paymentStats.sentInvoices', { count: sentCount })}
            </p>
          </CardContent>
        </Card>

        {/* Facturas vencidas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('paymentStats.overdueInvoices')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{overdueAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {t('paymentStats.requireAttention')}
            </p>
          </CardContent>
        </Card>

        {/* Total de facturas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('paymentStats.totalInvoices')}</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {t('paymentStats.drafts', { count: draftCount })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de facturas */}
        <Card>
          <CardHeader>
            <CardTitle>{t('paymentStats.invoiceStatus')}</CardTitle>
            <CardDescription>{t('paymentStats.distributionByStatus')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pagadas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{t('paymentStats.paid')}</span>
                </div>
                <span className="text-sm font-bold text-green-600">{paidCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${paidPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('paymentStats.percentOfTotal', { percent: paidPercentage.toFixed(1) })}</p>
            </div>

            {/* Enviadas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">{t('paymentStats.sent')}</span>
                </div>
                <span className="text-sm font-bold text-yellow-600">{sentCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all"
                  style={{ width: `${sentPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('paymentStats.percentOfTotal', { percent: sentPercentage.toFixed(1) })}</p>
            </div>

            {/* Borradores */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{t('paymentStats.drafts', { count: draftCount })}</span>
                </div>
                <span className="text-sm font-bold text-gray-600">{draftCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-600 h-2 rounded-full transition-all"
                  style={{ width: `${totalCount > 0 ? (draftCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('paymentStats.percentOfTotal', { percent: totalCount > 0 ? ((draftCount / totalCount) * 100).toFixed(1) : '0' })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resumen financiero */}
        <Card>
          <CardHeader>
            <CardTitle>{t('paymentStats.financialSummary')}</CardTitle>
            <CardDescription>{t('paymentStats.revenueAndPendingAnalysis')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-green-700 font-medium">{t('paymentStats.totalRevenue')}</p>
                <p className="text-2xl font-bold text-green-900">€{totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm text-yellow-700 font-medium">{t('paymentStats.pendingCollection')}</p>
                <p className="text-2xl font-bold text-yellow-900">€{pendingAmount.toFixed(2)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-red-700 font-medium">{t('paymentStats.overdueInvoices')}</p>
                <p className="text-2xl font-bold text-red-900">€{overdueAmount.toFixed(2)}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>

            {/* Tasa de cobro */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{t('paymentStats.collectionRate')}</span>
                <span className="text-lg font-bold text-blue-600">
                  {totalCount > 0 ? ((paidCount / totalCount) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${paidPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>{t('paymentStats.nextSteps')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overdueAmount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">{t('paymentStats.overdueInvoicesPending')}</p>
                <p className="text-sm text-red-700">
                  {t('paymentStats.overdueInvoicesMessage', { amount: overdueAmount.toFixed(2) })}
                </p>
              </div>
            </div>
          )}

          {sentCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">{t('paymentStats.pendingPaymentInvoices')}</p>
                <p className="text-sm text-yellow-700">
                  {t('paymentStats.pendingPaymentMessage', { count: sentCount, amount: pendingAmount.toFixed(2) })}
                </p>
              </div>
            </div>
          )}

          {draftCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">{t('paymentStats.pendingDrafts')}</p>
                <p className="text-sm text-blue-700">
                  {t('paymentStats.pendingDraftsMessage', { count: draftCount })}
                </p>
              </div>
            </div>
          )}

          {overdueAmount === 0 && sentCount === 0 && draftCount === 0 && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">{t('paymentStats.allUpToDate')}</p>
                <p className="text-sm text-green-700">
                  {t('paymentStats.allUpToDateMessage')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
