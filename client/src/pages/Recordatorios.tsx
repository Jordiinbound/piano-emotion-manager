import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Search, Phone, Mail, MessageSquare, User, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

type ReminderType = 'call' | 'visit' | 'email' | 'whatsapp' | 'follow_up';

const reminderTypeIcons: Record<ReminderType, any> = {
  call: Phone,
  visit: User,
  email: Mail,
  whatsapp: MessageSquare,
  follow_up: Calendar,
};

const reminderTypeLabels: Record<ReminderType, string> = {
  call: 'Llamar',
  visit: 'Visitar',
  email: 'Email',
  whatsapp: 'WhatsApp',
  follow_up: 'Seguimiento',
};

export default function Recordatorios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ReminderType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);

  // Queries
  const { data: reminders, isLoading, refetch } = trpc.reminders.list.useQuery({
    limit: 100,
    reminderType: filterType === 'all' ? undefined : filterType,
    isCompleted: filterStatus === 'all' ? undefined : filterStatus === 'completed',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  });

  const { data: stats } = trpc.reminders.getStats.useQuery();
  const { data: clients } = trpc.clients.list.useQuery({ limit: 1000 });
  const { data: pianos } = trpc.pianos.list.useQuery({ limit: 1000 });

  // Mutations
  const createMutation = trpc.reminders.create.useMutation({
    onSuccess: () => {
      toast.success('Recordatorio creado exitosamente');
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error('Error al crear recordatorio: ' + error.message);
    },
  });

  const updateMutation = trpc.reminders.update.useMutation({
    onSuccess: () => {
      toast.success('Recordatorio actualizado exitosamente');
      setEditingReminder(null);
      refetch();
    },
    onError: (error) => {
      toast.error('Error al actualizar recordatorio: ' + error.message);
    },
  });

  const markCompletedMutation = trpc.reminders.markCompleted.useMutation({
    onSuccess: () => {
      toast.success('Recordatorio marcado como completado');
      refetch();
    },
    onError: (error) => {
      toast.error('Error al marcar recordatorio: ' + error.message);
    },
  });

  const deleteMutation = trpc.reminders.delete.useMutation({
    onSuccess: () => {
      toast.success('Recordatorio eliminado exitosamente');
      refetch();
    },
    onError: (error) => {
      toast.error('Error al eliminar recordatorio: ' + error.message);
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    pianoId: '',
    reminderType: 'call' as ReminderType,
    dueDate: '',
    title: '',
    notes: '',
    isCompleted: false,
  });

  const handleCreate = () => {
    if (!formData.clientId || !formData.dueDate || !formData.title) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    createMutation.mutate({
      clientId: parseInt(formData.clientId),
      pianoId: formData.pianoId ? parseInt(formData.pianoId) : undefined,
      reminderType: formData.reminderType,
      dueDate: formData.dueDate,
      title: formData.title,
      notes: formData.notes || undefined,
      isCompleted: 0,
    });
  };

  const handleUpdate = () => {
    if (!editingReminder) return;

    updateMutation.mutate({
      id: editingReminder.id,
      data: {
        clientId: parseInt(formData.clientId),
        pianoId: formData.pianoId ? parseInt(formData.pianoId) : undefined,
        reminderType: formData.reminderType,
        dueDate: formData.dueDate,
        title: formData.title,
        notes: formData.notes || undefined,
        isCompleted: formData.isCompleted ? 1 : 0,
      },
    });
  };

  const openEditDialog = (reminder: any) => {
    setEditingReminder(reminder);
    setFormData({
      clientId: reminder.clientId.toString(),
      pianoId: reminder.pianoId?.toString() || '',
      reminderType: reminder.reminderType,
      dueDate: reminder.dueDate.slice(0, 16), // Format for datetime-local input
      title: reminder.title,
      notes: reminder.notes || '',
      isCompleted: reminder.isCompleted === 1,
    });
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      pianoId: '',
      reminderType: 'call',
      dueDate: '',
      title: '',
      notes: '',
      isCompleted: false,
    });
    setEditingReminder(null);
  };

  const filteredReminders = reminders?.items.filter((reminder: any) => {
    const matchesSearch = 
      reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const isOverdue = (dueDate: string, isCompleted: number) => {
    if (isCompleted === 1) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recordatorios</h1>
          <p className="text-muted-foreground">Gestiona tus recordatorios de seguimiento</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Recordatorio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Recordatorio</DialogTitle>
            </DialogHeader>
            <ReminderForm
              formData={formData}
              setFormData={setFormData}
              clients={clients?.items || []}
              pianos={pianos?.items || []}
              onSubmit={handleCreate}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por título o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="call">Llamar</SelectItem>
                <SelectItem value="visit">Visitar</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="follow_up">Seguimiento</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de recordatorios */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando recordatorios...</div>
          ) : filteredReminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron recordatorios
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReminders.map((reminder: any) => {
                const Icon = reminderTypeIcons[reminder.reminderType as ReminderType];
                const overdueStatus = isOverdue(reminder.dueDate, reminder.isCompleted);
                
                return (
                  <div
                    key={reminder.id}
                    className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors ${
                      overdueStatus ? 'border-red-300 bg-red-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${reminder.isCompleted === 1 ? 'bg-green-100' : 'bg-blue-100'}`}>
                        <Icon className={`w-5 h-5 ${reminder.isCompleted === 1 ? 'text-green-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{reminder.title}</h3>
                          <Badge variant={reminder.isCompleted === 1 ? 'default' : 'secondary'}>
                            {reminderTypeLabels[reminder.reminderType as ReminderType]}
                          </Badge>
                          {overdueStatus && (
                            <Badge variant="destructive">Vencido</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">{reminder.clientName || 'Cliente desconocido'}</span>
                          {reminder.pianoModel && <span> • {reminder.pianoModel}</span>}
                          <span> • {new Date(reminder.dueDate).toLocaleString('es-ES')}</span>
                        </div>
                        {reminder.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{reminder.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reminder.isCompleted === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markCompletedMutation.mutate({ id: reminder.id })}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Completar
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(reminder)}
                          >
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Editar Recordatorio</DialogTitle>
                          </DialogHeader>
                          <ReminderForm
                            formData={formData}
                            setFormData={setFormData}
                            clients={clients?.items || []}
                            pianos={pianos?.items || []}
                            onSubmit={handleUpdate}
                            onCancel={() => {
                              setEditingReminder(null);
                              resetForm();
                            }}
                            isLoading={updateMutation.isPending}
                            isEdit
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar este recordatorio?')) {
                            deleteMutation.mutate({ id: reminder.id });
                          }
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de formulario reutilizable
function ReminderForm({
  formData,
  setFormData,
  clients,
  pianos,
  onSubmit,
  onCancel,
  isLoading,
  isEdit = false,
}: {
  formData: any;
  setFormData: any;
  clients: any[];
  pianos: any[];
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isEdit?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente *</Label>
          <Select
            value={formData.clientId}
            onValueChange={(value) => setFormData({ ...formData, clientId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client: any) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pianoId">Piano (opcional)</Label>
          <Select
            value={formData.pianoId}
            onValueChange={(value) => setFormData({ ...formData, pianoId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar piano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Ninguno</SelectItem>
              {pianos.map((piano: any) => (
                <SelectItem key={piano.id} value={piano.id.toString()}>
                  {piano.brand} {piano.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reminderType">Tipo *</Label>
          <Select
            value={formData.reminderType}
            onValueChange={(value) => setFormData({ ...formData, reminderType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Llamar</SelectItem>
              <SelectItem value="visit">Visitar</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="follow_up">Seguimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Fecha y hora *</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: Llamar para confirmar cita"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notas adicionales..."
          rows={3}
        />
      </div>

      {isEdit && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isCompleted"
            checked={formData.isCompleted}
            onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="isCompleted">Marcar como completado</Label>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </div>
  );
}
