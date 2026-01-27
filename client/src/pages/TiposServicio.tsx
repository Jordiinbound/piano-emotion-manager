import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Wrench,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Euro,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";

const categoryLabels: Record<string, string> = {
  tuning: "Afinación",
  maintenance: "Mantenimiento",
  regulation: "Regulación",
  repair: "Reparación",
  restoration: "Restauración",
  inspection: "Inspección",
  other: "Otro",
};

const categoryColors: Record<string, string> = {
  tuning: "bg-blue-500",
  maintenance: "bg-green-500",
  regulation: "bg-purple-500",
  repair: "bg-orange-500",
  restoration: "bg-pink-500",
  inspection: "bg-cyan-500",
  other: "bg-gray-500",
};

export default function TiposServicio() {
  const [activeTab, setActiveTab] = useState("rates");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  
  // Dialog states
  const [isCreateRateDialogOpen, setIsCreateRateDialogOpen] = useState(false);
  const [isEditRateDialogOpen, setIsEditRateDialogOpen] = useState(false);
  const [isTasksDialogOpen, setIsTasksDialogOpen] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState<number | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  // Form states for service rate
  const [rateName, setRateName] = useState("");
  const [rateDescription, setRateDescription] = useState("");
  const [rateCategory, setRateCategory] = useState<string>("tuning");
  const [rateBasePrice, setRateBasePrice] = useState("");
  const [rateTaxRate, setRateTaxRate] = useState("21");
  const [rateEstimatedDuration, setRateEstimatedDuration] = useState("");
  const [rateIsActive, setRateIsActive] = useState(true);

  // Queries
  const { data: stats } = trpc.serviceTypes.getStats.useQuery();
  const { data: rates, isLoading: isLoadingRates } = trpc.serviceTypes.getServiceRates.useQuery({
    page: 1,
    limit: 100,
    search: search || undefined,
    category: categoryFilter !== "all" ? (categoryFilter as any) : undefined,
    isActive: isActiveFilter,
  });

  const { data: types, isLoading: isLoadingTypes } = trpc.serviceTypes.getServiceTypes.useQuery({
    page: 1,
    limit: 100,
    search: search || undefined,
    isActive: isActiveFilter,
  });

  const { data: tasks } = trpc.serviceTypes.getServiceTasks.useQuery(
    { serviceTypeId: selectedTypeId! },
    { enabled: !!selectedTypeId && isTasksDialogOpen }
  );

  // Mutations
  const utils = trpc.useUtils();

  const createRateMutation = trpc.serviceTypes.createServiceRate.useMutation({
    onSuccess: () => {
      utils.serviceTypes.getServiceRates.invalidate();
      utils.serviceTypes.getStats.invalidate();
      toast.success("Tarifa creada correctamente");
      resetRateForm();
      setIsCreateRateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateRateMutation = trpc.serviceTypes.updateServiceRate.useMutation({
    onSuccess: () => {
      utils.serviceTypes.getServiceRates.invalidate();
      toast.success("Tarifa actualizada correctamente");
      setIsEditRateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteRateMutation = trpc.serviceTypes.deleteServiceRate.useMutation({
    onSuccess: () => {
      utils.serviceTypes.getServiceRates.invalidate();
      utils.serviceTypes.getStats.invalidate();
      toast.success("Tarifa eliminada correctamente");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteTypeMutation = trpc.serviceTypes.deleteServiceType.useMutation({
    onSuccess: () => {
      utils.serviceTypes.getServiceTypes.invalidate();
      toast.success("Tipo de servicio eliminado correctamente");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Handlers
  const resetRateForm = () => {
    setRateName("");
    setRateDescription("");
    setRateCategory("tuning");
    setRateBasePrice("");
    setRateTaxRate("21");
    setRateEstimatedDuration("");
    setRateIsActive(true);
    setSelectedRateId(null);
  };

  const handleCreateRate = () => {
    if (!rateName.trim()) {
      toast.error("Ingresa un nombre");
      return;
    }
    if (!rateBasePrice || parseFloat(rateBasePrice) < 0) {
      toast.error("Ingresa un precio válido");
      return;
    }

    createRateMutation.mutate({
      name: rateName,
      description: rateDescription,
      category: rateCategory as any,
      basePrice: parseFloat(rateBasePrice),
      taxRate: parseFloat(rateTaxRate),
      estimatedDuration: rateEstimatedDuration ? parseInt(rateEstimatedDuration) : undefined,
      isActive: rateIsActive,
    });
  };

  const handleEditRate = (rate: any) => {
    setSelectedRateId(rate.id);
    setRateName(rate.name);
    setRateDescription(rate.description || "");
    setRateCategory(rate.category);
    setRateBasePrice(rate.basePrice);
    setRateTaxRate(rate.taxRate.toString());
    setRateEstimatedDuration(rate.estimatedDuration?.toString() || "");
    setRateIsActive(rate.isActive === 1);
    setIsEditRateDialogOpen(true);
  };

  const handleUpdateRate = () => {
    if (!selectedRateId) return;

    updateRateMutation.mutate({
      id: selectedRateId,
      name: rateName,
      description: rateDescription,
      category: rateCategory as any,
      basePrice: parseFloat(rateBasePrice),
      taxRate: parseFloat(rateTaxRate),
      estimatedDuration: rateEstimatedDuration ? parseInt(rateEstimatedDuration) : undefined,
      isActive: rateIsActive,
    });
  };

  const handleDeleteRate = (id: number) => {
    if (confirm("¿Eliminar esta tarifa?")) {
      deleteRateMutation.mutate({ id });
    }
  };

  const handleDeleteType = (id: number) => {
    if (confirm("¿Eliminar este tipo de servicio y todas sus tareas asociadas?")) {
      deleteTypeMutation.mutate({ id });
    }
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateRateMutation.mutate({
      id,
      isActive: !isActive,
    });
  };

  const handleViewTasks = (typeId: number) => {
    setSelectedTypeId(typeId);
    setIsTasksDialogOpen(true);
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "No especificado";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tipos de Servicio y Tarifas</h1>
          <p className="text-muted-foreground">
            Gestiona el catálogo de servicios, tarifas y tareas predefinidas
          </p>
        </div>
        <Button onClick={() => setIsCreateRateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarifa
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarifas Activas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Afinación</CardTitle>
              <Wrench className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byCategory.tuning || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mantenimiento</CardTitle>
              <Wrench className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byCategory.maintenance || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reparación</CardTitle>
              <Wrench className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byCategory.repair || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar servicios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="tuning">Afinación</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="regulation">Regulación</SelectItem>
                <SelectItem value="repair">Reparación</SelectItem>
                <SelectItem value="restoration">Restauración</SelectItem>
                <SelectItem value="inspection">Inspección</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={isActiveFilter === undefined ? "all" : isActiveFilter ? "active" : "inactive"}
              onValueChange={(value) =>
                setIsActiveFilter(value === "all" ? undefined : value === "active")
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rates">Tarifas de Servicio</TabsTrigger>
          <TabsTrigger value="types">Tipos de Servicio</TabsTrigger>
        </TabsList>

        {/* Service Rates Tab */}
        <TabsContent value="rates" className="space-y-4">
          {isLoadingRates ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Cargando tarifas...</p>
            </div>
          ) : rates && rates.items.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rates.items.map((rate) => (
                <Card key={rate.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={categoryColors[rate.category]}>
                            {categoryLabels[rate.category]}
                          </Badge>
                          {rate.isActive === 1 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <CardTitle className="text-lg">{rate.name}</CardTitle>
                        {rate.description && (
                          <CardDescription className="mt-2">{rate.description}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Euro className="h-4 w-4" />
                        <span>Precio base:</span>
                      </div>
                      <span className="text-lg font-bold">{formatCurrency(rate.basePrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">IVA:</span>
                      <span>{rate.taxRate}%</span>
                    </div>
                    {rate.estimatedDuration && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Duración:</span>
                        </div>
                        <span>{formatDuration(rate.estimatedDuration)}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditRate(rate)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(rate.id, rate.isActive === 1)}
                      >
                        {rate.isActive === 1 ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRate(rate.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay tarifas</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza creando tu primera tarifa de servicio
                </p>
                <Button onClick={() => setIsCreateRateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Tarifa
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Service Types Tab */}
        <TabsContent value="types" className="space-y-4">
          {isLoadingTypes ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Cargando tipos...</p>
            </div>
          ) : types && types.items.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {types.items.map((type) => (
                <Card key={type.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {type.isActive === 1 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <CardTitle className="text-lg">{type.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Euro className="h-4 w-4" />
                        <span>Precio:</span>
                      </div>
                      <span className="text-lg font-bold">{formatCurrency(type.price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Duración:</span>
                      </div>
                      <span>{formatDuration(type.duration)}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewTasks(type.id)}
                      >
                        <ListChecks className="h-4 w-4 mr-1" />
                        Tareas
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteType(type.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay tipos de servicio</h3>
                <p className="text-muted-foreground mb-4">
                  Los tipos de servicio se crean automáticamente desde la app móvil
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Rate Dialog */}
      <Dialog
        open={isCreateRateDialogOpen || isEditRateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateRateDialogOpen(false);
            setIsEditRateDialogOpen(false);
            resetRateForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditRateDialogOpen ? "Editar Tarifa" : "Nueva Tarifa de Servicio"}
            </DialogTitle>
            <DialogDescription>
              Configura los detalles de la tarifa de servicio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={rateName}
                onChange={(e) => setRateName(e.target.value)}
                placeholder="Ej: Afinación completa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={rateDescription}
                onChange={(e) => setRateDescription(e.target.value)}
                placeholder="Descripción detallada del servicio"
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select value={rateCategory} onValueChange={setRateCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuning">Afinación</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    <SelectItem value="regulation">Regulación</SelectItem>
                    <SelectItem value="repair">Reparación</SelectItem>
                    <SelectItem value="restoration">Restauración</SelectItem>
                    <SelectItem value="inspection">Inspección</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Precio Base (€) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={rateBasePrice}
                  onChange={(e) => setRateBasePrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxRate">IVA (%) *</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={rateTaxRate}
                  onChange={(e) => setRateTaxRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duración Estimada (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={rateEstimatedDuration}
                  onChange={(e) => setRateEstimatedDuration(e.target.value)}
                  placeholder="60"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={rateIsActive}
                onChange={(e) => setRateIsActive(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive">Tarifa activa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateRateDialogOpen(false);
                setIsEditRateDialogOpen(false);
                resetRateForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={isEditRateDialogOpen ? handleUpdateRate : handleCreateRate}
              disabled={createRateMutation.isPending || updateRateMutation.isPending}
            >
              {isEditRateDialogOpen ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tasks Dialog */}
      <Dialog open={isTasksDialogOpen} onOpenChange={setIsTasksDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tareas del Servicio</DialogTitle>
            <DialogDescription>
              Lista de tareas que componen este tipo de servicio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {tasks && tasks.length > 0 ? (
              tasks.map((task, index) => (
                <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-sm">{task.description}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay tareas definidas para este servicio
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsTasksDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
