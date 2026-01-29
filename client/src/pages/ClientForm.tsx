import { useState } from "react";
import { useNavigate, useParams } from "wouter";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { usePrefetchClientData } from "@/hooks/usePrefetch";

export default function ClientForm() {
  const navigate = useNavigate();
  const params = useParams();
  const clientId = params.id ? parseInt(params.id) : null;
  const isEdit = clientId !== null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    region: "",
    clientType: "particular" as const,
    notes: "",
  });

  // Cargar datos del cliente si estamos editando
  const { data: client, isLoading: isLoadingClient } = trpc.clients.getById.useQuery(
    { id: clientId! },
    { enabled: isEdit }
  );
  
  // Prefetch: precargar pianos y servicios del cliente
  usePrefetchClientData(clientId || undefined);

  // Prellenar formulario cuando se carguen los datos
  if (client && isEdit && formData.name === "") {
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      city: client.city || "",
      postalCode: client.postalCode || "",
      region: client.region || "",
      clientType: client.clientType,
      notes: client.notes || "",
    });
  }

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente creado exitosamente");
      navigate("/clientes");
    },
    onError: (error) => {
      toast.error(`Error al crear cliente: ${error.message}`);
    },
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Cliente actualizado exitosamente");
      navigate("/clientes");
    },
    onError: (error) => {
      toast.error(`Error al actualizar cliente: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("El email no es válido");
      return;
    }

    if (isEdit) {
      updateMutation.mutate({
        id: clientId!,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isLoadingClient;

  if (isLoadingClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/clientes")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Clientes
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Modifica los datos del cliente"
              : "Completa el formulario para agregar un nuevo cliente"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Básica</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nombre completo del cliente"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientType">Tipo de Cliente</Label>
                  <Select
                    value={formData.clientType}
                    onValueChange={(value) => handleChange("clientType", value)}
                  >
                    <SelectTrigger id="clientType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="particular">Particular</SelectItem>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="professional">Profesional</SelectItem>
                      <SelectItem value="music_school">Escuela de Música</SelectItem>
                      <SelectItem value="conservatory">Conservatorio</SelectItem>
                      <SelectItem value="concert_hall">Sala de Conciertos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dirección</h3>
              
              <div className="space-y-2">
                <Label htmlFor="address">Dirección Completa</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Calle, número, piso, puerta..."
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Madrid"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Código Postal</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleChange("postalCode", e.target.value)}
                    placeholder="28001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Región/Provincia</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleChange("region", e.target.value)}
                    placeholder="Madrid"
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Notas Adicionales</h3>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Información adicional sobre el cliente..."
                  rows={4}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/clientes")}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEdit ? "Actualizar" : "Crear"} Cliente
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
