import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, Shield, Users, Database, Calendar, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

export function OrganizationSettings() {
  const { t } = useTranslation();
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  
  // Estados para cada permiso
  const [shareClients, setShareClients] = useState(true);
  const [sharePianos, setSharePianos] = useState(true);
  const [shareInventory, setShareInventory] = useState(true);
  const [shareAgenda, setShareAgenda] = useState(false);
  const [shareInvoices, setShareInvoices] = useState(true);
  const [shareQuotes, setShareQuotes] = useState(true);
  const [membersCanViewOthersClients, setMembersCanViewOthersClients] = useState(true);
  const [membersCanEditOthersClients, setMembersCanEditOthersClients] = useState(false);
  const [membersCanViewOthersServices, setMembersCanViewOthersServices] = useState(true);
  const [membersCanViewOthersInvoices, setMembersCanViewOthersInvoices] = useState(true);
  const [autoAssignServices, setAutoAssignServices] = useState(false);
  const [requireApprovalForInvoices, setRequireApprovalForInvoices] = useState(false);

  const { data: orgsData } = trpc.organizations.getMyOrganizations.useQuery();
  const { data: settingsData, refetch: refetchSettings } = trpc.organizations.getSettings.useQuery(
    { organizationId: selectedOrgId! },
    { enabled: !!selectedOrgId }
  );

  const updateMutation = trpc.organizations.updateSettings.useMutation({
    onSuccess: () => {
      toast.success(t('organizationSettings.settingsSavedSuccess'));
      refetchSettings();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Cargar settings cuando se selecciona una organización
  useEffect(() => {
    if (settingsData) {
      setShareClients(!!settingsData.shareClients);
      setSharePianos(!!settingsData.sharePianos);
      setShareInventory(!!settingsData.shareInventory);
      setShareAgenda(!!settingsData.shareAgenda);
      setShareInvoices(!!settingsData.shareInvoices);
      setShareQuotes(!!settingsData.shareQuotes);
      setMembersCanViewOthersClients(!!settingsData.membersCanViewOthersClients);
      setMembersCanEditOthersClients(!!settingsData.membersCanEditOthersClients);
      setMembersCanViewOthersServices(!!settingsData.membersCanViewOthersServices);
      setMembersCanViewOthersInvoices(!!settingsData.membersCanViewOthersInvoices);
      setAutoAssignServices(!!settingsData.autoAssignServices);
      setRequireApprovalForInvoices(!!settingsData.requireApprovalForInvoices);
    }
  }, [settingsData]);

  const handleSave = () => {
    if (!selectedOrgId) return;

    updateMutation.mutate({
      organizationId: selectedOrgId,
      shareClients: shareClients ? 1 : 0,
      sharePianos: sharePianos ? 1 : 0,
      shareInventory: shareInventory ? 1 : 0,
      shareAgenda: shareAgenda ? 1 : 0,
      shareInvoices: shareInvoices ? 1 : 0,
      shareQuotes: shareQuotes ? 1 : 0,
      membersCanViewOthersClients: membersCanViewOthersClients ? 1 : 0,
      membersCanEditOthersClients: membersCanEditOthersClients ? 1 : 0,
      membersCanViewOthersServices: membersCanViewOthersServices ? 1 : 0,
      membersCanViewOthersInvoices: membersCanViewOthersInvoices ? 1 : 0,
      autoAssignServices: autoAssignServices ? 1 : 0,
      requireApprovalForInvoices: requireApprovalForInvoices ? 1 : 0,
    });
  };

  // Filtrar solo organizaciones donde el usuario es admin
  const adminOrgs = orgsData?.filter(org => org.role === 'admin') || [];

  if (adminOrgs.length === 0) {
    return (
      <div className="container py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {t('organizationSettings.noAdminPermissions')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('organizationSettings.title')}</h1>
        <p className="text-muted-foreground">
          {t('organizationSettings.description')}
        </p>
      </div>

      {/* Selector de Organización */}
      <Card>
        <CardHeader>
          <CardTitle>{t('organizationSettings.selectOrganization')}</CardTitle>
          <CardDescription>
            {t('organizationSettings.selectOrganizationDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedOrgId?.toString() || ""}
            onValueChange={(value) => setSelectedOrgId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('organizationSettings.selectOrganizationPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {adminOrgs.map((org) => (
                <SelectItem key={org.id} value={org.id.toString()}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedOrgId && settingsData && (
        <>
          {/* Recursos Compartidos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>{t('organizationSettings.sharedResources')}</CardTitle>
              </div>
              <CardDescription>
                {t('organizationSettings.sharedResourcesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.shareClients')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.shareClientsDescription')}
                  </p>
                </div>
                <Switch checked={shareClients} onCheckedChange={setShareClients} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.sharePianos')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.sharePianosDescription')}
                  </p>
                </div>
                <Switch checked={sharePianos} onCheckedChange={setSharePianos} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.shareInventory')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.shareInventoryDescription')}
                  </p>
                </div>
                <Switch checked={shareInventory} onCheckedChange={setShareInventory} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.shareAgenda')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.shareAgendaDescription')}
                  </p>
                </div>
                <Switch checked={shareAgenda} onCheckedChange={setShareAgenda} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.shareInvoices')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.shareInvoicesDescription')}
                  </p>
                </div>
                <Switch checked={shareInvoices} onCheckedChange={setShareInvoices} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.shareQuotes')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.shareQuotesDescription')}
                  </p>
                </div>
                <Switch checked={shareQuotes} onCheckedChange={setShareQuotes} />
              </div>
            </CardContent>
          </Card>

          {/* Permisos de Visualización */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>{t('organizationSettings.viewPermissions')}</CardTitle>
              </div>
              <CardDescription>
                {t('organizationSettings.viewPermissionsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.viewOthersClients')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.viewOthersClientsDescription')}
                  </p>
                </div>
                <Switch
                  checked={membersCanViewOthersClients}
                  onCheckedChange={setMembersCanViewOthersClients}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.editOthersClients')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.editOthersClientsDescription')}
                  </p>
                </div>
                <Switch
                  checked={membersCanEditOthersClients}
                  onCheckedChange={setMembersCanEditOthersClients}
                  disabled={!membersCanViewOthersClients}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.viewOthersServices')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.viewOthersServicesDescription')}
                  </p>
                </div>
                <Switch
                  checked={membersCanViewOthersServices}
                  onCheckedChange={setMembersCanViewOthersServices}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.viewOthersInvoices')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.viewOthersInvoicesDescription')}
                  </p>
                </div>
                <Switch
                  checked={membersCanViewOthersInvoices}
                  onCheckedChange={setMembersCanViewOthersInvoices}
                />
              </div>
            </CardContent>
          </Card>

          {/* Automatizaciones */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <CardTitle>{t('organizationSettings.automationsAndFlows')}</CardTitle>
              </div>
              <CardDescription>
                {t('organizationSettings.automationsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.autoAssignServices')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.autoAssignServicesDescription')}
                  </p>
                </div>
                <Switch
                  checked={autoAssignServices}
                  onCheckedChange={setAutoAssignServices}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('organizationSettings.requireApprovalForInvoices')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('organizationSettings.requireApprovalForInvoicesDescription')}
                  </p>
                </div>
                <Switch
                  checked={requireApprovalForInvoices}
                  onCheckedChange={setRequireApprovalForInvoices}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={updateMutation.isPending} size="lg">
              {updateMutation.isPending ? (
                t('organizationSettings.saving')
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('organizationSettings.saveSettings')}
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
