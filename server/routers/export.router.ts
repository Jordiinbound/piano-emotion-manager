/**
 * Export Router
 * 
 * API endpoints for exporting data to PDF and Excel
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import * as excelService from '../services/excelService';
import * as pdfService from '../services/pdfService';

export const exportRouter = router({

  /**
   * Export clients list
   */
  exportClients: protectedProcedure
    .input(z.object({
      format: z.enum(['pdf', 'excel']),
      filters: z.object({
        search: z.string().optional(),
        status: z.enum(['active', 'inactive', 'all']).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get clients with related data using Drizzle relations
      // Note: This project uses partnerId/organizationId model, not userId
      const clients = await db.query.clients.findMany({
        with: {
          pianos: true,
          services: true,
        },
      });

      // Transform data for export
      const exportData = clients.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        pianosCount: client.pianos?.length || 0,
        servicesCount: client.services?.length || 0,
        createdAt: client.createdAt,
      }));

      // Apply filters
      let filteredData = exportData;
      if (input.filters?.search) {
        const search = input.filters.search.toLowerCase();
        filteredData = exportData.filter(client =>
          client.name.toLowerCase().includes(search) ||
          client.email.toLowerCase().includes(search)
        );
      }

      // Generate file
      let buffer: Buffer;
      let filename: string;

      if (input.format === 'pdf') {
        buffer = await pdfService.generateClientsPDF(filteredData);
        filename = `clientes_${Date.now()}.pdf`;
      } else {
        buffer = await excelService.generateClientsExcel(filteredData);
        filename = `clientes_${Date.now()}.xlsx`;
      }

      return {
        success: true,
        filename,
        base64: buffer.toString('base64'),
        size: buffer.length,
      };
    }),

  /**
   * Export services list
   */
  exportServices: protectedProcedure
    .input(z.object({
      format: z.enum(['pdf', 'excel']),
      filters: z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        clientId: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get services with related data using Drizzle relations
      const services = await db.query.services.findMany({
        with: {
          client: true,
          piano: true,
        },
      });

      // Transform data for export
      let exportData = services.map(service => ({
        id: service.id,
        serviceDate: service.date,
        clientName: service.client?.name || 'N/A',
        pianoInfo: service.piano ? `${service.piano.brand} ${service.piano.model || ''}`.trim() : 'N/A',
        serviceType: service.serviceType,
        duration: service.duration || 0,
        cost: service.cost ? parseFloat(service.cost.toString()) : 0,
        notes: service.notes || '',
      }));

      // Apply filters
      if (input.filters?.dateFrom) {
        const dateFrom = new Date(input.filters.dateFrom);
        exportData = exportData.filter(s => new Date(s.serviceDate) >= dateFrom);
      }

      if (input.filters?.dateTo) {
        const dateTo = new Date(input.filters.dateTo);
        exportData = exportData.filter(s => new Date(s.serviceDate) <= dateTo);
      }

      if (input.filters?.clientId) {
        exportData = exportData.filter(s => 
          services.find(srv => srv.id === s.id)?.clientId === input.filters?.clientId
        );
      }

      // Generate file
      let buffer: Buffer;
      let filename: string;

      if (input.format === 'pdf') {
        buffer = await pdfService.generateServicesPDF(exportData);
        filename = `servicios_${Date.now()}.pdf`;
      } else {
        buffer = await excelService.generateServicesExcel(exportData);
        filename = `servicios_${Date.now()}.xlsx`;
      }

      return {
        success: true,
        filename,
        base64: buffer.toString('base64'),
        size: buffer.length,
      };
    }),

  /**
   * Export invoices list
   */
  exportInvoices: protectedProcedure
    .input(z.object({
      format: z.enum(['pdf', 'excel']),
      filters: z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        status: z.enum(['paid', 'pending', 'overdue', 'all']).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get invoices
      const invoices = await db.query.invoices.findMany({});

      // Transform data for export
      let exportData = invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        createdAt: invoice.createdAt,
        clientName: 'N/A', // TODO: join with clients table if needed
        subtotal: invoice.subtotal || 0,
        tax: invoice.tax || 0,
        total: invoice.total || 0,
        status: invoice.status,
        paidAt: invoice.paidAt,
        notes: invoice.notes || '',
      }));

      // Apply filters
      if (input.filters?.dateFrom) {
        const dateFrom = new Date(input.filters.dateFrom);
        exportData = exportData.filter(i => new Date(i.createdAt) >= dateFrom);
      }

      if (input.filters?.dateTo) {
        const dateTo = new Date(input.filters.dateTo);
        exportData = exportData.filter(i => new Date(i.createdAt) <= dateTo);
      }

      if (input.filters?.status && input.filters.status !== 'all') {
        exportData = exportData.filter(i => i.status === input.filters?.status);
      }

      // Generate file
      let buffer: Buffer;
      let filename: string;

      if (input.format === 'pdf') {
        buffer = await pdfService.generateInvoicesPDF(exportData);
        filename = `facturas_${Date.now()}.pdf`;
      } else {
        buffer = await excelService.generateInvoicesExcel(exportData);
        filename = `facturas_${Date.now()}.xlsx`;
      }

      return {
        success: true,
        filename,
        base64: buffer.toString('base64'),
        size: buffer.length,
      };
    }),

  /**
   * Export inventory
   */
  exportInventory: protectedProcedure
    .input(z.object({
      format: z.enum(['pdf', 'excel']),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Get inventory items
      const inventory = await db.query.inventory.findMany({
        // Note: inventory table uses partnerId, not userId
        // For now, get all inventory items since we don't have partner context
      });

      // Transform data for export
      const exportData = inventory.map(item => ({
        id: item.id,
        code: item.code || '',
        name: item.name,
        category: item.category || '',
        quantity: item.quantity || 0,
        minStock: item.minStock || 5,
        price: item.price || 0,
      }));

      // Generate file
      let buffer: Buffer;
      let filename: string;

      if (input.format === 'pdf') {
        buffer = await pdfService.generateInventoryPDF(exportData);
        filename = `inventario_${Date.now()}.pdf`;
      } else {
        buffer = await excelService.generateInventoryExcel(exportData);
        filename = `inventario_${Date.now()}.xlsx`;
      }

      return {
        success: true,
        filename,
        base64: buffer.toString('base64'),
        size: buffer.length,
      };
    }),

  /**
   * Export pianos list
   */
  exportPianos: protectedProcedure
    .input(z.object({
      format: z.enum(['pdf', 'excel']),
      filters: z.object({
        clientId: z.string().optional(),
        type: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get pianos with related data using Drizzle relations
      const pianos = await db.query.pianos.findMany({
        with: {
          client: true,
          services: {
            orderBy: (services, { desc }) => [desc(services.date)],
            limit: 1,
          },
        },
      });

      // Transform data for export
      let exportData = pianos.map(piano => ({
        id: piano.id,
        brand: piano.brand || '',
        model: piano.model || '',
        serialNumber: piano.serialNumber || '',
        category: piano.category || '',
        year: piano.year || 0,
        clientName: piano.client?.name || 'N/A',
        location: piano.location || '',
        condition: piano.condition || '',
        lastServiceDate: piano.services?.[0]?.date || null,
        createdAt: piano.createdAt,
      }));

      // Apply filters
      if (input.filters?.clientId) {
        exportData = exportData.filter(p => 
          pianos.find(piano => piano.id === p.id)?.clientId === input.filters?.clientId
        );
      }

      if (input.filters?.type) {
        exportData = exportData.filter(p => p.type === input.filters?.type);
      }

      // Generate file
      let buffer: Buffer;
      let filename: string;

      if (input.format === 'pdf') {
        buffer = await pdfService.generatePianosPDF(exportData);
        filename = `pianos_${Date.now()}.pdf`;
      } else {
        buffer = await excelService.generatePianosExcel(exportData);
        filename = `pianos_${Date.now()}.xlsx`;
      }

      return {
        success: true,
        filename,
        base64: buffer.toString('base64'),
        size: buffer.length,
      };
    }),

});

export type ExportRouter = typeof exportRouter;
