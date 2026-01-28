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

export function OrganizationSettings() {
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
      toast.success("Configuración guardada exitosamente");
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
            No tienes permisos de administrador en ninguna organización.
            Solo los administradores pueden configurar permisos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración de Permisos</h1>
        <p className="text-muted-foreground">
          Configura qué recursos comparten los miembros de tu organización
        </p>
      </div>

      {/* Selector de Organización */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Organización</CardTitle>
          <CardDescription>
            Elige la organización que deseas configurar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedOrgId?.toString() || ""}
            onValueChange={(value) => setSelectedOrgId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una organización..." />
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
                <CardTitle>Recursos Compartidos</CardTitle>
              </div>
              <CardDescription>
                Define qué datos se comparten entre todos los miembros de la organización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartir Clientes</Label>
                  <p className="text-sm text-muted-foreground">
                    Todos los miembros ven la misma base de clientes
                  </p>
                </div>
                <Switch checked={shareClients} onCheckedChange={setShareClients} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartir Pianos</Label>
                  <p className="text-sm text-muted-foreground">
                    Todos los miembros ven todos los pianos registrados
                  </p>
                </div>
                <Switch checked={sharePianos} onCheckedChange={setSharePianos} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartir Inventario</Label>
                  <p className="text-sm text-muted-foreground">
                    El inventario de repuestos es común para todos
                  </p>
                </div>
                <Switch checked={shareInventory} onCheckedChange={setShareInventory} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartir Agenda</Label>
                  <p className="text-sm text-muted-foreground">
                    Todos ven las citas de todos (útil para coordinación)
                  </p>
                </div>
                <Switch checked={shareAgenda} onCheckedChange={setShareAgenda} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartir Facturas</Label>
                  <p className="text-sm text-muted-foreground">
                    Todos los miembros ven todas las facturas
                  </p>
                </div>
                <Switch checked={shareInvoices} onCheckedChange={setShareInvoices} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartir Presupuestos</Label>
                  <p className="text-sm text-muted-foreground">
                    Todos los miembros ven todos los presupuestos
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
                <CardTitle>Permisos de Visualización</CardTitle>
              </div>
              <CardDescription>
                Controla qué pueden ver los miembros del trabajo de otros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ver Clientes de Otros</Label>
                  <p className="text-sm text-muted-foreground">
                    Los miembros pueden ver clientes asignados a otros técnicos
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
                  <Label>Editar Clientes de Otros</Label>
                  <p className="text-sm text-muted-foreground">
                    Los miembros pueden modificar clientes de otros técnicos
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
                  <Label>Ver Servicios de Otros</Label>
                  <p className="text-sm text-muted-foreground">
                    Los miembros pueden ver servicios realizados por otros
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
                  <Label>Ver Facturas de Otros</Label>
                  <p className="text-sm text-muted-foreground">
                    Los miembros pueden ver facturas emitidas por otros
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
                <CardTitle>Automatizaciones y Flujos</CardTitle>
              </div>
              <CardDescription>
                Configura comportamientos automáticos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Asignación Automática de Servicios</Label>
                  <p className="text-sm text-muted-foreground">
                    El sistema asigna servicios automáticamente según disponibilidad
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
                  <Label>Requiere Aprobación para Facturas</Label>
                  <p className="text-sm text-muted-foreground">
                    Las facturas deben ser aprobadas por un admin antes de enviarse
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
                "Guardando..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
