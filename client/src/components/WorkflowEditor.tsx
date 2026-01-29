/**
 * WorkflowEditor - Editor visual de workflows con React Flow
 * Piano Emotion Manager
 */

import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes as customNodeTypes } from './workflow-nodes/CustomNodes';
import { NodeConfigDialog } from './workflow-nodes/NodeConfigForms';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Play,
  Save,
  Plus,
  Zap,
  GitBranch,
  Mail,
  MessageSquare,
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Send,
  ListTodo,
  Webhook,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';



// Configuración de nodos iniciales de ejemplo
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    data: { 
      label: 'Nuevo Cliente Creado',
      description: 'Se activa cuando se crea un nuevo cliente',
      triggerType: 'client_created',
    },
    position: { x: 250, y: 50 },
  },
];

const initialEdges: Edge[] = [];

interface WorkflowEditorProps {
  workflowId?: number;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onTest?: () => void;
}

export default function WorkflowEditor({ workflowId, onSave, onTest }: WorkflowEditorProps) {
  const { t } = useTranslation();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);
  const [configNodeType, setConfigNodeType] = useState<'trigger' | 'condition' | 'action' | 'delay'>('trigger');
  const [configNodeData, setConfigNodeData] = useState<any>(null);

  // Manejar conexiones entre nodos
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: {
          strokeWidth: 2,
          stroke: '#6366f1',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Agregar nuevo nodo
  const addNode = (type: string) => {
    const newId = (nodes.length + 1).toString();
    let label = '';
    let icon = null;
    let bgColor = '';
    let borderColor = '';

    switch (type) {
      case 'trigger':
        label = 'Trigger';
        icon = <Zap className="h-4 w-4 text-yellow-500" />;
        bgColor = '#fef3c7';
        borderColor = '#fbbf24';
        break;
      case 'condition':
        label = 'Condición';
        icon = <GitBranch className="h-4 w-4 text-blue-500" />;
        bgColor = '#dbeafe';
        borderColor = '#3b82f6';
        break;
      case 'action':
        label = 'Acción';
        icon = <CheckCircle className="h-4 w-4 text-green-500" />;
        bgColor = '#dcfce7';
        borderColor = '#22c55e';
        break;
      case 'delay':
        label = 'Esperar';
        icon = <Clock className="h-4 w-4 text-purple-500" />;
        bgColor = '#f3e8ff';
        borderColor = '#a855f7';
        break;
      case 'approval':
        label = 'Aprobación';
        icon = <UserCheck className="h-4 w-4 text-amber-500" />;
        bgColor = '#fef3c7';
        borderColor = '#f59e0b';
        break;
      case 'send_email':
        label = 'Enviar Email';
        icon = <Send className="h-4 w-4 text-blue-500" />;
        bgColor = '#dbeafe';
        borderColor = '#3b82f6';
        break;
      case 'create_task':
        label = 'Crear Tarea';
        icon = <ListTodo className="h-4 w-4 text-pink-500" />;
        bgColor = '#fce7f3';
        borderColor = '#ec4899';
        break;
      case 'create_event':
        label = 'Crear Evento';
        icon = <Calendar className="h-4 w-4 text-teal-500" />;
        bgColor = '#ccfbf1';
        borderColor = '#14b8a6';
        break;
      case 'webhook':
        label = 'Webhook';
        icon = <Webhook className="h-4 w-4 text-slate-500" />;
        bgColor = '#f1f5f9';
        borderColor = '#64748b';
        break;
    }

    const newNode: Node = {
      id: newId,
      type: type,
      data: {
        label: `${label} ${newId}`,
        description: `Descripción del ${label.toLowerCase()}`,
        onConfigure: handleNodeConfigure,
      },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    toast.success(`Nodo ${label} agregado`);
  };

  // Guardar workflow
  const handleNodeConfigure = (nodeId: string, nodeData: any) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setConfigNodeId(nodeId);
    setConfigNodeType(node.type as any);
    setConfigNodeData(nodeData);
    setConfigDialogOpen(true);
  };

  const handleConfigSave = (newConfig: any) => {
    if (!configNodeId) return;
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === configNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newConfig,
              onConfigure: handleNodeConfigure,
            },
          };
        }
        return node;
      })
    );
    
    toast.success('Configuración guardada');
  };

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
    toast.success('Workflow guardado');
  };

  // Probar workflow
  const handleTest = () => {
    if (onTest) {
      onTest();
    }
    toast.info('Ejecutando workflow de prueba...');
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Toolbar superior */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Editor de Workflow</h3>
          {workflowId && (
            <span className="text-sm text-muted-foreground">ID: {workflowId}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleTest}>
            <Play className="h-4 w-4 mr-2" />
            Probar
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Panel lateral de nodos */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <h4 className="font-semibold mb-4">Agregar Nodos</h4>
          
          <div className="space-y-2">
            <Card
              className="p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => addNode('trigger')}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-sm">Trigger</p>
                  <p className="text-xs text-muted-foreground">Inicia el workflow</p>
                </div>
              </div>
            </Card>

            <Card
              className="p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => addNode('condition')}
            >
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Condición</p>
                  <p className="text-xs text-muted-foreground">Evalúa y bifurca</p>
                </div>
              </div>
            </Card>

            <Card
              className="p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => addNode('action')}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Acción</p>
                  <p className="text-xs text-muted-foreground">Ejecuta una tarea</p>
                </div>
              </div>
            </Card>

            <Card
              className="p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => addNode('delay')}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">Esperar</p>
                  <p className="text-xs text-muted-foreground">Pausa el flujo</p>
                </div>
              </div>
            </Card>

            <Card
              className="p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => addNode('approval')}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-sm">Aprobación</p>
                  <p className="text-xs text-muted-foreground">Requiere aprobación manual</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-3 text-sm">Acciones Disponibles</h4>
            <div className="space-y-2">
              <Card
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addNode('send_email')}
              >
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Enviar Email</p>
                    <p className="text-xs text-muted-foreground">Envía email a destinatarios</p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addNode('create_task')}
              >
                <div className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="font-medium text-sm">Crear Tarea</p>
                    <p className="text-xs text-muted-foreground">Crea tarea en ClickUp</p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addNode('create_event')}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="font-medium text-sm">Crear Evento</p>
                    <p className="text-xs text-muted-foreground">Crea evento en Google Calendar</p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addNode('webhook')}
              >
                <div className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-sm">Webhook</p>
                    <p className="text-xs text-muted-foreground">Llama a API externa</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Canvas de React Flow */}
        <div className="flex-1 bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={customNodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.style?.background) {
                  return node.style.background as string;
                }
                return '#e5e7eb';
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
            <Panel position="top-right" className="bg-white p-2 rounded shadow text-sm">
              <p className="text-muted-foreground">
                Arrastra los nodos para conectarlos
              </p>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Diálogo de configuración de nodos */}
      <NodeConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        nodeType={configNodeType}
        initialConfig={configNodeData}
        onSave={handleConfigSave}
      />
    </div>
  );
}
