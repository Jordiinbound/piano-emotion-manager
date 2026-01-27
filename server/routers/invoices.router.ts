/**
 * Invoices Router - tRPC
 * Piano Emotion Manager
 * 
 * Endpoints para gestión de facturas/invoices
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { invoices, users } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { generatePaymentToken } from '../utils/paymentToken';
import { sendInvoiceEmail } from '../utils/emailService';
import { generateReceiptPDF } from '../utils/receiptPDF';

export const invoicesRouter = router({
  // Obtener estadísticas de facturas
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Contar total de facturas
    const totalResult = await db.execute(sql`SELECT COUNT(*) as count, SUM(total) as total FROM invoices`);
    const totalData = (totalResult as any)[0]?.[0];
    const count = totalData?.count || 0;
    const total = parseFloat(totalData?.total || '0');

    // Sumar pendiente (enviadas)
    const pendingResult = await db.execute(sql`SELECT SUM(total) as total FROM invoices WHERE status = 'sent'`);
    const pending = parseFloat((pendingResult as any)[0]?.[0]?.total || '0');

    // Sumar cobrado (pagadas)
    const paidResult = await db.execute(sql`SELECT SUM(total) as total FROM invoices WHERE status = 'paid'`);
    const paid = parseFloat((paidResult as any)[0]?.[0]?.total || '0');

    // Contar borradores
    const draftResult = await db.execute(sql`SELECT COUNT(*) as count FROM invoices WHERE status = 'draft'`);
    const draft = (draftResult as any)[0]?.[0]?.count || 0;

    return {
      total,
      pending,
      paid,
      draft,
      count,
    };
  }),

  // Obtener lista de facturas con paginación y filtros
  getInvoices: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(50),
        search: z.string().optional(),
        status: z.enum(['draft', 'sent', 'paid', 'cancelled']).optional(),
        period: z.enum(['all', 'thisMonth', 'lastMonth', 'thisYear']).default('all'),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { page, pageSize, search, status, period } = input;
      const offset = (page - 1) * pageSize;

      // Construir query base
      let baseQuery = `
        SELECT 
          id, odId, invoiceNumber, clientId, clientName, clientEmail, 
          date, dueDate, status, subtotal, taxAmount, total, notes, createdAt, updatedAt
        FROM invoices
        WHERE 1=1
      `;

      if (search) {
        baseQuery += ` AND (invoiceNumber LIKE '%${search}%' OR clientName LIKE '%${search}%')`;
      }

      if (status) {
        baseQuery += ` AND status = '${status}'`;
      }

      // Filtro de período
      if (period !== 'all') {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        if (period === 'thisMonth') {
          baseQuery += ` AND YEAR(date) = ${year} AND MONTH(date) = ${month}`;
        } else if (period === 'lastMonth') {
          const lastMonth = month === 1 ? 12 : month - 1;
          const lastMonthYear = month === 1 ? year - 1 : year;
          baseQuery += ` AND YEAR(date) = ${lastMonthYear} AND MONTH(date) = ${lastMonth}`;
        } else if (period === 'thisYear') {
          baseQuery += ` AND YEAR(date) = ${year}`;
        }
      }

      baseQuery += ` ORDER BY date DESC, id DESC LIMIT ${pageSize} OFFSET ${offset}`;

      const result = await db.execute(sql.raw(baseQuery));
      const invoicesList = (result as any)[0] || [];

      // Contar total
      let countQuery = `SELECT COUNT(*) as count FROM invoices WHERE 1=1`;

      if (search) {
        countQuery += ` AND (invoiceNumber LIKE '%${search}%' OR clientName LIKE '%${search}%')`;
      }

      if (status) {
        countQuery += ` AND status = '${status}'`;
      }

      if (period !== 'all') {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        if (period === 'thisMonth') {
          countQuery += ` AND YEAR(date) = ${year} AND MONTH(date) = ${month}`;
        } else if (period === 'lastMonth') {
          const lastMonth = month === 1 ? 12 : month - 1;
          const lastMonthYear = month === 1 ? year - 1 : year;
          countQuery += ` AND YEAR(date) = ${lastMonthYear} AND MONTH(date) = ${lastMonth}`;
        } else if (period === 'thisYear') {
          countQuery += ` AND YEAR(date) = ${year}`;
        }
      }

      const countResult = await db.execute(sql.raw(countQuery));
      const total = (countResult as any)[0]?.[0]?.count || 0;

      return {
        invoices: invoicesList,
        total,
        page,
        pageSize,
      };
    }),

  // Obtener factura por ID
  getInvoiceById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const query = `
        SELECT 
          id, odId, invoiceNumber, clientId, clientName, clientEmail, clientAddress,
          date, dueDate, status, items, subtotal, taxAmount, total, notes, businessInfo, createdAt, updatedAt
        FROM invoices
        WHERE id = ${input.id}
      `;

      const result = await db.execute(sql.raw(query));
      const invoice = (result as any)[0]?.[0] || null;

      return invoice;
    }),

  // Crear nueva factura
  createInvoice: publicProcedure
    .input(
      z.object({
        clientId: z.number(),
        clientName: z.string(),
        clientEmail: z.string().optional(),
        clientAddress: z.string().optional(),
        date: z.string(), // ISO timestamp string
        dueDate: z.string().optional(),
        status: z.enum(['draft', 'sent', 'paid', 'cancelled']).default('draft'),
        items: z.any().optional(), // JSON
        subtotal: z.number(),
        taxAmount: z.number(),
        total: z.number(),
        notes: z.string().optional(),
        businessInfo: z.any().optional(), // JSON
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Generar número de factura único
      const year = new Date().getFullYear();
      const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM invoices WHERE YEAR(date) = ${year}`);
      const count = (countResult as any)[0]?.[0]?.count || 0;
      const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;

      const odId = `INV-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const result = await db.insert(invoices).values({ 
        ...input, 
        odId, 
        invoiceNumber,
        partnerId: 1 
      } as any);

      return {
        success: true,
        invoiceId: (result as any).insertId || 0,
        invoiceNumber,
      };
    }),

  // Actualizar factura
  updateInvoice: publicProcedure
    .input(
      z.object({
        id: z.number(),
        clientId: z.number().optional(),
        clientName: z.string().optional(),
        clientEmail: z.string().optional(),
        clientAddress: z.string().optional(),
        date: z.string().optional(),
        dueDate: z.string().optional(),
        status: z.enum(['draft', 'sent', 'paid', 'cancelled']).optional(),
        items: z.any().optional(),
        subtotal: z.number().optional(),
        taxAmount: z.number().optional(),
        total: z.number().optional(),
        notes: z.string().optional(),
        businessInfo: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updateData } = input;
      const result = await db.update(invoices).set(updateData as any).where(eq(invoices.id, id));

      return {
        success: true,
        updated: (result as any).rowsAffected || 0,
      };
    }),

  // Eliminar factura
  deleteInvoice: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.delete(invoices).where(eq(invoices.id, input.id));

      return {
        success: true,
        deleted: (result as any).rowsAffected || 0,
      };
    }),

  // Obtener factura por token de pago (público)
  getByPaymentToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.select().from(invoices).where(eq(invoices.paymentToken, input.token));
      
      if (!result || result.length === 0) {
        throw new Error('Factura no encontrada');
      }

      return result[0];
    }),

  // Enviar factura por email
  sendInvoiceEmail: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener la factura
      const invoiceResult = await db.select().from(invoices).where(eq(invoices.id, input.invoiceId));
      
      if (!invoiceResult || invoiceResult.length === 0) {
        throw new Error('Factura no encontrada');
      }

      const invoice = invoiceResult[0];

      // Verificar que la factura tenga email del cliente
      if (!invoice.clientEmail) {
        throw new Error('La factura no tiene email del cliente');
      }

      // Generar token de pago si no existe
      let paymentToken = invoice.paymentToken;
      if (!paymentToken) {
        paymentToken = generatePaymentToken();
        await db.update(invoices).set({ paymentToken }).where(eq(invoices.id, input.invoiceId));
      }

      // Obtener configuración SMTP del usuario
      const userResult = await db.select().from(users).where(eq(users.id, ctx.user.id));
      
      if (!userResult || userResult.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const user = userResult[0];

      // Verificar que el usuario tenga configuración SMTP
      if (!user.smtpHost || !user.smtpUser || !user.smtpPassword) {
        throw new Error('Debe configurar su servidor SMTP en Configuración antes de enviar emails');
      }

      // Preparar URLs
      const paymentUrl = `${ctx.req.headers.origin}/pay/${paymentToken}`;
      const portalUrl = `${ctx.req.headers.origin}/client-portal`;

      // Preparar items de la factura
      let invoiceItems = invoice.items as any;
      
      // Si no hay items o está vacío, crear un item genérico
      if (!invoiceItems || (Array.isArray(invoiceItems) && invoiceItems.length === 0)) {
        invoiceItems = [{
          description: 'Servicio de afinación de piano',
          quantity: 1,
          price: Number(invoice.subtotal) || 0
        }];
      }
      
      // Asegurar que todos los items tengan los campos necesarios
      invoiceItems = invoiceItems.map((item: any) => ({
        description: item.description || 'Servicio',
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0
      }));

      // Enviar email
      const success = await sendInvoiceEmail(
        {
          host: user.smtpHost,
          port: user.smtpPort || 587,
          secure: user.smtpSecure === 1,
          user: user.smtpUser,
          password: user.smtpPassword,
          fromName: user.smtpFromName || user.name || 'Piano Emotion',
        },
        {
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          dueDate: invoice.dueDate,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          clientAddress: invoice.clientAddress,
          items: invoiceItems,
          subtotal: invoice.subtotal,
          taxAmount: invoice.taxAmount,
          total: invoice.total,
          notes: invoice.notes,
          businessInfo: invoice.businessInfo,
          paymentToken,
          paymentUrl,
          portalUrl,
        }
      );

      if (!success) {
        throw new Error('Error al enviar el email. Verifique su configuración SMTP.');
      }

      return {
        success: true,
        message: 'Factura enviada por email correctamente',
      };
    }),

  // Generar recibo en PDF para factura pagada
  generateReceipt: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener la factura
      const invoiceResult = await db.select().from(invoices).where(eq(invoices.id, input.invoiceId));
      
      if (!invoiceResult || invoiceResult.length === 0) {
        throw new Error('Factura no encontrada');
      }

      const invoice = invoiceResult[0];

      // Verificar que la factura esté pagada
      if (invoice.status !== 'paid') {
        throw new Error('Solo se pueden generar recibos para facturas pagadas');
      }

      // Generar número de recibo
      const receiptNumber = `REC-${invoice.invoiceNumber.replace('INV-', '')}`;

      // Generar PDF del recibo
      const pdfBuffer = await generateReceiptPDF({
        receiptNumber,
        invoiceNumber: invoice.invoiceNumber,
        paymentDate: invoice.updatedAt || new Date(),
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail || '',
        clientAddress: invoice.clientAddress,
        paymentMethod: 'Stripe',
        transactionId: invoice.stripePaymentIntentId,
        amountPaid: invoice.total,
        notes: invoice.notes,
        businessInfo: invoice.businessInfo,
      });

      // Convertir buffer a base64 para enviar al cliente
      const base64PDF = pdfBuffer.toString('base64');

      return {
        success: true,
        pdf: base64PDF,
        filename: `Recibo-${invoice.invoiceNumber}.pdf`,
      };
    }),
});
