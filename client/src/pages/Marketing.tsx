/**
 * Página de Marketing
 * Gestión de campañas de marketing, plantillas de mensajes y envíos masivos
 */

import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Send, 
  MessageSquare, 
  Mail, 
  Users, 
  Calendar,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export default function Marketing() {
  const [activeTab, setActiveTab] = useState('campaigns');
  
  // Queries
  const { data: campaigns, isLoading: loadingCampaigns, refetch: refetchCampaigns } = 
    trpc.marketing.getCampaigns.useQuery();
  
  const { data: templates, isLoading: loadingTemplates, refetch: refetchTemplates } = 
    trpc.marketing.getTemplates.useQuery();
  
  const { data: history, isLoading: loadingHistory } = 
    trpc.marketing.getMessageHistory.useQuery({ limit: 50 });
  
  // Mutations
  const initTemplates = trpc.marketing.initializeDefaultTemplates.useMutation({
    onSuccess: () => {
      toast.success('Plantillas inicializadas correctamente');
      refetchTemplates();
    },
    onError: (error) => {
      toast.error(`Error al inicializar plantillas: ${error.message}`);
    },
  });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Marketing</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona campañas de marketing, plantillas y mensajes masivos
          </p>
        </div>
        <Button size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nueva Campaña
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns?.filter(c => c.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaigns?.filter(c => c.status === 'draft').length || 0} borradores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plantillas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {templates?.filter(t => t.isDefault).length || 0} por defecto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes Enviados</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history?.filter(h => h.status === 'sent').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinatarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              En campañas activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        {/* Tab: Campañas */}
        <TabsContent value="campaigns" className="space-y-4">
          {loadingCampaigns ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando campañas...</p>
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{campaign.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {campaign.description}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        campaign.status === 'active' ? 'default' :
                        campaign.status === 'completed' ? 'secondary' :
                        'outline'
                      }>
                        {campaign.status === 'active' ? 'Activa' :
                         campaign.status === 'completed' ? 'Completada' :
                         campaign.status === 'paused' ? 'Pausada' : 'Borrador'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          0 destinatarios
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Send className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay campañas</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crea tu primera campaña de marketing para enviar mensajes masivos a tus clientes
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Campaña
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Plantillas */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={() => initTemplates.mutate()}
              disabled={initTemplates.isPending}
            >
              {initTemplates.isPending ? 'Inicializando...' : 'Inicializar Plantillas por Defecto'}
            </Button>
          </div>

          {loadingTemplates ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando plantillas...</p>
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">
                            {template.channel === 'whatsapp' ? 'WhatsApp' :
                             template.channel === 'email' ? 'Email' :
                             template.channel === 'sms' ? 'SMS' : 'Todos'}
                          </Badge>
                          {template.isDefault && (
                            <Badge variant="secondary">Por defecto</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!template.isDefault && (
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                      {template.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay plantillas</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Inicializa las plantillas por defecto o crea tus propias plantillas personalizadas
                </p>
                <Button onClick={() => initTemplates.mutate()} disabled={initTemplates.isPending}>
                  {initTemplates.isPending ? 'Inicializando...' : 'Inicializar Plantillas'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Historial */}
        <TabsContent value="history" className="space-y-4">
          {loadingHistory ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando historial...</p>
            </div>
          ) : history && history.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {history.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Cliente #{item.clientId}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.channel === 'whatsapp' ? 'WhatsApp' :
                               item.channel === 'email' ? 'Email' : 'SMS'}
                            </Badge>
                            <Badge variant={
                              item.status === 'sent' ? 'default' :
                              item.status === 'failed' ? 'destructive' :
                              'secondary'
                            } className="text-xs">
                              {item.status === 'sent' ? 'Enviado' :
                               item.status === 'failed' ? 'Fallido' : 'Pendiente'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.sentAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay mensajes</h3>
                <p className="text-muted-foreground text-center">
                  El historial de mensajes enviados aparecerá aquí
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
