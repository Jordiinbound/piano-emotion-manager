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
import { useTranslation } from "@/hooks/use-translation";

export function ActivationCodesAdmin() {
  const { t } = useTranslation();
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
      toast.success(t('activationCodesAdmin.codesGeneratedSuccess', { count: data.codes.length }));
      setIsGenerateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const revokeMutation = trpc.activationCodes.revoke.useMutation({
    onSuccess: () => {
      toast.success(t('activationCodesAdmin.codeRevoked'));
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
    toast.success(t('activationCodesAdmin.codeCopied'));
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('activationCodesAdmin.title')}</h1>
          <p className="text-muted-foreground">
            {t('activationCodesAdmin.description')}
          </p>
        </div>

        {selectedPartnerId && (
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('activationCodesAdmin.generateCodes')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleGenerate}>
                <DialogHeader>
                  <DialogTitle>{t('activationCodesAdmin.generateActivationCodes')}</DialogTitle>
                  <DialogDescription>
                    {t('activationCodesAdmin.codesWillBeGenerated')}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">{t('activationCodesAdmin.quantity')} *</Label>
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
                    <Label htmlFor="codeType">{t('activationCodesAdmin.codeType')} *</Label>
                    <Select name="codeType" required defaultValue="single_use">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_use">{t('activationCodesAdmin.singleUse')}</SelectItem>
                        <SelectItem value="multi_use">{t('activationCodesAdmin.multiUse')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maxUses">{t('activationCodesAdmin.maxUses')}</Label>
                    <Input
                      id="maxUses"
                      name="maxUses"
                      type="number"
                      min="1"
                      placeholder={t('activationCodesAdmin.unlimitedIfEmpty')}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="billingCycle">{t('activationCodesAdmin.billingCycle')} *</Label>
                    <Select name="billingCycle" required defaultValue="yearly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">{t('activationCodesAdmin.monthly')}</SelectItem>
                        <SelectItem value="yearly">{t('activationCodesAdmin.annual')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="durationMonths">{t('activationCodesAdmin.durationMonths')} *</Label>
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
                    <Label htmlFor="expiresAt">{t('activationCodesAdmin.codeExpirationDate')}</Label>
                    <Input
                      id="expiresAt"
                      name="expiresAt"
                      type="date"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                    {t('activationCodesAdmin.cancel')}
                  </Button>
                  <Button type="submit" disabled={generateMutation.isPending}>
                    {generateMutation.isPending ? t('activationCodesAdmin.generating') : t('activationCodesAdmin.generateCodes')}
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
          <CardTitle>{t('activationCodesAdmin.selectPartner')}</CardTitle>
          <CardDescription>
            {t('activationCodesAdmin.selectPartnerDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedPartnerId?.toString() || ""}
            onValueChange={(value) => setSelectedPartnerId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('activationCodesAdmin.selectPartnerPlaceholder')} />
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
            <CardTitle>{t('activationCodesAdmin.activationCodes')}</CardTitle>
            <CardDescription>
              {t('activationCodesAdmin.codesGenerated', { count: codesData.total })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {codesData.codes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('activationCodesAdmin.noCodesForPartner')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('activationCodesAdmin.code')}</TableHead>
                    <TableHead>{t('activationCodesAdmin.type')}</TableHead>
                    <TableHead>{t('activationCodesAdmin.uses')}</TableHead>
                    <TableHead>{t('activationCodesAdmin.duration')}</TableHead>
                    <TableHead>{t('activationCodesAdmin.status')}</TableHead>
                    <TableHead>{t('activationCodesAdmin.expires')}</TableHead>
                    <TableHead>{t('activationCodesAdmin.actions')}</TableHead>
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
                          {code.codeType === 'single_use' ? t('activationCodesAdmin.single') : t('activationCodesAdmin.multiple')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {code.usesCount} / {code.maxUses || '∞'}
                      </TableCell>
                      <TableCell>
                        {t('activationCodesAdmin.months', { count: code.durationMonths })}
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
                  {t('activationCodesAdmin.previous')}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t('activationCodesAdmin.pageOf', { current: page, total: Math.ceil(codesData.total / codesData.limit) })}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(codesData.total / codesData.limit)}
                >
                  {t('activationCodesAdmin.next')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
