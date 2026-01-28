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
import { useTranslation } from "@/hooks/use-translation";

export function PartnersAdmin() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddLicensesDialogOpen, setIsAddLicensesDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.partnersV2.list.useQuery({ page, limit: 20 });
  const createMutation = trpc.partnersV2.create.useMutation({
    onSuccess: () => {
      toast.success(t('partnersAdmin.partnerCreatedSuccess'));
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addLicensesMutation = trpc.partnersV2.addLicenses.useMutation({
    onSuccess: () => {
      toast.success(t('partnersAdmin.licensesAddedSuccess'));
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
          <div className="text-muted-foreground">{t('partnersAdmin.loadingPartners')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('partnersAdmin.title')}</h1>
          <p className="text-muted-foreground">
            {t('partnersAdmin.description')}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('partnersAdmin.newPartner')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreatePartner}>
              <DialogHeader>
                <DialogTitle>{t('partnersAdmin.createNewPartner')}</DialogTitle>
                <DialogDescription>
                  {t('partnersAdmin.createPartnerDescription')}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('partnersAdmin.name')} *</Label>
                  <Input id="name" name="name" required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slug">{t('partnersAdmin.slug')} *</Label>
                  <Input id="slug" name="slug" required placeholder={t('partnersAdmin.slugPlaceholder')} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">{t('partnersAdmin.email')} *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="partnerType">{t('partnersAdmin.type')} *</Label>
                  <Select name="partnerType" required defaultValue="distributor">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturer">{t('partnersAdmin.manufacturer')}</SelectItem>
                      <SelectItem value="distributor">{t('partnersAdmin.distributor')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="brandName">{t('partnersAdmin.brandName')}</Label>
                  <Input id="brandName" name="brandName" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ecommerceUrl">{t('partnersAdmin.ecommerceUrl')}</Label>
                  <Input id="ecommerceUrl" name="ecommerceUrl" type="url" placeholder="https://..." />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="legalName">{t('partnersAdmin.legalName')}</Label>
                  <Input id="legalName" name="legalName" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="taxId">{t('partnersAdmin.taxId')}</Label>
                  <Input id="taxId" name="taxId" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactName">{t('partnersAdmin.contactName')}</Label>
                  <Input id="contactName" name="contactName" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">{t('partnersAdmin.contactEmail')}</Label>
                  <Input id="contactEmail" name="contactEmail" type="email" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactPhone">{t('partnersAdmin.contactPhone')}</Label>
                  <Input id="contactPhone" name="contactPhone" />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('partnersAdmin.cancel')}
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('partnersAdmin.creating') : t('partnersAdmin.createPartner')}
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
            <h3 className="text-lg font-semibold mb-2">{t('partnersAdmin.noPartnersRegistered')}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('partnersAdmin.createFirstPartnerDescription')}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('partnersAdmin.createFirstPartner')}
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
                  <span className="text-muted-foreground">{t('partnersAdmin.typeLabel')}:</span>
                  <Badge variant="outline">
                    {partner.partnerType === 'manufacturer' ? t('partnersAdmin.manufacturer') : t('partnersAdmin.distributor')}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <Package className="h-4 w-4 mx-auto text-muted-foreground" />
                    <div className="text-2xl font-bold">{partner.totalLicensesPurchased}</div>
                    <div className="text-xs text-muted-foreground">{t('partnersAdmin.purchased')}</div>
                  </div>
                  <div className="space-y-1">
                    <TrendingUp className="h-4 w-4 mx-auto text-green-500" />
                    <div className="text-2xl font-bold text-green-500">{partner.licensesAvailable}</div>
                    <div className="text-xs text-muted-foreground">{t('partnersAdmin.available')}</div>
                  </div>
                  <div className="space-y-1">
                    <Users className="h-4 w-4 mx-auto text-blue-500" />
                    <div className="text-2xl font-bold text-blue-500">{partner.licensesAssigned}</div>
                    <div className="text-xs text-muted-foreground">{t('partnersAdmin.assigned')}</div>
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
                    {t('partnersAdmin.addLicenses')}
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
              <DialogTitle>{t('partnersAdmin.addLicenses')}</DialogTitle>
              <DialogDescription>
                {t('partnersAdmin.addLicensesDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">{t('partnersAdmin.quantityOfLicenses')} *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  placeholder={t('partnersAdmin.quantityPlaceholder')}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddLicensesDialogOpen(false)}>
                {t('partnersAdmin.cancel')}
              </Button>
              <Button type="submit" disabled={addLicensesMutation.isPending}>
                {addLicensesMutation.isPending ? t('partnersAdmin.adding') : t('partnersAdmin.addLicenses')}
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
            {t('partnersAdmin.previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('partnersAdmin.pageOf', { current: page, total: Math.ceil(data.total / data.limit) })}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(data.total / data.limit)}
          >
            {t('partnersAdmin.next')}
          </Button>
        </div>
      )}
    </div>
  );
}
