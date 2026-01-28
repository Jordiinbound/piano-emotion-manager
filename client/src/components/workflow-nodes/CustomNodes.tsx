/**
 * CustomNodes - Nodos personalizados para WorkflowEditor
 * Piano Emotion Manager
 */

import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Zap,
  GitBranch,
  Mail,
  MessageSquare,
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  Settings,
  User,
  FileText,
  DollarSign,
  Edit2,
  UserCheck,
  Pause,
} from 'lucide-react';

// Nodo de Trigger
export function TriggerNode({ data, id }: NodeProps) {
  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'client_created':
        return <User className="h-5 w-5" />;
      case 'service_completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'invoice_due':
        return <DollarSign className="h-5 w-5" />;
      case 'appointment_created':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  return (
    <Card className="min-w-[200px] bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 shadow-lg">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-yellow-100 rounded-lg">
            {getTriggerIcon(data.triggerType)}
          </div>
          <div>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Trigger
            </Badge>
          </div>
        </div>
        <h4 className="font-semibold text-sm mb-1">{data.label}</h4>
        <p className="text-xs text-muted-foreground">{data.description}</p>
        {data.config && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Settings className="h-3 w-3" />
            <span>Configurado</span>
          </div>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => data.onConfigure?.(id, data)}
        >
          <Edit2 className="h-3 w-3 mr-1" />
          Configurar
        </Button>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-yellow-500 !w-3 !h-3"
      />
    </Card>
  );
}

// Nodo de Condición
export function ConditionNode({ data, id }: NodeProps) {
  return (
    <Card className="min-w-[200px] bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-lg">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3"
      />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <GitBranch className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Condición
          </Badge>
        </div>
        <h4 className="font-semibold text-sm mb-1">{data.label}</h4>
        <p className="text-xs text-muted-foreground">{data.description}</p>
        {data.condition && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
            <code className="text-blue-700">{data.condition}</code>
          </div>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => data.onConfigure?.(id, data)}
        >
          <Edit2 className="h-3 w-3 mr-1" />
          Configurar
        </Button>
      </div>
      <div className="flex justify-between px-4 pb-2">
        <div className="text-xs text-green-600 font-medium">✓ Sí</div>
        <div className="text-xs text-red-600 font-medium">✗ No</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!bg-green-500 !w-3 !h-3 !left-[25%]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-red-500 !w-3 !h-3 !left-[75%]"
      />
    </Card>
  );
}

// Nodo de Acción
export function ActionNode({ data, id }: NodeProps) {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_email':
        return <Mail className="h-5 w-5" />;
      case 'send_whatsapp':
        return <MessageSquare className="h-5 w-5" />;
      case 'create_reminder':
        return <Bell className="h-5 w-5" />;
      case 'create_appointment':
        return <Calendar className="h-5 w-5" />;
      case 'update_status':
        return <FileText className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <Card className="min-w-[200px] bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 shadow-lg">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-green-500 !w-3 !h-3"
      />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            {getActionIcon(data.actionType)}
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Acción
          </Badge>
        </div>
        <h4 className="font-semibold text-sm mb-1">{data.label}</h4>
        <p className="text-xs text-muted-foreground">{data.description}</p>
        {data.config && (
          <div className="mt-2 space-y-1">
            {Object.entries(data.config).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-muted-foreground">{key}:</span>{' '}
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => data.onConfigure?.(id, data)}
        >
          <Edit2 className="h-3 w-3 mr-1" />
          Configurar
        </Button>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !w-3 !h-3"
      />
    </Card>
  );
}

// Nodo de Delay
export function DelayNode({ data, id }: NodeProps) {
  return (
    <Card className="min-w-[200px] bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 shadow-lg">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !w-3 !h-3"
      />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            Esperar
          </Badge>
        </div>
        <h4 className="font-semibold text-sm mb-1">{data.label}</h4>
        <p className="text-xs text-muted-foreground">{data.description}</p>
        {data.duration && (
          <div className="mt-2 p-2 bg-purple-50 rounded">
            <div className="text-2xl font-bold text-purple-700 text-center">
              {data.duration}
            </div>
            <div className="text-xs text-center text-muted-foreground">
              {data.unit || 'minutos'}
            </div>
          </div>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => data.onConfigure?.(id, data)}
        >
          <Edit2 className="h-3 w-3 mr-1" />
          Configurar
        </Button>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !w-3 !h-3"
      />
    </Card>
  );
}

// Nodo de Aprobación
export function ApprovalNode({ data, id }: NodeProps) {
  return (
    <Card className="min-w-[200px] bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-400 shadow-lg">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-amber-500 !w-3 !h-3"
      />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <UserCheck className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            Aprobación
          </Badge>
        </div>
        <h4 className="font-semibold text-sm mb-1">{data.label}</h4>
        <p className="text-xs text-muted-foreground">{data.description}</p>
        {data.config && (
          <div className="mt-2 space-y-1">
            {data.config.approvers && (
              <div className="text-xs">
                <span className="text-muted-foreground">Aprobadores:</span>{' '}
                <span className="font-medium">{data.config.approvers}</span>
              </div>
            )}
            {data.config.timeout && (
              <div className="text-xs">
                <span className="text-muted-foreground">Timeout:</span>{' '}
                <span className="font-medium">{data.config.timeout} horas</span>
              </div>
            )}
          </div>
        )}
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
          <Pause className="h-3 w-3" />
          <span>Pausa el workflow</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => data.onConfigure?.(id, data)}
        >
          <Edit2 className="h-3 w-3 mr-1" />
          Configurar
        </Button>
      </div>
      <div className="flex justify-between px-4 pb-2">
        <div className="text-xs text-green-600 font-medium">✓ Aprobado</div>
        <div className="text-xs text-red-600 font-medium">✗ Rechazado</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="approved"
        className="!bg-green-500 !w-3 !h-3 !left-[25%]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="rejected"
        className="!bg-red-500 !w-3 !h-3 !left-[75%]"
      />
    </Card>
  );
}

// Exportar todos los tipos de nodos
export const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  delay: DelayNode,
  approval: ApprovalNode,
};
