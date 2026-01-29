/**
 * Google Calendar Integration
 * Piano Emotion Manager
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CreateEventParams {
  eventTitle: string;
  date: string; // ISO 8601 format
  duration: number; // en minutos
  eventDescription?: string;
  attendees?: string; // emails separados por comas
  location?: string;
  reminders?: number[]; // minutos antes del evento
}

/**
 * Crea un evento en Google Calendar usando MCP CLI
 */
export async function createCalendarEvent(params: CreateEventParams): Promise<{ eventId: string; url: string }> {
  try {
    console.log('[Google Calendar] Creando evento:', params.eventTitle);

    // Calcular fecha de inicio y fin
    const startDate = new Date(params.date);
    const endDate = new Date(startDate.getTime() + params.duration * 60 * 1000);

    const eventInput: any = {
      summary: params.eventTitle,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Europe/Madrid' // Ajustar según necesidad
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Madrid'
      }
    };

    // Agregar descripción si se proporciona
    if (params.eventDescription) {
      eventInput.description = params.eventDescription;
    }

    // Agregar ubicación si se proporciona
    if (params.location) {
      eventInput.location = params.location;
    }

    // Agregar asistentes si se proporcionan
    if (params.attendees) {
      const attendeeEmails = params.attendees.split(',').map(email => email.trim());
      eventInput.attendees = attendeeEmails.map(email => ({ email }));
    }

    // Agregar recordatorios si se proporcionan
    if (params.reminders && params.reminders.length > 0) {
      eventInput.reminders = {
        useDefault: false,
        overrides: params.reminders.map(minutes => ({
          method: 'popup',
          minutes: minutes
        }))
      };
    } else {
      eventInput.reminders = {
        useDefault: true
      };
    }

    const createCmd = `manus-mcp-cli tool call google_calendar_create_event --server google-calendar --input '${JSON.stringify(eventInput)}'`;

    const { stdout } = await execAsync(createCmd);
    const result = JSON.parse(stdout);

    console.log('[Google Calendar] Evento creado exitosamente:', result.id);

    return {
      eventId: result.id,
      url: result.htmlLink || result.link
    };
  } catch (error: any) {
    console.error('[Google Calendar] Error al crear evento:', error);
    throw new Error(`Error al crear evento en Google Calendar: ${error.message}`);
  }
}

/**
 * Lista eventos del calendario
 */
export async function listCalendarEvents(
  startDate: string,
  endDate: string,
  maxResults: number = 10
): Promise<any[]> {
  try {
    console.log('[Google Calendar] Listando eventos');

    const listCmd = `manus-mcp-cli tool call google_calendar_list_events --server google-calendar --input '${JSON.stringify({
      time_min: new Date(startDate).toISOString(),
      time_max: new Date(endDate).toISOString(),
      max_results: maxResults
    })}'`;

    const { stdout } = await execAsync(listCmd);
    const result = JSON.parse(stdout);

    console.log('[Google Calendar] Eventos encontrados:', result.items?.length || 0);

    return result.items || [];
  } catch (error: any) {
    console.error('[Google Calendar] Error al listar eventos:', error);
    throw new Error(`Error al listar eventos de Google Calendar: ${error.message}`);
  }
}

/**
 * Obtiene un evento específico
 */
export async function getCalendarEvent(eventId: string): Promise<any> {
  try {
    const getCmd = `manus-mcp-cli tool call google_calendar_get_event --server google-calendar --input '${JSON.stringify({
      event_id: eventId
    })}'`;

    const { stdout } = await execAsync(getCmd);
    return JSON.parse(stdout);
  } catch (error: any) {
    console.error('[Google Calendar] Error al obtener evento:', error);
    throw new Error(`Error al obtener evento de Google Calendar: ${error.message}`);
  }
}

/**
 * Actualiza un evento existente
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CreateEventParams>
): Promise<void> {
  try {
    console.log('[Google Calendar] Actualizando evento:', eventId);

    const updateInput: any = {
      event_id: eventId
    };

    if (updates.eventTitle) {
      updateInput.summary = updates.eventTitle;
    }

    if (updates.eventDescription) {
      updateInput.description = updates.eventDescription;
    }

    if (updates.location) {
      updateInput.location = updates.location;
    }

    if (updates.date && updates.duration) {
      const startDate = new Date(updates.date);
      const endDate = new Date(startDate.getTime() + updates.duration * 60 * 1000);
      updateInput.start = {
        dateTime: startDate.toISOString(),
        timeZone: 'Europe/Madrid'
      };
      updateInput.end = {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Madrid'
      };
    }

    const updateCmd = `manus-mcp-cli tool call google_calendar_update_event --server google-calendar --input '${JSON.stringify(updateInput)}'`;

    await execAsync(updateCmd);
    console.log('[Google Calendar] Evento actualizado exitosamente');
  } catch (error: any) {
    console.error('[Google Calendar] Error al actualizar evento:', error);
    throw new Error(`Error al actualizar evento en Google Calendar: ${error.message}`);
  }
}

/**
 * Elimina un evento
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    console.log('[Google Calendar] Eliminando evento:', eventId);

    const deleteCmd = `manus-mcp-cli tool call google_calendar_delete_event --server google-calendar --input '${JSON.stringify({
      event_id: eventId
    })}'`;

    await execAsync(deleteCmd);
    console.log('[Google Calendar] Evento eliminado exitosamente');
  } catch (error: any) {
    console.error('[Google Calendar] Error al eliminar evento:', error);
    throw new Error(`Error al eliminar evento de Google Calendar: ${error.message}`);
  }
}
