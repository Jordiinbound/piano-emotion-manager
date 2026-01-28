/**
 * Página de edición de Workflow
 * Piano Emotion Manager
 */

import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Play } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import WorkflowEditor from '@/components/WorkflowEditor';
import { Node, Edge } from 'reactflow';

export default function WorkflowEditorPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const workflowId = params.id ? parseInt(params.id) : undefined;

  // Query para obtener workflow
  const { data: workflow, isLoading } = trpc.workflows.get.useQuery(
    { id: workflowId! },
    { enabled: !!workflowId }
  );

  // Mutations
  const utils = trpc.useUtils();
  const updateMutation = trpc.workflows.update.useMutation({
    onSuccess: () => {
      toast.success('Workflow guardado correctamente');
      utils.workflows.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error al guardar: ${error.message}`);
    },
  });

  const executeMutation = trpc.workflows.execute.useMutation({
    onSuccess: () => {
      toast.success('Workflow ejecutado correctamente');
    },
    onError: (error) => {
      toast.error(`Error al ejecutar: ${error.message}`);
    },
  });

  const handleSave = (nodes: Node[], edges: Edge[]) => {
    if (!workflowId) return;

    // Convertir nodos y edges al formato de la base de datos
    const nodesData = nodes.map((node, index) => ({
      nodeType: node.type as 'trigger' | 'condition' | 'action' | 'delay',
      nodeConfig: node.data,
      positionX: node.position.x,
      positionY: node.position.y,
    }));

    const connectionsData = edges.map((edge) => ({
      sourceNodeId: parseInt(edge.source),
      targetNodeId: parseInt(edge.target),
      connectionType: edge.sourceHandle || null,
    }));

    updateMutation.mutate({
      id: workflowId,
      nodes: nodesData,
      connections: connectionsData,
    });
  };

  const handleTest = () => {
    if (!workflowId) return;
    executeMutation.mutate({
      id: workflowId,
      triggerData: { test: true },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando workflow...</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Workflow no encontrado</p>
          <Button onClick={() => setLocation('/workflows')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Workflows
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/workflows')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-xl font-bold">{workflow.name}</h1>
            {workflow.description && (
              <p className="text-sm text-muted-foreground">{workflow.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <WorkflowEditor
          workflowId={workflowId}
          onSave={handleSave}
          onTest={handleTest}
        />
      </div>
    </div>
  );
}
