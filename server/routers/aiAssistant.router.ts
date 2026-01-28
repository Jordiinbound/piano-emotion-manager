/**
 * AI Assistant Router - tRPC
 * Piano Emotion Manager
 * 
 * Router para el asistente de IA que genera contenido
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { invokeLLM } from '../_core/llm';

const assistantModeSchema = z.enum(['email', 'report', 'custom']);

export const aiAssistantRouter = router({
  // Generar contenido con IA
  generateContent: protectedProcedure
    .input(
      z.object({
        mode: assistantModeSchema,
        prompt: z.string().min(1, 'El prompt no puede estar vacío'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { mode, prompt } = input;

      // Construir el system prompt según el modo
      let systemPrompt = '';
      
      if (mode === 'email') {
        systemPrompt = `Eres un asistente profesional especializado en redactar emails para un negocio de afinación y mantenimiento de pianos. 
Tu tarea es generar emails profesionales, cordiales y claros para comunicarte con clientes.
El email debe incluir:
- Asunto apropiado
- Saludo cordial
- Cuerpo del mensaje claro y profesional
- Despedida apropiada
- Firma con "Piano Emotion Manager"

Genera el email completo basándote en la siguiente solicitud del usuario.`;
      } else if (mode === 'report') {
        systemPrompt = `Eres un técnico experto en pianos que redacta informes técnicos detallados.
Tu tarea es crear informes de servicio profesionales que incluyan:
- Título del informe
- Datos del servicio (cliente, piano, fecha, técnico)
- Trabajo realizado (detallado punto por punto)
- Observaciones técnicas
- Recomendaciones para el cliente
- Próxima revisión recomendada

Genera un informe técnico completo y profesional basándote en la siguiente solicitud del usuario.`;
      } else {
        systemPrompt = `Eres un asistente inteligente especializado en ayudar con la gestión de un negocio de afinación y mantenimiento de pianos.
Ayuda al usuario con cualquier tarea relacionada con:
- Gestión de clientes
- Programación de servicios
- Facturación
- Inventario de repuestos
- Comunicación con clientes
- Organización del negocio

Proporciona respuestas claras, prácticas y profesionales.`;
      }

      try {
        // Llamar a la API de IA
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        // Extraer el contenido generado
        const generatedContent = response.choices[0]?.message?.content;

        if (!generatedContent || typeof generatedContent !== 'string') {
          throw new Error('No se pudo generar contenido');
        }

        return {
          success: true,
          content: generatedContent,
          mode,
        };
      } catch (error) {
        console.error('Error al generar contenido con IA:', error);
        throw new Error('Error al generar contenido. Por favor, intenta de nuevo.');
      }
    }),
});
