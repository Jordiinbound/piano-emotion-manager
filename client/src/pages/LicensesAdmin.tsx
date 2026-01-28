import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Calendar, DollarSign } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function LicensesAdmin() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"active" | "expired" | "suspended" | "cancelled" | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<"direct" | "partner" | undefined>(undefined);

  const { data, isLoading } = trpc.licenses.list.useQuery({
    page,
    limit: 20,
    status: statusFilter,
    licenseType: typeFilter,
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t('licensesAdmin.loadingLicenses')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('licensesAdmin.title')}</h1>
        <p className="text-muted-foreground">
          {t('licensesAdmin.description')}
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>{t('licensesAdmin.filters')}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('licensesAdmin.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('licensesAdmin.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('licensesAdmin.active')}</SelectItem>
                <SelectItem value="expired">{t('licensesAdmin.expired')}</SelectItem>
                <SelectItem value="suspended">{t('licensesAdmin.suspended')}</SelectItem>
                <SelectItem value="cancelled">{t('licensesAdmin.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select
              value={typeFilter || "all"}
              onValueChange={(value) => setTypeFilter(value === "all" ? undefined : value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('licensesAdmin.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('licensesAdmin.allTypes')}</SelectItem>
                <SelectItem value="direct">{t('licensesAdmin.direct')}</SelectItem>
                <SelectItem value="partner">{t('licensesAdmin.partner')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('licensesAdmin.totalLicenses')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('licensesAdmin.active')}</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {data?.licenses.filter(l => l.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('licensesAdmin.monthlyRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {data?.licenses
                .filter(l => l.status === 'active' && l.billingCycle === 'monthly')
                .reduce((sum, l) => sum + parseFloat(l.price), 0)
                .toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Licencias */}
      <Card>
        <CardHeader>
          <CardTitle>{t('licensesAdmin.licenses')}</CardTitle>
          <CardDescription>
            {t('licensesAdmin.totalLicensesCount', { count: data?.total || 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('licensesAdmin.noLicensesFound')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('licensesAdmin.id')}</TableHead>
                  <TableHead>{t('licensesAdmin.userOrg')}</TableHead>
                  <TableHead>{t('licensesAdmin.type')}</TableHead>
                  <TableHead>{t('licensesAdmin.status')}</TableHead>
                  <TableHead>{t('licensesAdmin.cycle')}</TableHead>
                  <TableHead>{t('licensesAdmin.price')}</TableHead>
                  <TableHead>{t('licensesAdmin.activated')}</TableHead>
                  <TableHead>{t('licensesAdmin.expires')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.licenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono text-sm">#{license.id}</TableCell>
                    <TableCell>
                      {license.userId ? t('licensesAdmin.userNumber', { id: license.userId }) : t('licensesAdmin.orgNumber', { id: license.organizationId })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={license.licenseType === 'direct' ? 'default' : 'secondary'}>
                        {license.licenseType === 'direct' ? t('licensesAdmin.direct') : t('licensesAdmin.partner')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          license.status === 'active' ? 'default' :
                          license.status === 'expired' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {license.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {license.billingCycle === 'monthly' ? t('licensesAdmin.monthly') : t('licensesAdmin.annual')}
                    </TableCell>
                    <TableCell>
                      {parseFloat(license.price).toFixed(2)} {license.currency}
                    </TableCell>
                    <TableCell>
                      {new Date(license.activatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Paginación */}
          {data && data.total > data.limit && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('licensesAdmin.previous')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('licensesAdmin.pageOf', { current: page, total: Math.ceil(data.total / data.limit) })}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(data.total / data.limit)}
              >
                {t('licensesAdmin.next')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
