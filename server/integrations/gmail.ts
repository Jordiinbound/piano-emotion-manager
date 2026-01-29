/**
 * Gmail Integration
 * Piano Emotion Manager
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  attachments?: string[];
}

/**
 * Envía un email usando Gmail MCP CLI
 */
export async function sendGmailEmail(params: SendEmailParams): Promise<{ messageId: string }> {
  try {
    console.log('[Gmail] Enviando email a:', params.to);

    const emailInput: any = {
      to: params.to,
      subject: params.subject,
      body: params.body
    };

    // Agregar CC si se proporciona
    if (params.cc) {
      emailInput.cc = params.cc;
    }

    // Agregar BCC si se proporciona
    if (params.bcc) {
      emailInput.bcc = params.bcc;
    }

    // Nota: Los attachments requieren manejo especial con URLs o paths
    if (params.attachments && params.attachments.length > 0) {
      emailInput.attachments = params.attachments;
    }

    const sendCmd = `manus-mcp-cli tool call gmail_send_email --server gmail --input '${JSON.stringify(emailInput)}'`;

    const { stdout } = await execAsync(sendCmd);
    const result = JSON.parse(stdout);

    console.log('[Gmail] Email enviado exitosamente:', result.id);

    return {
      messageId: result.id
    };
  } catch (error: any) {
    console.error('[Gmail] Error al enviar email:', error);
    throw new Error(`Error al enviar email con Gmail: ${error.message}`);
  }
}

/**
 * Busca emails en Gmail
 */
export async function searchGmailEmails(query: string, maxResults: number = 10): Promise<any[]> {
  try {
    console.log('[Gmail] Buscando emails:', query);

    const searchCmd = `manus-mcp-cli tool call gmail_search_emails --server gmail --input '${JSON.stringify({
      query: query,
      max_results: maxResults
    })}'`;

    const { stdout } = await execAsync(searchCmd);
    const result = JSON.parse(stdout);

    console.log('[Gmail] Emails encontrados:', result.messages?.length || 0);

    return result.messages || [];
  } catch (error: any) {
    console.error('[Gmail] Error al buscar emails:', error);
    throw new Error(`Error al buscar emails en Gmail: ${error.message}`);
  }
}

/**
 * Obtiene un email específico por ID
 */
export async function getGmailEmail(messageId: string): Promise<any> {
  try {
    const getCmd = `manus-mcp-cli tool call gmail_get_email --server gmail --input '${JSON.stringify({
      message_id: messageId
    })}'`;

    const { stdout } = await execAsync(getCmd);
    return JSON.parse(stdout);
  } catch (error: any) {
    console.error('[Gmail] Error al obtener email:', error);
    throw new Error(`Error al obtener email de Gmail: ${error.message}`);
  }
}

/**
 * Crea un borrador de email
 */
export async function createGmailDraft(params: SendEmailParams): Promise<{ draftId: string }> {
  try {
    console.log('[Gmail] Creando borrador para:', params.to);

    const draftInput: any = {
      to: params.to,
      subject: params.subject,
      body: params.body
    };

    if (params.cc) {
      draftInput.cc = params.cc;
    }

    if (params.bcc) {
      draftInput.bcc = params.bcc;
    }

    const createCmd = `manus-mcp-cli tool call gmail_create_draft --server gmail --input '${JSON.stringify(draftInput)}'`;

    const { stdout } = await execAsync(createCmd);
    const result = JSON.parse(stdout);

    console.log('[Gmail] Borrador creado exitosamente:', result.id);

    return {
      draftId: result.id
    };
  } catch (error: any) {
    console.error('[Gmail] Error al crear borrador:', error);
    throw new Error(`Error al crear borrador en Gmail: ${error.message}`);
  }
}
