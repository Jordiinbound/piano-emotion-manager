import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/use-translation';
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

export default function WorkflowApprovals() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [selectedExecution, setSelectedExecution] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');

  // Obtener aprobaciones pendientes
  const { data: pendingApprovals, isLoading, refetch } = trpc.workflows.listPendingApprovals.useQuery();

  // Mutation para aprobar/rechazar
  const approveMutation = trpc.workflows.approveWorkflow.useMutation({
    onSuccess: (data) => {
      toast.success(
        decision === 'approved' ? t('workflows.approved') : t('workflows.rejected')
      );
      refetch();
      setIsDialogOpen(false);
      setSelectedExecution(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleOpenDialog = (execution: any, dec: 'approved' | 'rejected') => {
    setSelectedExecution(execution);
    setDecision(dec);
    setIsDialogOpen(true);
  };

  const handleConfirmDecision = () => {
    if (!selectedExecution) return;

    approveMutation.mutate({
      executionId: selectedExecution.id,
      decision,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/workflows')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('workflows.pendingApprovals')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('workflows.pendingApprovalsDescription')}
          </p>
        </div>
      </div>

      {/* Lista de aprobaciones pendientes */}
      {!pendingApprovals || pendingApprovals.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t('workflows.noApprovals')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('workflows.noApprovalsDescription')}
              </p>
              <Button onClick={() => setLocation('/workflows')}>
                {t('workflows.backToWorkflows')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((execution: any) => {
            const approvalData = execution.pendingApprovalData;
            const workflow = execution.workflow;

            return (
              <Card key={execution.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{workflow?.name || 'Workflow'}</CardTitle>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock className="h-3 w-3 mr-1" />
                          {t('workflows.pendingApproval')}
                        </Badge>
                      </div>
                      <CardDescription>{workflow?.description || ''}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mensaje de aprobación */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{approvalData?.message || 'Aprobación requerida'}</h4>
                          {approvalData?.details && (
                            <p className="text-sm text-muted-foreground">{approvalData.details}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Información de la ejecución */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">{t('workflows.executionId')}</p>
                        <p className="font-mono">#{execution.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">{t('workflows.pausedAt')}</p>
                        <p>{new Date(approvalData?.pausedAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Botones de acción */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        onClick={() => handleOpenDialog(execution, 'approved')}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('workflows.approve')}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleOpenDialog(execution, 'rejected')}
                        disabled={approveMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t('workflows.reject')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Diálogo de confirmación */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision === 'approved' ? t('workflows.confirmApprove') : t('workflows.confirmReject')}
            </DialogTitle>
            <DialogDescription>
              {decision === 'approved'
                ? t('workflows.confirmApproveDescription')
                : t('workflows.confirmRejectDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant={decision === 'approved' ? 'default' : 'destructive'}
              onClick={handleConfirmDecision}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? t('common.processing') : t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
