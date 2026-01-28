import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { useTranslation } from '@/hooks/use-translation';

interface QuoteItem {
  id: string;
  type: "service" | "part" | "labor" | "travel" | "material" | "other";
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  total: number;
}

export default function PresupuestoNuevo() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [clientId, setClientId] = useState<number | null>(null);
  const [pianoId, setPianoId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([]);

  const { data: clients } = trpc.clients.getClients.useQuery({
    page: 1,
    pageSize: 1000,
  });

  const { data: pianos } = trpc.pianos.getPianos.useQuery({
    page: 1,
    pageSize: 1000,
    clientId: clientId || undefined,
  });

  const createMutation = trpc.quotes.createQuote.useMutation({
    onSuccess: () => {
      toast.success(t('quotes.quoteCreated'));
      navigate("/presupuestos");
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const addItem = () => {
    const newItem: QuoteItem = {
      id: nanoid(),
      type: "service",
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 21,
      subtotal: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, ...updates };
        const subtotal = updated.quantity * updated.unitPrice;
        const discountAmount = (subtotal * updated.discount) / 100;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * updated.taxRate) / 100;
        const total = taxableAmount + taxAmount;

        return {
          ...updated,
          subtotal,
          total,
        };
      })
    );
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice * item.discount) / 100;
    }, 0);
    const taxAmount = items.reduce((sum, item) => {
      const taxableAmount = item.subtotal - (item.quantity * item.unitPrice * item.discount) / 100;
      return sum + (taxableAmount * item.taxRate) / 100;
    }, 0);
    const total = subtotal - totalDiscount + taxAmount;

    return { subtotal, totalDiscount, taxAmount, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast.error(t('quotes.selectClient'));
      return;
    }

    if (!title.trim()) {
      toast.error(t('quotes.enterTitle'));
      return;
    }

    if (items.length === 0) {
      toast.error(t('quotes.addAtLeastOneItem'));
      return;
    }

    createMutation.mutate({
      clientId,
      pianoId: pianoId || undefined,
      title,
      description,
      date,
      validUntil,
      items,
      notes,
      termsAndConditions,
      businessInfo: undefined,
    });
  };

  const totals = calculateTotals();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/presupuestos")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('quotes.newQuote')}</h1>
          <p className="text-muted-foreground">
            {t('quotes.createQuoteForClient')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente y Piano */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quotes.clientInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client">{t('quotes.client')} *</Label>
                <Select
                  value={clientId?.toString() || ""}
                  onValueChange={(value) => {
                    setClientId(Number(value));
                    setPianoId(null);
                  }}
                >
                  <SelectTrigger id="client">
                    <SelectValue placeholder={t('quotes.selectClient')} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="piano">{t('quotes.pianoOptional')}</Label>
                <Select
                  value={pianoId?.toString() || ""}
                  onValueChange={(value) => setPianoId(Number(value))}
                  disabled={!clientId}
                >
                  <SelectTrigger id="piano">
                    <SelectValue placeholder={t('quotes.selectPiano')} />
                  </SelectTrigger>
                  <SelectContent>
                    {pianos?.pianos.map((piano) => (
                      <SelectItem key={piano.id} value={piano.id.toString()}>
                        {piano.brand} {piano.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles del Presupuesto */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quotes.quoteDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('quotes.title')} *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('quotes.titlePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('quotes.description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('quotes.descriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">{t('quotes.date')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">{t('quotes.validUntil')}</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conceptos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('quotes.items')}</CardTitle>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t('quotes.addItem')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('quotes.noItems')}
              </p>
            ) : (
              items.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{t('quotes.item')} {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t('quotes.type')}</Label>
                        <Select
                          value={item.type}
                          onValueChange={(value) =>
                            updateItem(item.id, { type: value as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="service">{t('quotes.types.service')}</SelectItem>
                            <SelectItem value="part">{t('quotes.types.part')}</SelectItem>
                            <SelectItem value="labor">{t('quotes.types.labor')}</SelectItem>
                            <SelectItem value="travel">{t('quotes.types.travel')}</SelectItem>
                            <SelectItem value="material">{t('quotes.types.material')}</SelectItem>
                            <SelectItem value="other">{t('quotes.types.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('quotes.name')}</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          placeholder={t('quotes.namePlaceholder')}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('quotes.description')}</Label>
                      <Input
                        value={item.description || ""}
                        onChange={(e) =>
                          updateItem(item.id, { description: e.target.value })
                        }
                        placeholder={t('quotes.descriptionOptional')}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <Label>{t('quotes.quantity')}</Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('quotes.unitPrice')}</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('quotes.discount')}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) =>
                            updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('quotes.taxRate')}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.taxRate}
                          onChange={(e) =>
                            updateItem(item.id, { taxRate: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 text-sm">
                      <span>{t('quotes.subtotal')}: {item.subtotal.toFixed(2)}€</span>
                      <span className="font-bold">{t('quotes.total')}: {item.total.toFixed(2)}€</span>
                    </div>
                  </div>
                </Card>
              ))
            )}

            {/* Totales */}
            {items.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('quotes.subtotal')}:</span>
                  <span>{totals.subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('quotes.discount')}:</span>
                  <span>-{totals.totalDiscount.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('quotes.taxAmount')}:</span>
                  <span>{totals.taxAmount.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('quotes.total')}:</span>
                  <span>{totals.total.toFixed(2)}€</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notas y Términos */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quotes.additionalInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">{t('quotes.notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('quotes.notesPlaceholder')}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">{t('quotes.termsAndConditions')}</Label>
              <Textarea
                id="terms"
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                placeholder={t('quotes.termsPlaceholder')}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/presupuestos")}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t('quotes.creating') : t('quotes.createQuote')}
          </Button>
        </div>
      </form>
    </div>
  );
}
