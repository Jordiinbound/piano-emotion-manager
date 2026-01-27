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
    limit: 1000,
  });

  const { data: pianos } = trpc.pianos.getPianos.useQuery({
    page: 1,
    limit: 1000,
    clientId: clientId || undefined,
  });

  const createMutation = trpc.quotes.createQuote.useMutation({
    onSuccess: () => {
      toast.success("Presupuesto creado correctamente");
      navigate("/presupuestos");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
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
      toast.error("Selecciona un cliente");
      return;
    }

    if (!title.trim()) {
      toast.error("Ingresa un título");
      return;
    }

    if (items.length === 0) {
      toast.error("Agrega al menos un concepto");
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
          <h1 className="text-3xl font-bold">Nuevo Presupuesto</h1>
          <p className="text-muted-foreground">
            Crea un presupuesto para tu cliente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente y Piano */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={clientId?.toString() || ""}
                  onValueChange={(value) => {
                    setClientId(Number(value));
                    setPianoId(null);
                  }}
                >
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.items.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="piano">Piano (opcional)</Label>
                <Select
                  value={pianoId?.toString() || ""}
                  onValueChange={(value) => setPianoId(Number(value))}
                  disabled={!clientId}
                >
                  <SelectTrigger id="piano">
                    <SelectValue placeholder="Selecciona un piano" />
                  </SelectTrigger>
                  <SelectContent>
                    {pianos?.items.map((piano) => (
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
            <CardTitle>Detalles del Presupuesto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Afinación y regulación completa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción detallada del trabajo a realizar"
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Válido hasta</Label>
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
              <CardTitle>Conceptos</CardTitle>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Concepto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay conceptos. Haz clic en "Agregar Concepto" para empezar.
              </p>
            ) : (
              items.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">Concepto {index + 1}</h4>
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
                        <Label>Tipo</Label>
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
                            <SelectItem value="service">Servicio</SelectItem>
                            <SelectItem value="part">Repuesto</SelectItem>
                            <SelectItem value="labor">Mano de obra</SelectItem>
                            <SelectItem value="travel">Desplazamiento</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          placeholder="Nombre del concepto"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Input
                        value={item.description || ""}
                        onChange={(e) =>
                          updateItem(item.id, { description: e.target.value })
                        }
                        placeholder="Descripción opcional"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <Label>Cantidad</Label>
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
                        <Label>Precio Unitario (€)</Label>
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
                        <Label>Descuento (%)</Label>
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
                        <Label>IVA (%)</Label>
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
                      <span>Subtotal: {item.subtotal.toFixed(2)}€</span>
                      <span className="font-bold">Total: {item.total.toFixed(2)}€</span>
                    </div>
                  </div>
                </Card>
              ))
            )}

            {/* Totales */}
            {items.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{totals.subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Descuento:</span>
                  <span>-{totals.totalDiscount.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA:</span>
                  <span>{totals.taxAmount.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{totals.total.toFixed(2)}€</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notas y Términos */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas internas o para el cliente"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Términos y Condiciones</Label>
              <Textarea
                id="terms"
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                placeholder="Términos y condiciones del presupuesto"
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
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creando..." : "Crear Presupuesto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
