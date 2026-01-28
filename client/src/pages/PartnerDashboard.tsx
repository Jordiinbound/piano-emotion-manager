import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Key, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/use-translation";

export function PartnerDashboard() {
  const { t } = useTranslation();
  const { data: partner, isLoading: partnerLoading } = trpc.partnersV2.getMyPartner.useQuery();
  const { data: codes, isLoading: codesLoading } = trpc.activationCodes.getMyPartnerCodes.useQuery();
  const { data: licenses, isLoading: licensesLoading } = trpc.licenses.getPartnerLicenses.useQuery();

  if (partnerLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('partnerDashboard.loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('partnerDashboard.accessDenied')}</CardTitle>
            <CardDescription>
              {t('partnerDashboard.noPartnerPermissions')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const activeCodes = codes?.filter(c => c.status === 'active').length || 0;
  const usedCodes = codes?.filter(c => c.status === 'used').length || 0;
  const activeLicenses = licenses?.filter(l => l.status === 'active').length || 0;
  const totalRevenue = licenses?.reduce((sum, l) => sum + parseFloat(l.price), 0) || 0;

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('partnerDashboard.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {partner.companyName} - {partner.contactEmail}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('partnerDashboard.activeCodes')}
            </CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCodes}</div>
            <p className="text-xs text-muted-foreground">
              {t('partnerDashboard.usedCodes', { count: usedCodes })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('partnerDashboard.activeLicenses')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLicenses}</div>
            <p className="text-xs text-muted-foreground">
              {t('partnerDashboard.clientsUsingCode')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('partnerDashboard.totalRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toFixed(2)} {partner.currency || 'EUR'}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('partnerDashboard.since', { date: new Date(partner.createdAt!).toLocaleDateString() })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('partnerDashboard.conversionRate')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {codes && codes.length > 0 
                ? ((usedCodes / codes.length) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t('partnerDashboard.activatedCodes')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="codes">{t('partnerDashboard.activationCodes')}</TabsTrigger>
          <TabsTrigger value="licenses">{t('partnerDashboard.activeLicenses')}</TabsTrigger>
          <TabsTrigger value="stats">{t('partnerDashboard.statistics')}</TabsTrigger>
        </TabsList>

        {/* Códigos de Activación */}
        <TabsContent value="codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('partnerDashboard.activationCodes')}</CardTitle>
              <CardDescription>
                {t('partnerDashboard.manageActivationCodes')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {codesLoading ? (
                <p className="text-center text-muted-foreground py-8">{t('partnerDashboard.loadingCodes')}</p>
              ) : codes && codes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('partnerDashboard.code')}</TableHead>
                      <TableHead>{t('partnerDashboard.status')}</TableHead>
                      <TableHead>{t('partnerDashboard.uses')}</TableHead>
                      <TableHead>{t('partnerDashboard.expires')}</TableHead>
                      <TableHead>{t('partnerDashboard.created')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono font-medium">
                          {code.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant={code.status === 'active' ? 'default' : code.status === 'used' ? 'secondary' : 'destructive'}>
                            {code.status === 'active' ? t('partnerDashboard.active') : code.status === 'used' ? t('partnerDashboard.used') : t('partnerDashboard.expired')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {code.usedCount} / {code.maxUses || '∞'}
                        </TableCell>
                        <TableCell>
                          {code.expiresAt 
                            ? new Date(code.expiresAt).toLocaleDateString()
                            : t('partnerDashboard.noExpiration')}
                        </TableCell>
                        <TableCell>
                          {new Date(code.createdAt!).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('partnerDashboard.noActivationCodes')}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Licencias Activas */}
        <TabsContent value="licenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('partnerDashboard.clientLicenses')}</CardTitle>
              <CardDescription>
                {t('partnerDashboard.clientsActivatedLicenses')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {licensesLoading ? (
                <p className="text-center text-muted-foreground py-8">{t('partnerDashboard.loadingLicenses')}</p>
              ) : licenses && licenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('partnerDashboard.id')}</TableHead>
                      <TableHead>{t('partnerDashboard.user')}</TableHead>
                      <TableHead>{t('partnerDashboard.status')}</TableHead>
                      <TableHead>{t('partnerDashboard.cycle')}</TableHead>
                      <TableHead>{t('partnerDashboard.price')}</TableHead>
                      <TableHead>{t('partnerDashboard.expires')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((license) => (
                      <TableRow key={license.id}>
                        <TableCell>#{license.id}</TableCell>
                        <TableCell>
                          {t('partnerDashboard.userNumber', { id: license.userId })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={license.status === 'active' ? 'default' : 'secondary'}>
                            {license.status === 'active' ? t('partnerDashboard.active') : t('partnerDashboard.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {license.billingCycle === 'monthly' ? t('partnerDashboard.monthly') : t('partnerDashboard.annual')}
                        </TableCell>
                        <TableCell>
                          {license.price} {license.currency}
                        </TableCell>
                        <TableCell>
                          {license.expiresAt 
                            ? new Date(license.expiresAt).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('partnerDashboard.noActiveLicenses')}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estadísticas */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('partnerDashboard.activitySummary')}</CardTitle>
                <CardDescription>
                  {t('partnerDashboard.generalStatistics')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('partnerDashboard.totalCodesGenerated')}</span>
                  <span className="text-2xl font-bold">{codes?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('partnerDashboard.activeCodes')}</span>
                  <span className="text-2xl font-bold text-green-600">{activeCodes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('partnerDashboard.codesUsed')}</span>
                  <span className="text-2xl font-bold text-blue-600">{usedCodes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('partnerDashboard.activeLicenses')}</span>
                  <span className="text-2xl font-bold text-purple-600">{activeLicenses}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('partnerDashboard.partnerInformation')}</CardTitle>
                <CardDescription>
                  {t('partnerDashboard.accountDetails')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('partnerDashboard.company')}</p>
                  <p className="text-lg font-semibold">{partner.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('partnerDashboard.contactEmail')}</p>
                  <p className="text-lg">{partner.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('partnerDashboard.ecommerceUrl')}</p>
                  <p className="text-lg text-blue-600 break-all">
                    {partner.ecommerceUrl || t('partnerDashboard.notConfigured')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('partnerDashboard.memberSince')}</p>
                  <p className="text-lg">
                    {new Date(partner.createdAt!).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
