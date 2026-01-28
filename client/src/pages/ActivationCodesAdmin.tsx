import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";

export function ActivationCodesAdmin() {
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: partnersData } = trpc.partnersV2.list.useQuery({ page: 1, limit: 100 });
  const { data: codesData, refetch } = trpc.activationCodes.listByPartner.useQuery(
    { partnerId: selectedPartnerId!, page, limit: 20 },
    { enabled: !!selectedPartnerId }
  );

  const generateMutation = trpc.activationCodes.generate.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.codes.length} códigos generados exitosamente`);
      setIsGenerateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const revokeMutation = trpc.activationCodes.revoke.useMutation({
    onSuccess: () => {
      toast.success("Código revocado");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPartnerId) return;

    const formData = new FormData(e.currentTarget);
    const codeType = formData.get("codeType") as "single_use" | "multi_use";

    generateMutation.mutate({
      partnerId: selectedPartnerId,
      quantity: parseInt(formData.get("quantity") as string),
      codeType,
      maxUses: codeType === "multi_use" ? parseInt(formData.get("maxUses") as string) : undefined,
      billingCycle: formData.get("billingCycle") as "monthly" | "yearly",
      durationMonths: parseInt(formData.get("durationMonths") as string),
      expiresAt: formData.get("expiresAt") as string || undefined,
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Código copiado");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Códigos de Activación</h1>
          <p className="text-muted-foreground">
            Genera y gestiona códigos para activar licencias de partners
          </p>
        </div>

        {selectedPartnerId && (
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generar Códigos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleGenerate}>
                <DialogHeader>
                  <DialogTitle>Generar Códigos de Activación</DialogTitle>
                  <DialogDescription>
                    Los códigos se generarán para el partner seleccionado
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Cantidad *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      max="100"
                      required
                      defaultValue="10"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="codeType">Tipo de Código *</Label>
                    <Select name="codeType" required defaultValue="single_use">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_use">Uso Único</SelectItem>
                        <SelectItem value="multi_use">Uso Múltiple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maxUses">Máximo de Usos (solo multi-uso)</Label>
                    <Input
                      id="maxUses"
                      name="maxUses"
                      type="number"
                      min="1"
                      placeholder="Ilimitado si se deja vacío"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="billingCycle">Ciclo de Facturación *</Label>
                    <Select name="billingCycle" required defaultValue="yearly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="durationMonths">Duración (meses) *</Label>
                    <Input
                      id="durationMonths"
                      name="durationMonths"
                      type="number"
                      min="1"
                      required
                      defaultValue="12"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="expiresAt">Fecha de Expiración del Código (opcional)</Label>
                    <Input
                      id="expiresAt"
                      name="expiresAt"
                      type="date"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={generateMutation.isPending}>
                    {generateMutation.isPending ? "Generando..." : "Generar Códigos"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Selector de Partner */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Partner</CardTitle>
          <CardDescription>
            Elige un partner para ver y generar sus códigos de activación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedPartnerId?.toString() || ""}
            onValueChange={(value) => setSelectedPartnerId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un partner..." />
            </SelectTrigger>
            <SelectContent>
              {partnersData?.partners.map((partner) => (
                <SelectItem key={partner.id} value={partner.id.toString()}>
                  {partner.name} (@{partner.slug})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Códigos */}
      {selectedPartnerId && codesData && (
        <Card>
          <CardHeader>
            <CardTitle>Códigos de Activación</CardTitle>
            <CardDescription>
              {codesData.total} códigos generados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {codesData.codes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay códigos generados para este partner
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codesData.codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          {code.code}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(code.code)}
                          >
                            {copiedCode === code.code ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {code.codeType === 'single_use' ? 'Único' : 'Múltiple'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {code.usesCount} / {code.maxUses || '∞'}
                      </TableCell>
                      <TableCell>
                        {code.durationMonths} meses
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            code.status === 'active' ? 'default' :
                            code.status === 'used' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {code.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        {code.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeMutation.mutate({ codeId: code.id })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Paginación */}
            {codesData.total > codesData.limit && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {Math.ceil(codesData.total / codesData.limit)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(codesData.total / codesData.limit)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
