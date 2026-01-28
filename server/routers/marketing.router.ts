/**
 * Marketing Router
 * Endpoints tRPC para gestión de campañas de marketing, plantillas y mensajes
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc.js';
import { getDb } from '../db.js';
import { 
  messageTemplates, 
  marketingCampaigns, 
  campaignRecipients,
  messageHistory,
  clients 
} from '../../drizzle/schema.js';
import { eq, and, desc, sql, count, inArray } from 'drizzle-orm';
import {
  defaultTemplates,
  templateVariables,
  replaceTemplateVariables,
  validateTemplateVariables,
  type MessageTemplateType,
} from '../services/marketingService.js';

export const marketingRouter = router({
  // ============================================================================
  // PLANTILLAS DE MENSAJES
  // ============================================================================

  /**
   * Obtener todas las plantillas de mensajes
   */
  getTemplates: protectedProcedure
    .input(z.object({
      type: z.string().optional(),
      channel: z.enum(['whatsapp', 'email', 'sms', 'all']).optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      
      const conditions = [];
      if (input?.type) conditions.push(eq(messageTemplates.type, input.type));
      if (input?.channel) conditions.push(eq(messageTemplates.channel, input.channel));
      if (input?.isActive !== undefined) conditions.push(eq(messageTemplates.isActive, input.isActive ? 1 : 0));
      
      const templates = await db
        .select()
        .from(messageTemplates)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(messageTemplates.createdAt));
      
      return templates;
    }),

  /**
   * Obtener una plantilla por ID
   */
  getTemplateById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      const [template] = await db
        .select()
        .from(messageTemplates)
        .where(eq(messageTemplates.id, input.id))
        .limit(1);
      
      return template || null;
    }),

  /**
   * Crear una nueva plantilla
   */
  createTemplate: protectedProcedure
    .input(z.object({
      type: z.string(),
      channel: z.enum(['whatsapp', 'email', 'sms', 'all']).default('whatsapp'),
      name: z.string().min(1).max(100),
      emailSubject: z.string().max(200).optional(),
      content: z.string().min(1),
      htmlContent: z.string().optional(),
      isDefault: z.boolean().default(false),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Validar variables de la plantilla
      const validation = validateTemplateVariables(input.content, input.type as MessageTemplateType);
      if (!validation.valid) {
        throw new Error(`Variables inválidas en la plantilla: ${validation.invalidVariables.join(', ')}`);
      }
      
      const availableVars = templateVariables[input.type as MessageTemplateType] || [];
      
      const [result] = await db.insert(messageTemplates).values({
        type: input.type,
        channel: input.channel,
        name: input.name,
        emailSubject: input.emailSubject || null,
        content: input.content,
        htmlContent: input.htmlContent || null,
        availableVariables: JSON.stringify(availableVars),
        isDefault: input.isDefault ? 1 : 0,
        isActive: input.isActive ? 1 : 0,
        createdBy: ctx.user.id,
      });
      
      return { id: Number(result.insertId) };
    }),

  /**
   * Actualizar una plantilla existente
   */
  updateTemplate: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(100).optional(),
      emailSubject: z.string().max(200).optional(),
      content: z.string().min(1).optional(),
      htmlContent: z.string().optional(),
      isDefault: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.emailSubject !== undefined) updateData.emailSubject = input.emailSubject;
      if (input.content) updateData.content = input.content;
      if (input.htmlContent !== undefined) updateData.htmlContent = input.htmlContent;
      if (input.isDefault !== undefined) updateData.isDefault = input.isDefault ? 1 : 0;
      if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;
      
      await db
        .update(messageTemplates)
        .set(updateData)
        .where(eq(messageTemplates.id, input.id));
      
      return { success: true };
    }),

  /**
   * Eliminar una plantilla
   */
  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db
        .delete(messageTemplates)
        .where(eq(messageTemplates.id, input.id));
      
      return { success: true };
    }),

  /**
   * Obtener plantillas por defecto para inicializar el sistema
   */
  getDefaultTemplates: protectedProcedure
    .query(async () => {
      return Object.entries(defaultTemplates).map(([type, template]) => ({
        type,
        name: template.name,
        content: template.content,
        availableVariables: templateVariables[type as MessageTemplateType],
      }));
    }),

  /**
   * Inicializar plantillas por defecto en la base de datos
   */
  initializeDefaultTemplates: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      
      const templates = Object.entries(defaultTemplates).map(([type, template]) => ({
        type,
        channel: 'whatsapp' as const,
        name: template.name,
        content: template.content,
        availableVariables: JSON.stringify(templateVariables[type as MessageTemplateType]),
        isDefault: 1,
        isActive: 1,
        createdBy: ctx.user.id,
      }));
      
      await db.insert(messageTemplates).values(templates);
      
      return { success: true, count: templates.length };
    }),

  // ============================================================================
  // CAMPAÑAS DE MARKETING
  // ============================================================================

  /**
   * Obtener todas las campañas
   */
  getCampaigns: protectedProcedure
    .input(z.object({
      status: z.enum(['draft', 'scheduled', 'in_progress', 'paused', 'completed', 'cancelled']).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      
      const conditions = [];
      if (input?.status) conditions.push(eq(marketingCampaigns.status, input.status));
      
      const campaigns = await db
        .select()
        .from(marketingCampaigns)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(marketingCampaigns.createdAt))
        .limit(input?.limit || 20)
        .offset(input?.offset || 0);
      
      return campaigns;
    }),

  /**
   * Obtener una campaña por ID con detalles
   */
  getCampaignById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      const [campaign] = await db
        .select()
        .from(marketingCampaigns)
        .where(eq(marketingCampaigns.id, input.id))
        .limit(1);
      
      if (!campaign) return null;
      
      // Obtener plantilla asociada
      const [template] = await db
        .select()
        .from(messageTemplates)
        .where(eq(messageTemplates.id, campaign.templateId))
        .limit(1);
      
      // Obtener destinatarios
      const recipients = await db
        .select()
        .from(campaignRecipients)
        .where(eq(campaignRecipients.campaignId, campaign.id));
      
      return {
        ...campaign,
        template,
        recipients,
      };
    }),

  /**
   * Crear una nueva campaña
   */
  createCampaign: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      templateId: z.number(),
      recipientFilters: z.object({
        lastServiceBefore: z.string().optional(),
        lastServiceAfter: z.string().optional(),
        pianoTypes: z.array(z.string()).optional(),
        serviceTypes: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        hasUpcomingAppointment: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }).optional(),
      scheduledAt: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      const [result] = await db.insert(marketingCampaigns).values({
        name: input.name,
        description: input.description,
        templateId: input.templateId,
        status: 'draft',
        recipientFilters: input.recipientFilters || {},
        scheduledAt: input.scheduledAt,
        createdBy: ctx.user.id,
      });
      
      return { id: Number(result.insertId) };
    }),

  /**
   * Actualizar una campaña
   */
  updateCampaign: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().optional(),
      templateId: z.number().optional(),
      status: z.enum(['draft', 'scheduled', 'in_progress', 'paused', 'completed', 'cancelled']).optional(),
      scheduledAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.templateId) updateData.templateId = input.templateId;
      if (input.status) updateData.status = input.status;
      if (input.scheduledAt !== undefined) updateData.scheduledAt = input.scheduledAt;
      
      await db
        .update(marketingCampaigns)
        .set(updateData)
        .where(eq(marketingCampaigns.id, input.id));
      
      return { success: true };
    }),

  /**
   * Eliminar una campaña
   */
  deleteCampaign: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Eliminar destinatarios primero
      await db
        .delete(campaignRecipients)
        .where(eq(campaignRecipients.campaignId, input.id));
      
      // Eliminar campaña
      await db
        .delete(marketingCampaigns)
        .where(eq(marketingCampaigns.id, input.id));
      
      return { success: true };
    }),

  /**
   * Calcular destinatarios de una campaña según filtros
   */
  calculateRecipients: protectedProcedure
    .input(z.object({
      campaignId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Obtener campaña y filtros
      const [campaign] = await db
        .select()
        .from(marketingCampaigns)
        .where(eq(marketingCampaigns.id, input.campaignId))
        .limit(1);
      
      if (!campaign) {
        throw new Error('Campaña no encontrada');
      }
      
      // Por ahora, seleccionar todos los clientes activos
      // TODO: Implementar filtros avanzados según recipientFilters
      const allClients = await db
        .select()
        .from(clients);
      
      // Insertar destinatarios
      const recipientsData = allClients.map((client, index) => ({
        campaignId: input.campaignId,
        clientId: client.id,
        status: 'pending' as const,
        queueOrder: index + 1,
      }));
      
      if (recipientsData.length > 0) {
        await db.insert(campaignRecipients).values(recipientsData);
      }
      
      // Actualizar contador en campaña
      await db
        .update(marketingCampaigns)
        .set({ totalRecipients: recipientsData.length })
        .where(eq(marketingCampaigns.id, input.campaignId));
      
      return { 
        success: true, 
        totalRecipients: recipientsData.length 
      };
    }),

  /**
   * Obtener estadísticas de campañas
   */
  getCampaignStats: protectedProcedure
    .query(async () => {
      const db = await getDb();
      
      const [stats] = await db
        .select({
          total: count(),
          draft: sql<number>`SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END)`,
          active: sql<number>`SUM(CASE WHEN status IN ('scheduled', 'in_progress') THEN 1 ELSE 0 END)`,
          completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
        })
        .from(marketingCampaigns);
      
      return stats || { total: 0, draft: 0, active: 0, completed: 0 };
    }),

  // ============================================================================
  // HISTORIAL DE MENSAJES
  // ============================================================================

  /**
   * Obtener historial de mensajes enviados
   */
  getMessageHistory: protectedProcedure
    .input(z.object({
      clientId: z.number().optional(),
      campaignId: z.number().optional(),
      channel: z.enum(['whatsapp', 'email', 'sms']).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      
      const conditions = [];
      if (input?.clientId) conditions.push(eq(messageHistory.clientId, input.clientId));
      if (input?.campaignId) conditions.push(eq(messageHistory.campaignId, input.campaignId));
      if (input?.channel) conditions.push(eq(messageHistory.channel, input.channel));
      
      const messages = await db
        .select()
        .from(messageHistory)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(messageHistory.sentAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);
      
      return messages;
    }),
});
