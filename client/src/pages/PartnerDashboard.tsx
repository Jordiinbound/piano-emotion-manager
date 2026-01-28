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

export function PartnerDashboard() {
  const { data: partner, isLoading: partnerLoading } = trpc.partnersV2.getMyPartner.useQuery();
  const { data: codes, isLoading: codesLoading } = trpc.activationCodes.getMyPartnerCodes.useQuery();
  const { data: licenses, isLoading: licensesLoading } = trpc.licenses.getPartnerLicenses.useQuery();

  if (partnerLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos de partner. Contacta con el administrador.
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
        <h1 className="text-3xl font-bold">Dashboard de Partner</h1>
        <p className="text-muted-foreground mt-2">
          {partner.companyName} - {partner.contactEmail}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Códigos Activos
            </CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCodes}</div>
            <p className="text-xs text-muted-foreground">
              {usedCodes} códigos usados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Licencias Activas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLicenses}</div>
            <p className="text-xs text-muted-foreground">
              Clientes usando tu código
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toFixed(2)} {partner.currency || 'EUR'}
            </div>
            <p className="text-xs text-muted-foreground">
              Desde {new Date(partner.createdAt!).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Conversión
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
              Códigos activados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="codes">Códigos de Activación</TabsTrigger>
          <TabsTrigger value="licenses">Licencias Activas</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        {/* Códigos de Activación */}
        <TabsContent value="codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Activación</CardTitle>
              <CardDescription>
                Gestiona los códigos de activación generados para tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {codesLoading ? (
                <p className="text-center text-muted-foreground py-8">Cargando códigos...</p>
              ) : codes && codes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Usos</TableHead>
                      <TableHead>Expira</TableHead>
                      <TableHead>Creado</TableHead>
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
                            {code.status === 'active' ? 'Activo' : code.status === 'used' ? 'Usado' : 'Expirado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {code.usedCount} / {code.maxUses || '∞'}
                        </TableCell>
                        <TableCell>
                          {code.expiresAt 
                            ? new Date(code.expiresAt).toLocaleDateString()
                            : 'Sin expiración'}
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
                  No hay códigos de activación generados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Licencias Activas */}
        <TabsContent value="licenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Licencias de Clientes</CardTitle>
              <CardDescription>
                Clientes que han activado licencias con tus códigos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {licensesLoading ? (
                <p className="text-center text-muted-foreground py-8">Cargando licencias...</p>
              ) : licenses && licenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ciclo</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Expira</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((license) => (
                      <TableRow key={license.id}>
                        <TableCell>#{license.id}</TableCell>
                        <TableCell>
                          Usuario #{license.userId}
                        </TableCell>
                        <TableCell>
                          <Badge variant={license.status === 'active' ? 'default' : 'secondary'}>
                            {license.status === 'active' ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {license.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
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
                  No hay licencias activas de clientes
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
                <CardTitle>Resumen de Actividad</CardTitle>
                <CardDescription>
                  Estadísticas generales de tu cuenta partner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total de Códigos Generados</span>
                  <span className="text-2xl font-bold">{codes?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Códigos Activos</span>
                  <span className="text-2xl font-bold text-green-600">{activeCodes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Códigos Usados</span>
                  <span className="text-2xl font-bold text-blue-600">{usedCodes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Licencias Activas</span>
                  <span className="text-2xl font-bold text-purple-600">{activeLicenses}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información del Partner</CardTitle>
                <CardDescription>
                  Detalles de tu cuenta y configuración
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                  <p className="text-lg font-semibold">{partner.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email de Contacto</p>
                  <p className="text-lg">{partner.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">URL del Ecommerce</p>
                  <p className="text-lg text-blue-600 break-all">
                    {partner.ecommerceUrl || 'No configurado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Miembro desde</p>
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
