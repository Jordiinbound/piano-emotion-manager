import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Calendar, DollarSign } from "lucide-react";

export function LicensesAdmin() {
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
          <div className="text-muted-foreground">Cargando licencias...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Licencias</h1>
        <p className="text-muted-foreground">
          Todas las licencias activas, expiradas y canceladas del sistema
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="expired">Expiradas</SelectItem>
                <SelectItem value="suspended">Suspendidas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select
              value={typeFilter || "all"}
              onValueChange={(value) => setTypeFilter(value === "all" ? undefined : value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="direct">Directas</SelectItem>
                <SelectItem value="partner">De Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licencias</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
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
            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
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
          <CardTitle>Licencias</CardTitle>
          <CardDescription>
            {data?.total} licencias en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron licencias con los filtros seleccionados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario/Org</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Activada</TableHead>
                  <TableHead>Expira</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.licenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono text-sm">#{license.id}</TableCell>
                    <TableCell>
                      {license.userId ? `Usuario #${license.userId}` : `Org #${license.organizationId}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={license.licenseType === 'direct' ? 'default' : 'secondary'}>
                        {license.licenseType === 'direct' ? 'Directa' : 'Partner'}
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
                      {license.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
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
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {Math.ceil(data.total / data.limit)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(data.total / data.limit)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
