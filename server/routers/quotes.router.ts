/**
 * Quotes Router - tRPC
 * Piano Emotion Manager
 * 
 * Endpoints para gestión de presupuestos con plantillas y conversión a factura
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { quotes, quoteTemplates, clients, pianos, invoices } from '../../drizzle/schema';
import { eq, and, like, or, sql, desc, gte, lte } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// ============================================================================
// ESQUEMAS DE VALIDACIÓN
// ============================================================================

const quoteItemSchema = z.object({
  id: z.string(),
  type: z.enum(['service', 'part', 'labor', 'travel', 'material', 'other']),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).max(100).default(0),
  taxRate: z.number().min(0).max(100).default(21),
  subtotal: z.number().min(0),
  total: z.number().min(0),
});

const businessInfoSchema = z.object({
  name: z.string().min(1).max(255),
  taxId: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
  bankAccount: z.string().max(50).optional(),
}).optional();

export const quotesRouter = router({
  // ============================================================================
  // ESTADÍSTICAS
  // ============================================================================
  
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Total de presupuestos
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(quotes);
    const total = Number(totalResult[0]?.count || 0);

    // Por estado
    const byStatusResult = await db
      .select({
        status: quotes.status,
        count: sql<number>`count(*)`,
      })
      .from(quotes)
      .groupBy(quotes.status);

    const byStatus = byStatusResult.reduce((acc, row) => {
      acc[row.status] = Number(row.count);
      return acc;
    }, {} as Record<string, number>);

    // Total en valor
    const totalValueResult = await db
      .select({ sum: sql<number>`COALESCE(SUM(total), 0)` })
      .from(quotes)
      .where(eq(quotes.status, 'accepted'));
    const totalValue = Number(totalValueResult[0]?.sum || 0);

    return {
      total,
      byStatus,
      totalValue,
    };
  }),

  // ============================================================================
  // LISTADO CON PAGINACIÓN Y FILTROS
  // ============================================================================
  
  getQuotes: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        search: z.string().optional(),
        status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']).optional(),
        clientId: z.number().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const { page, limit, search, status, clientId, dateFrom, dateTo } = input;
      const offset = (page - 1) * limit;

      const conditions = [];

      if (status) {
        conditions.push(eq(quotes.status, status));
      }

      if (clientId) {
        conditions.push(eq(quotes.clientId, clientId));
      }

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        conditions.push(
          or(
            like(quotes.quoteNumber, searchTerm),
            like(quotes.clientName, searchTerm),
            like(quotes.title, searchTerm),
            like(quotes.description, searchTerm)
          )
        );
      }

      if (dateFrom) {
        conditions.push(gte(quotes.date, new Date(dateFrom)));
      }

      if (dateTo) {
        conditions.push(lte(quotes.date, new Date(dateTo)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(quotes)
        .where(whereClause)
        .orderBy(desc(quotes.date))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(quotes)
        .where(whereClause);
      
      const totalCount = Number(countResult[0]?.count || 0);

      return {
        items,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }),

  // ============================================================================
  // OBTENER PRESUPUESTO POR ID
  // ============================================================================
  
  getQuoteById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db
        .select()
        .from(quotes)
        .where(eq(quotes.id, input.id))
        .limit(1);

      if (!result || result.length === 0) {
        throw new Error('Quote not found');
      }

      return result[0];
    }),

  // ============================================================================
  // CREAR PRESUPUESTO
  // ============================================================================
  
  createQuote: publicProcedure
    .input(
      z.object({
        clientId: z.number(),
        pianoId: z.number().optional(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        date: z.string(),
        validUntil: z.string(),
        items: z.array(quoteItemSchema),
        notes: z.string().optional(),
        termsAndConditions: z.string().optional(),
        businessInfo: businessInfoSchema,
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener información del cliente
      const clientResult = await db
        .select()
        .from(clients)
        .where(eq(clients.id, input.clientId))
        .limit(1);

      if (!clientResult || clientResult.length === 0) {
        throw new Error('Client not found');
      }

      const client = clientResult[0];

      // Obtener información del piano si existe
      let pianoDescription = '';
      if (input.pianoId) {
        const pianoResult = await db
          .select()
          .from(pianos)
          .where(eq(pianos.id, input.pianoId))
          .limit(1);

        if (pianoResult && pianoResult.length > 0) {
          const piano = pianoResult[0];
          pianoDescription = `${piano.brand} ${piano.model}`;
        }
      }

      // Generar número de presupuesto
      const year = new Date().getFullYear();
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(quotes);
      const count = Number(countResult[0]?.count || 0) + 1;
      const quoteNumber = `PRE-${year}-${String(count).padStart(4, '0')}`;

      // Calcular totales
      const subtotal = input.items.reduce((sum, item) => sum + item.subtotal, 0);
      const totalDiscount = input.items.reduce((sum, item) => {
        const discountAmount = (item.unitPrice * item.quantity * item.discount) / 100;
        return sum + discountAmount;
      }, 0);
      const taxAmount = input.items.reduce((sum, item) => {
        const itemSubtotal = item.unitPrice * item.quantity * (1 - item.discount / 100);
        return sum + (itemSubtotal * item.taxRate) / 100;
      }, 0);
      const total = subtotal - totalDiscount + taxAmount;

      // Crear presupuesto
      const result = await db.insert(quotes).values({
        odId: nanoid(),
        quoteNumber,
        clientId: input.clientId,
        clientName: client.name,
        clientEmail: client.email || '',
        clientAddress: client.address || '',
        pianoId: input.pianoId || null,
        pianoDescription,
        title: input.title,
        description: input.description || '',
        date: new Date(input.date),
        validUntil: new Date(input.validUntil),
        status: 'draft',
        items: JSON.stringify(input.items),
        subtotal: subtotal.toString(),
        totalDiscount: totalDiscount.toString(),
        taxAmount: taxAmount.toString(),
        total: total.toString(),
        currency: 'EUR',
        notes: input.notes || '',
        termsAndConditions: input.termsAndConditions || '',
        businessInfo: input.businessInfo ? JSON.stringify(input.businessInfo) : null,
        partnerId: 1,
        organizationId: null,
      });

      return {
        id: Number(result.insertId),
        quoteNumber,
      };
    }),

  // ============================================================================
  // ACTUALIZAR PRESUPUESTO
  // ============================================================================
  
  updateQuote: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        validUntil: z.string().optional(),
        items: z.array(quoteItemSchema).optional(),
        notes: z.string().optional(),
        termsAndConditions: z.string().optional(),
        businessInfo: businessInfoSchema,
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updates } = input;

      // Recalcular totales si se actualizan los items
      if (updates.items) {
        const subtotal = updates.items.reduce((sum, item) => sum + item.subtotal, 0);
        const totalDiscount = updates.items.reduce((sum, item) => {
          const discountAmount = (item.unitPrice * item.quantity * item.discount) / 100;
          return sum + discountAmount;
        }, 0);
        const taxAmount = updates.items.reduce((sum, item) => {
          const itemSubtotal = item.unitPrice * item.quantity * (1 - item.discount / 100);
          return sum + (itemSubtotal * item.taxRate) / 100;
        }, 0);
        const total = subtotal - totalDiscount + taxAmount;

        await db.update(quotes).set({
          ...updates,
          items: JSON.stringify(updates.items),
          subtotal: subtotal.toString(),
          totalDiscount: totalDiscount.toString(),
          taxAmount: taxAmount.toString(),
          total: total.toString(),
          businessInfo: updates.businessInfo ? JSON.stringify(updates.businessInfo) : null,
        }).where(eq(quotes.id, id));
      } else {
        await db.update(quotes).set({
          ...updates,
          businessInfo: updates.businessInfo ? JSON.stringify(updates.businessInfo) : null,
        }).where(eq(quotes.id, id));
      }

      return { success: true };
    }),

  // ============================================================================
  // CAMBIAR ESTADO
  // ============================================================================
  
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const updateData: any = { status: input.status };

      if (input.status === 'sent') {
        updateData.sentAt = new Date();
      } else if (input.status === 'accepted') {
        updateData.acceptedAt = new Date();
      } else if (input.status === 'rejected') {
        updateData.rejectedAt = new Date();
      }

      await db.update(quotes).set(updateData).where(eq(quotes.id, input.id));

      return { success: true };
    }),

  // ============================================================================
  // ELIMINAR PRESUPUESTO
  // ============================================================================
  
  deleteQuote: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(quotes).where(eq(quotes.id, input.id));

      return { success: true };
    }),

  // ============================================================================
  // CONVERTIR A FACTURA
  // ============================================================================
  
  convertToInvoice: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener presupuesto
      const quoteResult = await db
        .select()
        .from(quotes)
        .where(eq(quotes.id, input.id))
        .limit(1);

      if (!quoteResult || quoteResult.length === 0) {
        throw new Error('Quote not found');
      }

      const quote = quoteResult[0];

      if (quote.status === 'converted') {
        throw new Error('Quote already converted to invoice');
      }

      // Generar número de factura
      const year = new Date().getFullYear();
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(invoices);
      const count = Number(countResult[0]?.count || 0) + 1;
      const invoiceNumber = `FAC-${year}-${String(count).padStart(4, '0')}`;

      // Crear factura
      const invoiceResult = await db.insert(invoices).values({
        odId: nanoid(),
        invoiceNumber,
        clientId: quote.clientId,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientAddress: quote.clientAddress,
        pianoId: quote.pianoId,
        pianoDescription: quote.pianoDescription,
        title: quote.title,
        description: quote.description,
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        status: 'draft',
        items: quote.items,
        subtotal: quote.subtotal,
        totalDiscount: quote.totalDiscount,
        taxAmount: quote.taxAmount,
        total: quote.total,
        currency: quote.currency,
        notes: quote.notes,
        termsAndConditions: quote.termsAndConditions,
        businessInfo: quote.businessInfo,
        partnerId: quote.partnerId,
        organizationId: quote.organizationId,
      });

      const invoiceId = Number(invoiceResult.insertId);

      // Actualizar presupuesto
      await db.update(quotes).set({
        status: 'converted',
        convertedToInvoiceId: invoiceId,
      }).where(eq(quotes.id, input.id));

      return {
        invoiceId,
        invoiceNumber,
      };
    }),

  // ============================================================================
  // PLANTILLAS
  // ============================================================================
  
  getTemplates: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const templates = await db
      .select()
      .from(quoteTemplates)
      .orderBy(desc(quoteTemplates.isDefault), quoteTemplates.name);

    return templates;
  }),

  createTemplate: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.enum(['tuning', 'repair', 'restoration', 'maintenance', 'moving', 'evaluation', 'custom']),
        items: z.array(quoteItemSchema),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.insert(quoteTemplates).values({
        odId: nanoid(),
        name: input.name,
        description: input.description || '',
        category: input.category,
        items: JSON.stringify(input.items),
        isDefault: input.isDefault ? 1 : 0,
        partnerId: 1,
        organizationId: null,
      });

      return {
        id: Number(result.insertId),
      };
    }),

  deleteTemplate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(quoteTemplates).where(eq(quoteTemplates.id, input.id));

      return { success: true };
    }),
});
