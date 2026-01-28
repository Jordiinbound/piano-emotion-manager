/**
 * Workflow Templates Component
 * Piano Emotion Manager
 * 
 * Muestra plantillas predefinidas de workflows
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface WorkflowTemplatesProps {
  onTemplateSelect: (templateId: string) => void;
}

const TEMPLATE_ICONS: Record<string, any> = {
  welcome_new_client: Mail,
  appointment_reminder: Calendar,
  post_service_followup: MessageSquare,
};

const CATEGORY_COLORS: Record<string, string> = {
  customer: 'bg-blue-100 text-blue-700',
  appointment: 'bg-green-100 text-green-700',
  service: 'bg-purple-100 text-purple-700',
};

export default function WorkflowTemplates({ onTemplateSelect }: WorkflowTemplatesProps) {
  const { data: templates = [], isLoading } = trpc.workflows.listTemplates.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
            <div className="h-6 bg-muted rounded mb-2" />
            <div className="h-4 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay plantillas disponibles</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map((template) => {
        const Icon = TEMPLATE_ICONS[template.id] || Sparkles;
        const categoryColor = CATEGORY_COLORS[template.category] || 'bg-gray-100 text-gray-700';

        return (
          <Card
            key={template.id}
            className="p-6 hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <Badge className={categoryColor}>
                {template.category === 'customer' && 'Cliente'}
                {template.category === 'appointment' && 'Cita'}
                {template.category === 'service' && 'Servicio'}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {template.name}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {template.description}
            </p>

            <Button
              onClick={() => onTemplateSelect(template.id)}
              className="w-full"
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Usar Plantilla
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
