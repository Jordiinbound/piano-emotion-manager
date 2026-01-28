/**
 * Módulo de Workflows
 * Piano Emotion Manager
 * 
 * Automatizaciones y flujos de trabajo personalizados
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GitBranch,
  Play,
  Pause,
  Plus,
  Settings,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import { trpc } from '@/lib/trpc';
import WorkflowTemplates from '@/components/WorkflowTemplates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Workflows() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  // Estado para diálogo de creación/edición
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'manual',
  });

  // Queries
  const { data: workflows = [], isLoading } = trpc.workflows.list.useQuery();
  const { data: workflowExecutions } = trpc.workflows.getExecutions.useQuery(
    { workflowId: workflows[0]?.id || 0 },
    { enabled: workflows.length > 0 }
  );

  // Mutations
  const createMutation = trpc.workflows.create.useMutation({
    onSuccess: () => {
      toast.success(t('workflows.toast.created'));
      utils.workflows.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateMutation = trpc.workflows.update.useMutation({
    onSuccess: () => {
      toast.success(t('workflows.toast.updated'));
      utils.workflows.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = trpc.workflows.delete.useMutation({
    onSuccess: () => {
      toast.success(t('workflows.toast.deleted'));
      utils.workflows.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const activateMutation = trpc.workflows.activate.useMutation({
    onSuccess: () => {
      toast.success(t('workflows.toast.activated'));
      utils.workflows.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deactivateMutation = trpc.workflows.deactivate.useMutation({
    onSuccess: () => {
      toast.success(t('workflows.toast.deactivated'));
      utils.workflows.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const executeMutation = trpc.workflows.execute.useMutation({
    onSuccess: () => {
      toast.success(t('workflows.toast.executed'));
      utils.workflows.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const createFromTemplateMutation = trpc.workflows.createFromTemplate.useMutation({
    onSuccess: (data) => {
      toast.success('Workflow creado desde plantilla correctamente');
      utils.workflows.list.invalidate();
      // Navegar al editor del nuevo workflow
      if (data.workflowId) {
        setLocation(`/workflows/editor/${data.workflowId}`);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      triggerType: 'manual',
    });
    setEditingWorkflow(null);
  };

  const handleCreateWorkflow = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditWorkflow = (workflow: any) => {
    setEditingWorkflow(workflow.id);
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
      triggerType: workflow.triggerType,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingWorkflow) {
      updateMutation.mutate({
        id: editingWorkflow,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    if (currentStatus === 'active') {
      deactivateMutation.mutate({ id });
    } else {
      activateMutation.mutate({ id });
    }
  };

  const handleDeleteWorkflow = (id: number) => {
    if (confirm(t('workflows.confirmDelete'))) {
      deleteMutation.mutate({ id });
    }
  };

  const handleExecuteWorkflow = (id: number) => {
    executeMutation.mutate({ id });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Pause className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
    };
    return variants[status] || 'bg-gray-100 text-gray-700';
  };

  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const totalExecutions = workflows.reduce((acc, w) => acc + (w.executionCount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-indigo-500" />
            {t('workflows.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('workflows.subtitle')}
          </p>
        </div>
        <Button onClick={handleCreateWorkflow}>
          <Plus className="h-4 w-4 mr-2" />
          {t('workflows.create')}
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('workflows.title')}</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {workflows.length}
              </p>
            </div>
            <GitBranch className="h-8 w-8 text-indigo-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('workflows.activeWorkflows')}</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {activeWorkflows}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('workflows.totalExecutions')}</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {totalExecutions}
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('workflows.successRate')}</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {workflows.length > 0 ? '98%' : '0%'}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Plantillas de workflows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('workflows.templates.title')}</h2>
        </div>
        <WorkflowTemplates onTemplateSelect={(templateId) => {
          createFromTemplateMutation.mutate({ templateId });
        }} />
      </div>

      {/* Lista de workflows */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">{t('workflows.list.title')}</h2>
        {workflows.length === 0 ? (
          <Card className="p-12 text-center">
            <GitBranch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('workflows.noWorkflows')}</h3>
            <p className="text-muted-foreground mb-4">{t('workflows.noWorkflowsDescription')}</p>
            <Button onClick={handleCreateWorkflow}>
              <Plus className="h-4 w-4 mr-2" />
              {t('workflows.create')}
            </Button>
          </Card>
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{workflow.name}</h3>
                    <Badge className={getStatusBadge(workflow.status)}>
                      {getStatusIcon(workflow.status)}
                      <span className="ml-1 capitalize">
                        {workflow.status === 'active' && t('workflows.list.active')}
                        {workflow.status === 'inactive' && t('workflows.list.inactive')}
                        {workflow.status === 'error' && 'Error'}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{workflow.description || t('workflows.noDescription')}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Trigger:</span>
                      <p className="font-medium capitalize">{workflow.triggerType}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('workflows.list.actions')}:</span>
                      <p className="font-medium">0 pasos</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('workflows.totalExecutions')}:</span>
                      <p className="font-medium">{workflow.executionCount || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('workflows.list.lastExecution')}:</span>
                      <p className="font-medium">
                        {workflow.lastExecutedAt 
                          ? new Date(workflow.lastExecutedAt).toLocaleDateString() 
                          : t('workflows.neverExecuted')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(workflow.id, workflow.status)}
                  >
                    {workflow.status === 'active' ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        {t('workflows.pause')}
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        {t('workflows.activate')}
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExecuteWorkflow(workflow.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation(`/workflows/${workflow.id}`)}
                    title="Abrir editor visual"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditWorkflow(workflow)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Templates de workflows */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">{t('workflows.templates.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              name: t('workflows.templatesList.invoiceReminder.name'), 
              icon: Clock,
              description: t('workflows.templatesList.invoiceReminder.description'),
              triggerType: 'invoice_due',
            },
            { 
              name: t('workflows.templatesList.appointmentConfirmation.name'), 
              icon: CheckCircle2,
              description: t('workflows.templatesList.appointmentConfirmation.description'),
              triggerType: 'appointment_created',
            },
            { 
              name: t('workflows.templatesList.maintenanceAlert.name'), 
              icon: AlertCircle,
              description: t('workflows.templatesList.maintenanceAlert.description'),
              triggerType: 'service_completed',
            },
          ].map((template) => (
            <Card 
              key={template.name} 
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setFormData({
                  name: template.name,
                  description: template.description,
                  triggerType: template.triggerType,
                });
                setIsDialogOpen(true);
              }}
            >
              <div className="flex items-start gap-3">
                <template.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium mb-1">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                    {t('workflows.templates.use')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Diálogo de creación/edición */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWorkflow ? t('workflows.edit') : t('workflows.create')}
            </DialogTitle>
            <DialogDescription>
              {editingWorkflow 
                ? t('workflows.editDescription') 
                : t('workflows.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('workflows.form.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('workflows.form.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="triggerType">{t('workflows.form.triggerType')}</Label>
                <Select
                  value={formData.triggerType}
                  onValueChange={(value) => setFormData({ ...formData, triggerType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">{t('workflows.triggers.manual')}</SelectItem>
                    <SelectItem value="client_created">{t('workflows.triggers.clientCreated')}</SelectItem>
                    <SelectItem value="service_completed">{t('workflows.triggers.serviceCompleted')}</SelectItem>
                    <SelectItem value="invoice_due">{t('workflows.triggers.invoiceDue')}</SelectItem>
                    <SelectItem value="appointment_created">{t('workflows.triggers.appointmentCreated')}</SelectItem>
                    <SelectItem value="scheduled">{t('workflows.triggers.scheduled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingWorkflow ? t('common.save') : t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
