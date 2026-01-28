import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building2, Package, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export function PartnersAdmin() {
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddLicensesDialogOpen, setIsAddLicensesDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.partnersV2.list.useQuery({ page, limit: 20 });
  const createMutation = trpc.partnersV2.create.useMutation({
    onSuccess: () => {
      toast.success("Partner creado exitosamente");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addLicensesMutation = trpc.partnersV2.addLicenses.useMutation({
    onSuccess: () => {
      toast.success("Licencias agregadas exitosamente");
      setIsAddLicensesDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreatePartner = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      email: formData.get("email") as string,
      partnerType: formData.get("partnerType") as "manufacturer" | "distributor",
      brandName: formData.get("brandName") as string || undefined,
      ecommerceUrl: formData.get("ecommerceUrl") as string || undefined,
      legalName: formData.get("legalName") as string || undefined,
      taxId: formData.get("taxId") as string || undefined,
      contactName: formData.get("contactName") as string || undefined,
      contactEmail: formData.get("contactEmail") as string || undefined,
      contactPhone: formData.get("contactPhone") as string || undefined,
    });
  };

  const handleAddLicenses = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPartner) return;

    const formData = new FormData(e.currentTarget);
    const quantity = parseInt(formData.get("quantity") as string);

    addLicensesMutation.mutate({
      partnerId: selectedPartner,
      quantity,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando partners...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Partners</h1>
          <p className="text-muted-foreground">
            Fabricantes y distribuidores con licencias de marca blanca
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreatePartner}>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Partner</DialogTitle>
                <DialogDescription>
                  Registra un fabricante o distribuidor para vender licencias de marca blanca
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input id="name" name="name" required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug * (para códigos de activación)</Label>
                  <Input id="slug" name="slug" required placeholder="ej: acme" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="partnerType">Tipo *</Label>
                  <Select name="partnerType" required defaultValue="distributor">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturer">Fabricante</SelectItem>
                      <SelectItem value="distributor">Distribuidor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="brandName">Nombre de Marca</Label>
                  <Input id="brandName" name="brandName" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ecommerceUrl">URL de Ecommerce</Label>
                  <Input id="ecommerceUrl" name="ecommerceUrl" type="url" placeholder="https://..." />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="legalName">Razón Social</Label>
                  <Input id="legalName" name="legalName" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="taxId">NIF/CIF</Label>
                  <Input id="taxId" name="taxId" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactName">Nombre de Contacto</Label>
                  <Input id="contactName" name="contactName" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Email de Contacto</Label>
                  <Input id="contactEmail" name="contactEmail" type="email" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                  <Input id="contactPhone" name="contactPhone" />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creando..." : "Crear Partner"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {data && data.partners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay partners registrados</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crea tu primer partner para comenzar a vender licencias de marca blanca
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Partner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.partners.map((partner) => (
            <Card key={partner.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{partner.name}</CardTitle>
                    <CardDescription>@{partner.slug}</CardDescription>
                  </div>
                  <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                    {partner.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tipo:</span>
                  <Badge variant="outline">
                    {partner.partnerType === 'manufacturer' ? 'Fabricante' : 'Distribuidor'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <Package className="h-4 w-4 mx-auto text-muted-foreground" />
                    <div className="text-2xl font-bold">{partner.totalLicensesPurchased}</div>
                    <div className="text-xs text-muted-foreground">Compradas</div>
                  </div>
                  <div className="space-y-1">
                    <TrendingUp className="h-4 w-4 mx-auto text-green-500" />
                    <div className="text-2xl font-bold text-green-500">{partner.licensesAvailable}</div>
                    <div className="text-xs text-muted-foreground">Disponibles</div>
                  </div>
                  <div className="space-y-1">
                    <Users className="h-4 w-4 mx-auto text-blue-500" />
                    <div className="text-2xl font-bold text-blue-500">{partner.licensesAssigned}</div>
                    <div className="text-xs text-muted-foreground">Asignadas</div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedPartner(partner.id);
                      setIsAddLicensesDialogOpen(true);
                    }}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Agregar Licencias
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para agregar licencias */}
      <Dialog open={isAddLicensesDialogOpen} onOpenChange={setIsAddLicensesDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAddLicenses}>
            <DialogHeader>
              <DialogTitle>Agregar Licencias</DialogTitle>
              <DialogDescription>
                Agrega licencias al inventario del partner
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Cantidad de Licencias *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  placeholder="ej: 100"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddLicensesDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={addLicensesMutation.isPending}>
                {addLicensesMutation.isPending ? "Agregando..." : "Agregar Licencias"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Paginación */}
      {data && data.total > data.limit && (
        <div className="flex items-center justify-center gap-2">
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
    </div>
  );
}
