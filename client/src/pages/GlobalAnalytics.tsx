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

export function GlobalAnalytics() {
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
        <h1 className="text-3xl font-bold">Analytics Global</h1>
        <p className="text-muted-foreground mt-2">
          Métricas clave del negocio y tendencias
        </p>
      </div>

      {/* Métricas Clave */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : formatCurrency(metrics?.mrr || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly Recurring Revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licencias Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : metrics?.activeLicenses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{metrics?.newLicenses || 0} en los últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : `${metrics?.churnRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.canceledLicenses || 0} cancelaciones en 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : formatCurrency(metrics?.ltv || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime Value estimado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos (30 días)</CardTitle>
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
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
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
            <CardTitle className="text-sm font-medium">Conversión Códigos</CardTitle>
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
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="partners">Top Partners</TabsTrigger>
        </TabsList>

        {/* Tendencias */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Licencias por Mes</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <p className="text-center text-muted-foreground py-8">Cargando...</p>
                ) : trends && trends.licensesByMonth.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mes</TableHead>
                        <TableHead className="text-right">Licencias</TableHead>
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
                  <p className="text-center text-muted-foreground py-8">Sin datos</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Mes</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <p className="text-center text-muted-foreground py-8">Cargando...</p>
                ) : trends && trends.revenueByMonth.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mes</TableHead>
                        <TableHead className="text-right">Ingresos</TableHead>
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
                  <p className="text-center text-muted-foreground py-8">Sin datos</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribución */}
        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Tipo de Licencia</CardTitle>
              <CardDescription>Licencias activas</CardDescription>
            </CardHeader>
            <CardContent>
              {distributionLoading ? (
                <p className="text-center text-muted-foreground py-8">Cargando...</p>
              ) : distribution && distribution.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
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
                <p className="text-center text-muted-foreground py-8">Sin datos</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Partners */}
        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Partners</CardTitle>
              <CardDescription>Por licencias activas</CardDescription>
            </CardHeader>
            <CardContent>
              {partnersLoading ? (
                <p className="text-center text-muted-foreground py-8">Cargando...</p>
              ) : topPartners && topPartners.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead className="text-right">Licencias Activas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPartners.map((partner, index) => (
                      <TableRow key={partner.partnerId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">#{index + 1}</span>
                            <span className="font-medium">{partner.partnerName || `Partner #${partner.partnerId}`}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold">{partner.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">Sin datos</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
