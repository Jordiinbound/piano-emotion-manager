/**
 * Tests para el router de marketing
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers.js';
import type { Context } from '../_core/context.js';

// Crear contexto de prueba
const createTestContext = (): Context => ({
  user: {
    id: 1,
    openId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
  },
  req: {} as any,
  res: {} as any,
});

describe('Marketing Router', () => {
  const ctx = createTestContext();
  const caller = appRouter.createCaller(ctx);

  describe('Plantillas de Mensajes', () => {
    it('debe obtener plantillas por defecto', async () => {
      const templates = await caller.marketing.getDefaultTemplates();
      
      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty('type');
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('content');
      expect(templates[0]).toHaveProperty('availableVariables');
    });

    it('debe inicializar plantillas por defecto en la BD', async () => {
      const result = await caller.marketing.initializeDefaultTemplates();
      
      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    });

    it('debe obtener todas las plantillas', async () => {
      const templates = await caller.marketing.getTemplates();
      
      expect(Array.isArray(templates)).toBe(true);
    });

    it('debe crear una nueva plantilla personalizada', async () => {
      const result = await caller.marketing.createTemplate({
        type: 'custom',
        channel: 'whatsapp',
        name: 'Plantilla de Prueba',
        content: 'Hola {{cliente_nombre}}, este es un mensaje de prueba desde {{nombre_negocio}}.',
        isDefault: false,
        isActive: true,
      });
      
      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('number');
    });

    it('debe obtener una plantilla por ID', async () => {
      // Primero crear una plantilla
      const created = await caller.marketing.createTemplate({
        type: 'custom',
        channel: 'whatsapp',
        name: 'Plantilla para Obtener',
        content: 'Contenido de prueba {{cliente_nombre}}',
      });
      
      // Luego obtenerla
      const template = await caller.marketing.getTemplateById({ id: created.id });
      
      expect(template).toBeDefined();
      expect(template?.id).toBe(created.id);
      expect(template?.name).toBe('Plantilla para Obtener');
    });

    it('debe actualizar una plantilla existente', async () => {
      // Crear plantilla
      const created = await caller.marketing.createTemplate({
        type: 'custom',
        channel: 'whatsapp',
        name: 'Plantilla Original',
        content: 'Contenido original',
      });
      
      // Actualizar
      const result = await caller.marketing.updateTemplate({
        id: created.id,
        name: 'Plantilla Actualizada',
        content: 'Contenido actualizado {{cliente_nombre}}',
      });
      
      expect(result.success).toBe(true);
      
      // Verificar actualización
      const updated = await caller.marketing.getTemplateById({ id: created.id });
      expect(updated?.name).toBe('Plantilla Actualizada');
    });

    it('debe eliminar una plantilla', async () => {
      // Crear plantilla
      const created = await caller.marketing.createTemplate({
        type: 'custom',
        channel: 'whatsapp',
        name: 'Plantilla a Eliminar',
        content: 'Contenido',
      });
      
      // Eliminar
      const result = await caller.marketing.deleteTemplate({ id: created.id });
      expect(result.success).toBe(true);
      
      // Verificar que no existe
      const deleted = await caller.marketing.getTemplateById({ id: created.id });
      expect(deleted).toBeNull();
    });
  });

  describe('Campañas de Marketing', () => {
    let templateId: number;

    beforeAll(async () => {
      // Crear una plantilla para usar en las campañas
      const template = await caller.marketing.createTemplate({
        type: 'promotion',
        channel: 'whatsapp',
        name: 'Plantilla para Campaña',
        content: 'Hola {{cliente_nombre}}, tenemos una oferta especial.',
      });
      templateId = template.id;
    });

    it('debe crear una nueva campaña', async () => {
      const result = await caller.marketing.createCampaign({
        name: 'Campaña de Prueba',
        description: 'Descripción de la campaña',
        templateId,
      });
      
      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('number');
    });

    it('debe obtener todas las campañas', async () => {
      const campaigns = await caller.marketing.getCampaigns();
      
      expect(Array.isArray(campaigns)).toBe(true);
    });

    it('debe obtener una campaña por ID con detalles', async () => {
      // Crear campaña
      const created = await caller.marketing.createCampaign({
        name: 'Campaña Detallada',
        description: 'Para obtener detalles',
        templateId,
      });
      
      // Obtener con detalles
      const campaign = await caller.marketing.getCampaignById({ id: created.id });
      
      expect(campaign).toBeDefined();
      expect(campaign?.id).toBe(created.id);
      expect(campaign?.template).toBeDefined();
      expect(campaign?.recipients).toBeDefined();
    });

    it('debe actualizar una campaña', async () => {
      // Crear campaña
      const created = await caller.marketing.createCampaign({
        name: 'Campaña Original',
        templateId,
      });
      
      // Actualizar
      const result = await caller.marketing.updateCampaign({
        id: created.id,
        name: 'Campaña Actualizada',
        status: 'scheduled',
      });
      
      expect(result.success).toBe(true);
    });

    it('debe calcular destinatarios de una campaña', async () => {
      // Crear campaña
      const created = await caller.marketing.createCampaign({
        name: 'Campaña con Destinatarios',
        templateId,
      });
      
      // Calcular destinatarios
      const result = await caller.marketing.calculateRecipients({
        campaignId: created.id,
      });
      
      expect(result.success).toBe(true);
      expect(typeof result.totalRecipients).toBe('number');
    });

    it('debe obtener estadísticas de campañas', async () => {
      const stats = await caller.marketing.getCampaignStats();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('draft');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('completed');
    });

    it('debe eliminar una campaña', async () => {
      // Crear campaña
      const created = await caller.marketing.createCampaign({
        name: 'Campaña a Eliminar',
        templateId,
      });
      
      // Eliminar
      const result = await caller.marketing.deleteCampaign({ id: created.id });
      expect(result.success).toBe(true);
      
      // Verificar que no existe
      const deleted = await caller.marketing.getCampaignById({ id: created.id });
      expect(deleted).toBeNull();
    });
  });

  describe('Historial de Mensajes', () => {
    it('debe obtener historial de mensajes', async () => {
      const history = await caller.marketing.getMessageHistory();
      
      expect(Array.isArray(history)).toBe(true);
    });

    it('debe filtrar historial por canal', async () => {
      const history = await caller.marketing.getMessageHistory({
        channel: 'whatsapp',
      });
      
      expect(Array.isArray(history)).toBe(true);
    });
  });
});
