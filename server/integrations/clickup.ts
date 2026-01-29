/**
 * ClickUp Integration
 * Piano Emotion Manager
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CreateTaskParams {
  taskName: string;
  listName: string;
  taskDescription?: string;
  assignee?: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  dueDate?: string;
}

/**
 * Crea una tarea en ClickUp usando MCP CLI
 */
export async function createClickUpTask(params: CreateTaskParams): Promise<{ taskId: string; url: string }> {
  try {
    console.log('[ClickUp] Creando tarea:', params);

    // Primero, buscar la lista por nombre
    const searchListCmd = `manus-mcp-cli tool call clickup_search --server clickup --input '${JSON.stringify({
      query: params.listName,
      type: 'list',
      limit: 1
    })}'`;

    const { stdout: listSearchResult } = await execAsync(searchListCmd);
    const listData = JSON.parse(listSearchResult);
    
    if (!listData.results || listData.results.length === 0) {
      throw new Error(`Lista "${params.listName}" no encontrada en ClickUp`);
    }

    const listId = listData.results[0].id;
    console.log('[ClickUp] Lista encontrada:', listId);

    // Mapear prioridad a número (ClickUp usa 1=urgent, 2=high, 3=normal, 4=low)
    const priorityMap = {
      urgent: 1,
      high: 2,
      normal: 3,
      low: 4
    };
    const priority = params.priority ? priorityMap[params.priority] : 3;

    // Crear la tarea
    const createTaskInput: any = {
      list_id: listId,
      name: params.taskName,
      description: params.taskDescription || '',
      priority: priority
    };

    // Agregar fecha de vencimiento si se proporciona
    if (params.dueDate) {
      createTaskInput.due_date = new Date(params.dueDate).getTime();
    }

    // Agregar asignado si se proporciona
    if (params.assignee) {
      createTaskInput.assignees = [params.assignee];
    }

    const createTaskCmd = `manus-mcp-cli tool call clickup_create_task --server clickup --input '${JSON.stringify(createTaskInput)}'`;

    const { stdout: createResult } = await execAsync(createTaskCmd);
    const taskData = JSON.parse(createResult);

    console.log('[ClickUp] Tarea creada exitosamente:', taskData.id);

    return {
      taskId: taskData.id,
      url: taskData.url
    };
  } catch (error: any) {
    console.error('[ClickUp] Error al crear tarea:', error);
    throw new Error(`Error al crear tarea en ClickUp: ${error.message}`);
  }
}

/**
 * Actualiza el estado de una tarea en ClickUp
 */
export async function updateClickUpTaskStatus(taskId: string, status: string): Promise<void> {
  try {
    console.log('[ClickUp] Actualizando estado de tarea:', taskId, status);

    const updateCmd = `manus-mcp-cli tool call clickup_update_task --server clickup --input '${JSON.stringify({
      task_id: taskId,
      status: status
    })}'`;

    await execAsync(updateCmd);
    console.log('[ClickUp] Estado actualizado exitosamente');
  } catch (error: any) {
    console.error('[ClickUp] Error al actualizar estado:', error);
    throw new Error(`Error al actualizar estado en ClickUp: ${error.message}`);
  }
}

/**
 * Obtiene información de una tarea
 */
export async function getClickUpTask(taskId: string): Promise<any> {
  try {
    const getCmd = `manus-mcp-cli tool call clickup_get_task --server clickup --input '${JSON.stringify({
      task_id: taskId
    })}'`;

    const { stdout } = await execAsync(getCmd);
    return JSON.parse(stdout);
  } catch (error: any) {
    console.error('[ClickUp] Error al obtener tarea:', error);
    throw new Error(`Error al obtener tarea de ClickUp: ${error.message}`);
  }
}
