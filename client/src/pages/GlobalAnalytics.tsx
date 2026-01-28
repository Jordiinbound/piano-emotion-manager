import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, BarChart3, Target, Percent } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/hooks/use-translation";

export function GlobalAnalytics() {
  const { t } = useTranslation();
  const { data: metrics, isLoading: metricsLoading } = trpc.analytics.getGlobalMetrics.useQuery();
  const { data: trends, isLoading: trendsLoading } = trpc.analytics.getTimeTrends.useQuery();
  const { data: distribution, isLoading: distributionLoading } = trpc.analytics.getLicenseDistribution.useQuery();
  const { data: topPartners, isLoading: partnersLoading } = trpc.analytics.getTopPartners.useQuery({ limit: 10 });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('globalAnalytics.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('globalAnalytics.description')}
        </p>
      </div>

      {/* Métricas Clave */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('globalAnalytics.mrr')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : formatCurrency(metrics?.mrr || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('globalAnalytics.monthlyRecurringRevenue')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('globalAnalytics.activeLicenses')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : metrics?.activeLicenses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('globalAnalytics.newInLast30Days', { count: metrics?.newLicenses || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('globalAnalytics.churnRate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : `${metrics?.churnRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('globalAnalytics.cancellationsIn30Days', { count: metrics?.canceledLicenses || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('globalAnalytics.ltv')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : formatCurrency(metrics?.ltv || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('globalAnalytics.estimatedLifetimeValue')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('globalAnalytics.revenue30Days')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : formatCurrency(metrics?.revenue30Days || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('globalAnalytics.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : metrics?.totalUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('globalAnalytics.codeConversion')}</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : `${metrics?.conversionRate || 0}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con Detalles */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">{t('globalAnalytics.trends')}</TabsTrigger>
          <TabsTrigger value="distribution">{t('globalAnalytics.distribution')}</TabsTrigger>
          <TabsTrigger value="partners">{t('globalAnalytics.topPartners')}</TabsTrigger>
        </TabsList>

        {/* Tendencias */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('globalAnalytics.licensesByMonth')}</CardTitle>
                <CardDescription>{t('globalAnalytics.last6Months')}</CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <p className="text-center text-muted-foreground py-8">{t('globalAnalytics.loading')}</p>
                ) : trends && trends.licensesByMonth.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('globalAnalytics.month')}</TableHead>
                        <TableHead className="text-right">{t('globalAnalytics.licenses')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trends.licensesByMonth.map((item) => (
                        <TableRow key={item.month}>
                          <TableCell>{item.month}</TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t('globalAnalytics.noData')}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('globalAnalytics.revenueByMonth')}</CardTitle>
                <CardDescription>{t('globalAnalytics.last6Months')}</CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <p className="text-center text-muted-foreground py-8">{t('globalAnalytics.loading')}</p>
                ) : trends && trends.revenueByMonth.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('globalAnalytics.month')}</TableHead>
                        <TableHead className="text-right">{t('globalAnalytics.revenue')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trends.revenueByMonth.map((item) => (
                        <TableRow key={item.month}>
                          <TableCell>{item.month}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t('globalAnalytics.noData')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribución */}
        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('globalAnalytics.distributionByLicenseType')}</CardTitle>
              <CardDescription>{t('globalAnalytics.activeLicenses')}</CardDescription>
            </CardHeader>
            <CardContent>
              {distributionLoading ? (
                <p className="text-center text-muted-foreground py-8">{t('globalAnalytics.loading')}</p>
              ) : distribution && distribution.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('globalAnalytics.type')}</TableHead>
                      <TableHead className="text-right">{t('globalAnalytics.quantity')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distribution.map((item) => (
                      <TableRow key={item.type}>
                        <TableCell className="font-medium capitalize">{item.type}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">{t('globalAnalytics.noData')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Partners */}
        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('globalAnalytics.top10Partners')}</CardTitle>
              <CardDescription>{t('globalAnalytics.byActiveLicenses')}</CardDescription>
            </CardHeader>
            <CardContent>
              {partnersLoading ? (
                <p className="text-center text-muted-foreground py-8">{t('globalAnalytics.loading')}</p>
              ) : topPartners && topPartners.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('globalAnalytics.partner')}</TableHead>
                      <TableHead className="text-right">{t('globalAnalytics.activeLicenses')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPartners.map((partner, index) => (
                      <TableRow key={partner.partnerId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">#{index + 1}</span>
                            <span className="font-medium">{partner.partnerName || t('globalAnalytics.partnerNumber', { id: partner.partnerId })}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold">{partner.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">{t('globalAnalytics.noData')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
