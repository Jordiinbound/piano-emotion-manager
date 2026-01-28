/**
 * Communications Settings Page
 * Piano Emotion Manager
 * 
 * Configuración de canales de comunicación (Email, WhatsApp, Calendario)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, MessageSquare, Calendar, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function CommunicationsSettings() {
  const { t } = useTranslation();
  
  // Estado para configuración de email
  const [emailProvider, setEmailProvider] = useState<'gmail' | 'outlook' | 'smtp' | 'sendgrid' | 'mailgun'>('gmail');
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '587',
    secure: false,
    user: '',
    password: '',
    fromEmail: '',
    fromName: '',
  });
  const [sendgridApiKey, setSendgridApiKey] = useState('');
  const [mailgunConfig, setMailgunConfig] = useState({
    apiKey: '',
    domain: '',
  });

  // Estado para configuración de WhatsApp
  const [whatsappMethod, setWhatsappMethod] = useState<'web' | 'business'>('web');
  const [whatsappBusinessConfig, setWhatsappBusinessConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
  });

  // Mutations
  const saveEmailConfig = trpc.settings.saveEmailConfig.useMutation({
    onSuccess: () => {
      toast.success('Configuración de email guardada');
    },
    onError: (error) => {
      toast.error('Error al guardar configuración: ' + error.message);
    },
  });

  const saveWhatsAppConfig = trpc.settings.saveWhatsAppConfig.useMutation({
    onSuccess: () => {
      toast.success('Configuración de WhatsApp guardada');
    },
    onError: (error) => {
      toast.error('Error al guardar configuración: ' + error.message);
    },
  });

  const testEmailConfig = trpc.settings.testEmailConfig.useMutation({
    onSuccess: () => {
      toast.success('Email de prueba enviado correctamente');
    },
    onError: (error) => {
      toast.error('Error al enviar email de prueba: ' + error.message);
    },
  });

  const handleSaveEmailConfig = () => {
    const config: any = {
      provider: emailProvider,
    };

    if (emailProvider === 'smtp') {
      config.smtp = smtpConfig;
    } else if (emailProvider === 'sendgrid') {
      config.sendgrid = { apiKey: sendgridApiKey };
    } else if (emailProvider === 'mailgun') {
      config.mailgun = mailgunConfig;
    }

    saveEmailConfig.mutate(config);
  };

  const handleSaveWhatsAppConfig = () => {
    const config: any = {
      method: whatsappMethod,
    };

    if (whatsappMethod === 'business') {
      config.business = whatsappBusinessConfig;
    }

    saveWhatsAppConfig.mutate(config);
  };

  const handleTestEmail = () => {
    testEmailConfig.mutate({ provider: emailProvider });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Comunicaciones</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configura los canales de comunicación para workflows y notificaciones
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs defaultValue="email" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="whatsapp">
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* TAB DE EMAIL */}
          {/* ============================================ */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Email</CardTitle>
                <CardDescription>
                  Elige cómo enviar emails desde workflows y notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selector de proveedor */}
                <div className="space-y-2">
                  <Label htmlFor="emailProvider">Proveedor de Email</Label>
                  <Select value={emailProvider} onValueChange={(value: any) => setEmailProvider(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmail">
                        Gmail OAuth2 (✅ Ya configurado)
                      </SelectItem>
                      <SelectItem value="outlook">
                        Outlook OAuth2 (✅ Ya configurado)
                      </SelectItem>
                      <SelectItem value="smtp">
                        SMTP Genérico (Otros proveedores)
                      </SelectItem>
                      <SelectItem value="sendgrid">
                        SendGrid (Avanzado - Envíos masivos)
                      </SelectItem>
                      <SelectItem value="mailgun">
                        Mailgun (Avanzado - Envíos masivos)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Información de Gmail OAuth2 */}
                {emailProvider === 'gmail' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Gmail OAuth2 ya está configurado</strong> mediante tu cuenta de Google.
                      <br /><br />
                      Los emails se enviarán desde tu cuenta de Gmail usando autenticación OAuth2 segura.
                      También puedes usar Gmail MCP para envíos con confirmación previa.
                      <br /><br />
                      <strong>No necesitas configuración adicional.</strong>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Información de Outlook OAuth2 */}
                {emailProvider === 'outlook' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Outlook OAuth2 ya está configurado</strong> mediante tu cuenta de Microsoft.
                      <br /><br />
                      Los emails se enviarán desde tu cuenta de Outlook/Microsoft 365 usando autenticación OAuth2 segura.
                      Compatible con cuentas personales y corporativas de Microsoft.
                      <br /><br />
                      <strong>No necesitas configuración adicional.</strong>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Configuración SMTP */}
                {emailProvider === 'smtp' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Configuración SMTP</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">Servidor SMTP</Label>
                        <Input
                          id="smtpHost"
                          value={smtpConfig.host}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">Puerto</Label>
                        <Input
                          id="smtpPort"
                          value={smtpConfig.port}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                          placeholder="587"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="smtpSecure"
                        checked={smtpConfig.secure}
                        onCheckedChange={(checked) => setSmtpConfig({ ...smtpConfig, secure: checked })}
                      />
                      <Label htmlFor="smtpSecure">Usar SSL/TLS</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpUser">Usuario</Label>
                        <Input
                          id="smtpUser"
                          type="email"
                          value={smtpConfig.user}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                          placeholder="tu@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">Contraseña</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={smtpConfig.password}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fromEmail">Email remitente</Label>
                        <Input
                          id="fromEmail"
                          type="email"
                          value={smtpConfig.fromEmail}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                          placeholder="noreply@pianoemotion.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fromName">Nombre remitente</Label>
                        <Input
                          id="fromName"
                          value={smtpConfig.fromName}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                          placeholder="Piano Emotion"
                        />
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Gmail/Outlook:</strong> Necesitas usar una "Contraseña de aplicación" en lugar de tu contraseña normal.
                        <br />
                        <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener" className="text-blue-600 underline">
                          Cómo crear una contraseña de aplicación en Gmail
                        </a>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Configuración SendGrid */}
                {emailProvider === 'sendgrid' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Configuración SendGrid</h4>
                    <div className="space-y-2">
                      <Label htmlFor="sendgridApiKey">API Key de SendGrid</Label>
                      <Input
                        id="sendgridApiKey"
                        type="password"
                        value={sendgridApiKey}
                        onChange={(e) => setSendgridApiKey(e.target.value)}
                        placeholder="SG.••••••••••••••••••••••••••••"
                      />
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        SendGrid es ideal para envíos masivos y automatizados.
                        <br />
                        <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener" className="text-blue-600 underline">
                          Obtener API Key de SendGrid
                        </a>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Configuración Mailgun */}
                {emailProvider === 'mailgun' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Configuración Mailgun</h4>
                    <div className="space-y-2">
                      <Label htmlFor="mailgunApiKey">API Key de Mailgun</Label>
                      <Input
                        id="mailgunApiKey"
                        type="password"
                        value={mailgunConfig.apiKey}
                        onChange={(e) => setMailgunConfig({ ...mailgunConfig, apiKey: e.target.value })}
                        placeholder="key-••••••••••••••••••••••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mailgunDomain">Dominio de Mailgun</Label>
                      <Input
                        id="mailgunDomain"
                        value={mailgunConfig.domain}
                        onChange={(e) => setMailgunConfig({ ...mailgunConfig, domain: e.target.value })}
                        placeholder="mg.tudominio.com"
                      />
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Mailgun es ideal para envíos transaccionales y automatizados.
                        <br />
                        <a href="https://app.mailgun.com/app/account/security/api_keys" target="_blank" rel="noopener" className="text-blue-600 underline">
                          Obtener API Key de Mailgun
                        </a>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  {(emailProvider === 'smtp' || emailProvider === 'sendgrid' || emailProvider === 'mailgun') && (
                    <>
                      <Button onClick={handleSaveEmailConfig} disabled={saveEmailConfig.isLoading}>
                        {saveEmailConfig.isLoading ? 'Guardando...' : 'Guardar Configuración'}
                      </Button>
                      <Button variant="outline" onClick={handleTestEmail} disabled={testEmailConfig.isLoading}>
                        {testEmailConfig.isLoading ? 'Enviando...' : 'Enviar Email de Prueba'}
                      </Button>
                    </>
                  )}
                  {(emailProvider === 'gmail' || emailProvider === 'outlook') && (
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        {emailProvider === 'gmail' ? 'Gmail' : 'Outlook'} OAuth2 está listo para usar.
                        Los workflows enviarán emails automáticamente usando tu cuenta configurada.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================ */}
          {/* TAB DE WHATSAPP */}
          {/* ============================================ */}
          <TabsContent value="whatsapp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de WhatsApp</CardTitle>
                <CardDescription>
                  Elige cómo enviar mensajes de WhatsApp desde workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selector de método */}
                <div className="space-y-2">
                  <Label htmlFor="whatsappMethod">Método de WhatsApp</Label>
                  <Select value={whatsappMethod} onValueChange={(value: any) => setWhatsappMethod(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">
                        WhatsApp Web/Personal (Recomendado)
                      </SelectItem>
                      <SelectItem value="business">
                        WhatsApp Business API (Avanzado)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Información de WhatsApp Web */}
                {whatsappMethod === 'web' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>WhatsApp Web/Personal</strong> abrirá tu WhatsApp instalado (móvil, tablet o WhatsApp Desktop).
                      <br /><br />
                      Los mensajes se enviarán mediante enlaces de WhatsApp que abrirán la conversación con el cliente.
                      Deberás confirmar el envío manualmente desde tu dispositivo.
                      <br /><br />
                      <strong>No necesitas configuración adicional.</strong>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Configuración WhatsApp Business API */}
                {whatsappMethod === 'business' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Configuración WhatsApp Business API</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whatsappAccessToken">Access Token</Label>
                      <Input
                        id="whatsappAccessToken"
                        type="password"
                        value={whatsappBusinessConfig.accessToken}
                        onChange={(e) => setWhatsappBusinessConfig({ ...whatsappBusinessConfig, accessToken: e.target.value })}
                        placeholder="EAAG••••••••••••••••••••••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsappPhoneNumberId">Phone Number ID</Label>
                      <Input
                        id="whatsappPhoneNumberId"
                        value={whatsappBusinessConfig.phoneNumberId}
                        onChange={(e) => setWhatsappBusinessConfig({ ...whatsappBusinessConfig, phoneNumberId: e.target.value })}
                        placeholder="123456789012345"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsappBusinessAccountId">Business Account ID</Label>
                      <Input
                        id="whatsappBusinessAccountId"
                        value={whatsappBusinessConfig.businessAccountId}
                        onChange={(e) => setWhatsappBusinessConfig({ ...whatsappBusinessConfig, businessAccountId: e.target.value })}
                        placeholder="123456789012345"
                      />
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        WhatsApp Business API permite envíos automatizados sin intervención manual.
                        Requiere una cuenta de Meta Business y aprobación de plantillas de mensajes.
                        <br />
                        <a href="https://business.facebook.com/wa/manage/home/" target="_blank" rel="noopener" className="text-blue-600 underline">
                          Configurar WhatsApp Business API
                        </a>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveWhatsAppConfig} disabled={saveWhatsAppConfig.isLoading}>
                    {saveWhatsAppConfig.isLoading ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================ */}
          {/* TAB DE CALENDARIO */}
          {/* ============================================ */}
          <TabsContent value="calendar" className="space-y-6">
            {/* Google Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>
                  Integración con Google Calendar para citas y eventos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Google Calendar ya está integrado</strong> mediante tu cuenta de Google.
                    <br /><br />
                    Puedes crear, editar y eliminar eventos directamente desde Piano Emotion Manager.
                    Los cambios se sincronizarán automáticamente con tu Google Calendar.
                    <br /><br />
                    <strong>No necesitas configuración adicional.</strong>
                  </AlertDescription>
                </Alert>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Funcionalidades disponibles:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Crear citas automáticamente desde workflows
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Sincronización bidireccional con Google Calendar
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Buscar y listar eventos existentes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Actualizar y eliminar eventos
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Outlook Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Outlook Calendar (Microsoft 365)</CardTitle>
                <CardDescription>
                  Integración con Outlook Calendar para citas y eventos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Outlook Calendar está disponible</strong> mediante Microsoft Graph API.
                    <br /><br />
                    Puedes usar tanto Google Calendar como Outlook Calendar simultáneamente.
                    Piano Emotion Manager sincronizará eventos con ambos calendarios según tu configuración.
                  </AlertDescription>
                </Alert>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Funcionalidades disponibles:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Crear citas automáticamente desde workflows
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Sincronización bidireccional con Outlook Calendar
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Buscar y listar eventos existentes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Actualizar y eliminar eventos
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <h4 className="font-medium mb-2">Configuración de preferencias:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Calendario principal</p>
                        <p className="text-xs text-gray-600">Calendario predeterminado para nuevas citas</p>
                      </div>
                      <Select defaultValue="google">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google Calendar</SelectItem>
                          <SelectItem value="outlook">Outlook Calendar</SelectItem>
                          <SelectItem value="both">Ambos (duplicar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Sincronización automática</p>
                        <p className="text-xs text-gray-600">Mantener ambos calendarios sincronizados</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Recordatorios</p>
                        <p className="text-xs text-gray-600">Enviar recordatorios desde workflows</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Button className="mt-4">
                  Guardar Preferencias de Calendario
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
