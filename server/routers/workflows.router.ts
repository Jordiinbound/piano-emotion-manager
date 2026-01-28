import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { workflows, workflowNodes, workflowConnections, workflowExecutions } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { executeWorkflow } from '../workflow-engine';

export const workflowsRouter = router({
  // Listar todos los workflows
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const allWorkflows = await db.select().from(workflows).orderBy(desc(workflows.createdAt));
    return allWorkflows;
  }),

  // Obtener workflow por ID con nodos y conexiones
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      const [workflow] = await db.select().from(workflows).where(eq(workflows.id, input.id));
      if (!workflow) throw new Error('Workflow not found');

      const nodes = await db.select().from(workflowNodes).where(eq(workflowNodes.workflowId, input.id));
      const connections = await db.select().from(workflowConnections).where(eq(workflowConnections.workflowId, input.id));

      return {
        ...workflow,
        nodes,
        connections,
      };
    }),

  // Crear nuevo workflow
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      triggerType: z.string(),
      triggerConfig: z.any().optional(),
      nodes: z.array(z.object({
        nodeType: z.enum(['trigger', 'condition', 'action', 'delay']),
        nodeConfig: z.any(),
        positionX: z.number(),
        positionY: z.number(),
      })).optional(),
      connections: z.array(z.object({
        sourceNodeId: z.number(),
        targetNodeId: z.number(),
        connectionType: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Crear workflow
      const values: any = {
        name: input.name,
        triggerType: input.triggerType,
        status: 'inactive',
      };
      
      if (input.description) {
        values.description = input.description;
      }
      
      if (input.triggerConfig) {
        values.triggerConfig = input.triggerConfig;
      }
      
      const result = await db.insert(workflows).values(values);

      return { id: (result as any).insertId || 0 };
    }),

  // Actualizar workflow
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      triggerType: z.string().optional(),
      triggerConfig: z.any().optional(),
      nodes: z.array(z.object({
        id: z.number().optional(),
        nodeType: z.enum(['trigger', 'condition', 'action', 'delay']),
        nodeConfig: z.any(),
        positionX: z.number(),
        positionY: z.number(),
      })).optional(),
      connections: z.array(z.object({
        id: z.number().optional(),
        sourceNodeId: z.number(),
        targetNodeId: z.number(),
        connectionType: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Actualizar workflow
      await db.update(workflows)
        .set({
          name: input.name,
          description: input.description,
          triggerType: input.triggerType,
          triggerConfig: input.triggerConfig,
        })
        .where(eq(workflows.id, input.id));

      // TODO: Actualizar nodos y conexiones

      return { success: true };
    }),

  // Eliminar workflow
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.delete(workflows).where(eq(workflows.id, input.id));
      return { success: true };
    }),

  // Activar workflow
  activate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(workflows)
        .set({ status: 'active' })
        .where(eq(workflows.id, input.id));
      return { success: true };
    }),

  // Desactivar workflow
  deactivate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(workflows)
        .set({ status: 'inactive' })
        .where(eq(workflows.id, input.id));
      return { success: true };
    }),

  // Obtener historial de ejecuciones
  getExecutions: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const executions = await db.select()
        .from(workflowExecutions)
        .where(eq(workflowExecutions.workflowId, input.workflowId))
        .orderBy(desc(workflowExecutions.createdAt))
        .limit(50);
      return executions;
    }),

  // Ejecutar workflow manualmente
  execute: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      triggerData: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Crear registro de ejecución
      // Ejecutar workflow usando el motor
      const executionResult = await executeWorkflow(input.id, input.triggerData);
      
      if (!executionResult.success) {
        throw new Error(executionResult.error || 'Failed to execute workflow');
      }
      
      return { 
        executionId: executionResult.executionId || 0,
        success: true,
        message: executionResult.message,
      };
    }),
});
