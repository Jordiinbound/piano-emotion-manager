/**
 * AI Assistant Button - Botón flotante de ayuda IA
 * Piano Emotion Manager
 * 
 * Permite redactar emails, informes de servicio y más con ayuda de IA
 */

import { useState } from 'react';
import { Brain, Mail, FileText, Sparkles, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type AssistantMode = 'email' | 'report' | 'custom';

interface AssistantOption {
  mode: AssistantMode;
  icon: any;
  title: string;
  description: string;
  placeholder: string;
}

const ASSISTANT_OPTIONS: AssistantOption[] = [
  {
    mode: 'email',
    icon: Mail,
    title: 'Redactar Email',
    description: 'Genera emails profesionales para clientes',
    placeholder: 'Ej: Email para confirmar cita de afinación el próximo martes a las 10:00',
  },
  {
    mode: 'report',
    icon: FileText,
    title: 'Informe de Servicio',
    description: 'Crea informes técnicos detallados',
    placeholder: 'Ej: Informe de afinación completa con regulación de martillos',
  },
  {
    mode: 'custom',
    icon: Sparkles,
    title: 'Asistencia Personalizada',
    description: 'Ayuda con cualquier tarea',
    placeholder: 'Describe lo que necesitas...',
  },
];

export default function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<AssistantMode | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, describe lo que necesitas');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular generación de contenido (en producción, llamar a API de IA)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let content = '';
      
      if (selectedMode === 'email') {
        content = `Asunto: Confirmación de Servicio de Afinación

Estimado/a cliente,

Nos complace confirmar su cita de afinación programada para el próximo martes a las 10:00 horas.

Nuestro técnico especializado realizará una revisión completa de su piano, incluyendo:
- Afinación precisa de todas las cuerdas
- Inspección del mecanismo
- Ajustes menores necesarios

La duración estimada del servicio es de 2 horas. Por favor, asegúrese de que el piano esté accesible y en un ambiente con temperatura estable.

Si necesita reprogramar o tiene alguna consulta, no dude en contactarnos.

Atentamente,
Piano Emotion Manager`;
      } else if (selectedMode === 'report') {
        content = `INFORME TÉCNICO DE SERVICIO

Cliente: [Nombre del Cliente]
Piano: [Marca y Modelo]
Fecha: ${new Date().toLocaleDateString('es-ES')}
Técnico: [Nombre del Técnico]

TRABAJO REALIZADO:

1. Afinación Completa
   - Afinación a 440 Hz (La central)
   - Temperamento igual
   - Todas las cuerdas ajustadas correctamente

2. Regulación de Martillos
   - Ajuste de la distancia cuerda-martillo
   - Nivelación de la línea de martillos
   - Corrección de centrado

3. Inspección General
   - Estado de cuerdas: Bueno
   - Estado de fieltros: Bueno
   - Mecanismo: Funcionamiento óptimo

OBSERVACIONES:
El piano se encuentra en excelente estado de mantenimiento. Se recomienda la próxima afinación en 6 meses.

PRÓXIMA REVISIÓN RECOMENDADA: ${new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}`;
      } else {
        content = `Contenido generado basado en tu solicitud:

${prompt}

[La IA generaría aquí contenido personalizado según tu necesidad específica]

Este es un ejemplo de cómo el asistente de IA puede ayudarte con diversas tareas relacionadas con la gestión de tu negocio de pianos.`;
      }
      
      setGeneratedContent(content);
      toast.success('Contenido generado correctamente');
    } catch (error) {
      toast.error('Error al generar contenido');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setIsCopied(true);
    toast.success('Contenido copiado al portapapeles');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedMode(null);
    setPrompt('');
    setGeneratedContent('');
    setIsCopied(false);
  };

  const currentOption = ASSISTANT_OPTIONS.find(opt => opt.mode === selectedMode);

  return (
    <>
      {/* Botón flotante */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 z-50"
        size="icon"
      >
        <Brain className="h-6 w-6 text-white" />
      </Button>

      {/* Modal del asistente */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) handleReset();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Brain className="h-6 w-6 text-purple-600" />
              Asistente IA
            </DialogTitle>
            <DialogDescription>
              Selecciona una opción para comenzar
            </DialogDescription>
          </DialogHeader>

          {!selectedMode ? (
            // Selección de modo
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {ASSISTANT_OPTIONS.map((option) => (
                <button
                  key={option.mode}
                  onClick={() => setSelectedMode(option.mode)}
                  className="p-6 border-2 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                >
                  <option.icon className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          ) : (
            // Interfaz de generación
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentOption && <currentOption.icon className="h-5 w-5 text-purple-600" />}
                  <h3 className="font-semibold">{currentOption?.title}</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!generatedContent ? (
                <>
                  <div>
                    <Label htmlFor="prompt">Describe lo que necesitas</Label>
                    <Textarea
                      id="prompt"
                      placeholder={currentOption?.placeholder}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generar con IA
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {generatedContent}
                    </pre>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="flex-1"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="flex-1"
                    >
                      Nueva Consulta
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
