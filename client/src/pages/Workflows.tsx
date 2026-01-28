/**
 * Módulo de Workflows
 * Piano Emotion Manager
 * 
 * Automatizaciones y flujos de trabajo personalizados
 */

import { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: number;
  status: 'active' | 'paused' | 'error';
  executions: number;
  lastRun?: string;
}

export default function Workflows() {
  const { t } = useTranslation();
  
  const SAMPLE_WORKFLOWS: Workflow[] = [
    {
      id: '1',
      name: t('workflows.workflowsList.invoiceReminder'),
      description: t('workflows.templatesList.invoiceReminder.description'),
      trigger: 'Fecha de servicio',
      actions: 2,
      status: 'active',
      executions: 45,
      lastRun: '2026-01-27',
    },
    {
      id: '2',
      name: t('workflows.workflowsList.appointmentConfirmation'),
      description: t('workflows.templatesList.appointmentConfirmation.description'),
      trigger: 'Fecha de vencimiento',
      actions: 3,
      status: 'active',
      executions: 12,
      lastRun: '2026-01-26',
    },
    {
      id: '3',
      name: t('workflows.workflowsList.maintenanceAlert'),
      description: t('workflows.templatesList.maintenanceAlert.description'),
      trigger: 'Cliente creado',
      actions: 2,
      status: 'paused',
      executions: 28,
      lastRun: '2026-01-20',
    },
  ];

  const [workflows, setWorkflows] = useState<Workflow[]>(SAMPLE_WORKFLOWS);

  const handleToggleStatus = (id: string) => {
    setWorkflows(prev =>
      prev.map(wf =>
        wf.id === id
          ? { ...wf, status: wf.status === 'active' ? 'paused' : 'active' }
          : wf
      )
    );
    toast.success('Estado del workflow actualizado');
  };

  const handleCreateWorkflow = () => {
    toast.info(t('workflows.toast.createComingSoon'));
  };

  const getStatusIcon = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Workflow['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
    };
    return variants[status];
  };

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
                {workflows.filter(w => w.status === 'active').length}
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
                {workflows.reduce((acc, w) => acc + w.executions, 0)}
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
                98%
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Lista de workflows */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">{t('workflows.list.title')}</h2>
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{workflow.name}</h3>
                  <Badge className={getStatusBadge(workflow.status)}>
                    {getStatusIcon(workflow.status)}
                    <span className="ml-1 capitalize">
                      {workflow.status === 'active' && t('workflows.list.active')}
                      {workflow.status === 'paused' && t('workflows.list.inactive')}
                      {workflow.status === 'error' && 'Error'}
                    </span>
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{workflow.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Trigger:</span>
                    <p className="font-medium">{workflow.trigger}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('workflows.list.actions')}:</span>
                    <p className="font-medium">{workflow.actions} pasos</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('workflows.totalExecutions')}:</span>
                    <p className="font-medium">{workflow.executions}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('workflows.list.lastExecution')}:</span>
                    <p className="font-medium">{workflow.lastRun || 'Nunca'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(workflow.id)}
                >
                  {workflow.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Activar
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Templates de workflows */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">{t('workflows.templates.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              name: t('workflows.templatesList.invoiceReminder.name'), 
              icon: Clock,
              description: t('workflows.templatesList.invoiceReminder.description')
            },
            { 
              name: t('workflows.templatesList.appointmentConfirmation.name'), 
              icon: CheckCircle2,
              description: t('workflows.templatesList.appointmentConfirmation.description')
            },
            { 
              name: t('workflows.templatesList.maintenanceAlert.name'), 
              icon: AlertCircle,
              description: t('workflows.templatesList.maintenanceAlert.description')
            },
          ].map((template) => (
            <Card key={template.name} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
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
    </div>
  );
}
