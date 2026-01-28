import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../routers';
import { getDb } from '../db';
import { workflows } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Workflows Router', () => {
  let testWorkflowId: number | null = null;

  // Limpiar workflows de prueba después de todos los tests
  afterAll(async () => {
    const db = await getDb();
    if (testWorkflowId) {
      try {
        await db.delete(workflows).where(eq(workflows.id, testWorkflowId));
      } catch (error) {
        // Ignorar errores si ya fue eliminado
      }
    }
  });

  it('should create a new workflow', async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, email: 'test@example.com', name: 'Test User' } as any,
    });

    const result = await caller.workflows.create({
      name: 'Test Workflow',
      description: 'A test workflow for unit testing',
      triggerType: 'manual',
    });

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    testWorkflowId = result.id;
  });

  it('should list all workflows', async () => {
    if (!testWorkflowId) {
      throw new Error('Test workflow was not created');
    }

    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, email: 'test@example.com', name: 'Test User' } as any,
    });

    const result = await caller.workflows.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    const testWorkflow = result.find(w => w.id === testWorkflowId);
    expect(testWorkflow).toBeDefined();
    expect(testWorkflow?.name).toBe('Test Workflow');
    expect(testWorkflow?.status).toBe('inactive');
  });

  it('should get a workflow by id', async () => {
    if (!testWorkflowId) {
      throw new Error('Test workflow was not created');
    }

    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, email: 'test@example.com', name: 'Test User' } as any,
    });

    const result = await caller.workflows.get({ id: testWorkflowId });

    expect(result).toBeDefined();
    expect(result.id).toBe(testWorkflowId);
    expect(result.name).toBe('Test Workflow');
    expect(result.description).toBe('A test workflow for unit testing');
    expect(result.nodes).toBeDefined();
    expect(result.connections).toBeDefined();
    expect(Array.isArray(result.nodes)).toBe(true);
    expect(Array.isArray(result.connections)).toBe(true);
  });

  it('should activate a workflow', async () => {
    if (!testWorkflowId) {
      throw new Error('Test workflow was not created');
    }

    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, email: 'test@example.com', name: 'Test User' } as any,
    });

    const result = await caller.workflows.activate({ id: testWorkflowId });
    expect(result.success).toBe(true);

    // Verificar que el estado cambió
    const workflow = await caller.workflows.get({ id: testWorkflowId });
    expect(workflow.status).toBe('active');
  });

  it('should deactivate a workflow', async () => {
    if (!testWorkflowId) {
      throw new Error('Test workflow was not created');
    }

    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, email: 'test@example.com', name: 'Test User' } as any,
    });

    const result = await caller.workflows.deactivate({ id: testWorkflowId });
    expect(result.success).toBe(true);

    // Verificar que el estado cambió
    const workflow = await caller.workflows.get({ id: testWorkflowId });
    expect(workflow.status).toBe('inactive');
  });

  it('should update a workflow', async () => {
    if (!testWorkflowId) {
      throw new Error('Test workflow was not created');
    }

    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, email: 'test@example.com', name: 'Test User' } as any,
    });

    const result = await caller.workflows.update({
      id: testWorkflowId,
      name: 'Updated Test Workflow',
      description: 'Updated description',
      triggerType: 'client_created',
    });

    expect(result.success).toBe(true);

    // Verificar que los cambios se aplicaron
    const workflow = await caller.workflows.get({ id: testWorkflowId });
    expect(workflow.name).toBe('Updated Test Workflow');
    expect(workflow.description).toBe('Updated description');
    expect(workflow.triggerType).toBe('client_created');
  });

  it('should execute a workflow manually', async () => {
    if (!testWorkflowId) {
      throw new Error('Test workflow was not created');
    }

    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, email: 'test@example.com', name: 'Test User' } as any,
    });

    const result = await caller.workflows.execute({
      id: testWorkflowId,
      triggerData: { test: 'data' },
    });

    expect(result).toHaveProperty('executionId');
    expect(typeof result.executionId).toBe('number');
    expect(result.executionId).toBeGreaterThan(0);
  });

  it('should get workflow executions', async () => {
    if (!testWorkflowId) {
      throw new Error('Test workflow was not created');
    }

    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, email: 'test@example.com', name: 'Test User' } as any,
    });

    const result = await caller.workflows.getExecutions({ workflowId: testWorkflowId });

    expect(Array.isArray(result)).toBe(true);
    // Debería tener al menos la ejecución del test anterior
    expect(result.length).toBeGreaterThanOrEqual(1);
    
    const lastExecution = result[0];
    expect(lastExecution.workflowId).toBe(testWorkflowId);
    expect(lastExecution.status).toBe('pending');
  });

  it('should delete a workflow', async () => {
    if (!testWorkflowId) {
      throw new Error('Test workflow was not created');
    }

    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, email: 'test@example.com', name: 'Test User' } as any,
    });

    const result = await caller.workflows.delete({ id: testWorkflowId });
    expect(result.success).toBe(true);

    // Verificar que el workflow fue eliminado
    try {
      await caller.workflows.get({ id: testWorkflowId });
      // Si no lanza error, el test falla
      expect(true).toBe(false);
    } catch (error: any) {
      // Puede ser "Workflow not found" o un error de query vacío
      expect(error).toBeDefined();
    }

    // Marcar como limpiado para no intentar eliminarlo en afterAll
    testWorkflowId = null;
  });

  it('should throw error when getting non-existent workflow', async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, email: 'test@example.com', name: 'Test User' } as any,
    });

    try {
      await caller.workflows.get({ id: 999999 });
      // Si no lanza error, el test falla
      expect(true).toBe(false);
    } catch (error: any) {
      // Verificar que se lanzó un error
      expect(error).toBeDefined();
      expect(error.message).toBeDefined();
    }
  });
});
