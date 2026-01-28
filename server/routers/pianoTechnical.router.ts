import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { pianoTechnicalData, pianoInspectionReports, pianos, clients, pianoOwnershipHistory, pianoPriceHistory } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { generateInspectionPDF } from '../services/pdfInspectionService';
import { storagePut } from '../storage';

export const pianoTechnicalRouter = router({
  // ============ DATOS TÉCNICOS ============
  
  /**
   * Obtener datos técnicos de un piano
   */
  getTechnicalData: protectedProcedure
    .input(z.object({
      pianoId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const data = await db.query.pianoTechnicalData.findFirst({
        where: eq(pianoTechnicalData.pianoId, input.pianoId),
      });
      return data || null;
    }),

  /**
   * Crear o actualizar datos técnicos de un piano
   */
  upsertTechnicalData: protectedProcedure
    .input(z.object({
      pianoId: z.number(),
      height: z.number().optional(),
      width: z.number().optional(),
      depth: z.number().optional(),
      weight: z.number().optional(),
      numberOfKeys: z.number().optional(),
      numberOfPedals: z.number().optional(),
      numberOfStrings: z.number().optional(),
      hammerType: z.string().optional(),
      soundboardMaterial: z.string().optional(),
      frameMaterial: z.string().optional(),
      keyboardType: z.string().optional(),
      touchWeight: z.string().optional(),
      lastTuningDate: z.string().optional(),
      lastRegulationDate: z.string().optional(),
      lastMaintenanceDate: z.string().optional(),
      technicalNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Verificar si ya existen datos técnicos para este piano
      const existing = await db.query.pianoTechnicalData.findFirst({
        where: eq(pianoTechnicalData.pianoId, input.pianoId),
      });

      if (existing) {
        // Actualizar
        await db.update(pianoTechnicalData)
          .set({
            height: input.height?.toString(),
            width: input.width?.toString(),
            depth: input.depth?.toString(),
            weight: input.weight?.toString(),
            numberOfKeys: input.numberOfKeys,
            numberOfPedals: input.numberOfPedals,
            numberOfStrings: input.numberOfStrings,
            hammerType: input.hammerType,
            soundboardMaterial: input.soundboardMaterial,
            frameMaterial: input.frameMaterial,
            keyboardType: input.keyboardType,
            touchWeight: input.touchWeight,
            lastTuningDate: input.lastTuningDate,
            lastRegulationDate: input.lastRegulationDate,
            lastMaintenanceDate: input.lastMaintenanceDate,
            technicalNotes: input.technicalNotes,
          })
          .where(eq(pianoTechnicalData.id, existing.id));
        
        return { success: true, id: existing.id };
      } else {
        // Crear
        const result = await db.insert(pianoTechnicalData).values({
          pianoId: input.pianoId,
          partnerId: ctx.user.partnerId || 1,
          organizationId: ctx.user.organizationId,
          height: input.height?.toString(),
          width: input.width?.toString(),
          depth: input.depth?.toString(),
          weight: input.weight?.toString(),
          numberOfKeys: input.numberOfKeys || 88,
          numberOfPedals: input.numberOfPedals || 3,
          numberOfStrings: input.numberOfStrings,
          hammerType: input.hammerType,
          soundboardMaterial: input.soundboardMaterial,
          frameMaterial: input.frameMaterial,
          keyboardType: input.keyboardType,
          touchWeight: input.touchWeight,
          lastTuningDate: input.lastTuningDate,
          lastRegulationDate: input.lastRegulationDate,
          lastMaintenanceDate: input.lastMaintenanceDate,
          technicalNotes: input.technicalNotes,
        });
        
        return { success: true, id: Number(result.insertId) };
      }
    }),

  // ============ INFORMES DE INSPECCIÓN ============
  
  /**
   * Obtener todos los informes de inspección de un piano
   */
  getInspectionReports: protectedProcedure
    .input(z.object({
      pianoId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const reports = await db.query.pianoInspectionReports.findMany({
        where: eq(pianoInspectionReports.pianoId, input.pianoId),
        orderBy: [desc(pianoInspectionReports.inspectionDate)],
      });
      return reports;
    }),

  /**
   * Obtener un informe de inspección por ID
   */
  getInspectionReportById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const report = await db.query.pianoInspectionReports.findFirst({
        where: eq(pianoInspectionReports.id, input.id),
      });
      return report || null;
    }),

  /**
   * Crear un nuevo informe de inspección
   */
  createInspectionReport: protectedProcedure
    .input(z.object({
      pianoId: z.number(),
      clientId: z.number(),
      inspectionDate: z.string(),
      inspectorName: z.string(),
      inspectionType: z.string(),
      overallCondition: z.string().optional(),
      estimatedValue: z.number().optional(),
      exteriorCondition: z.any().optional(),
      interiorCondition: z.any().optional(),
      mechanicalCondition: z.any().optional(),
      soundQuality: z.any().optional(),
      recommendations: z.string().optional(),
      estimatedRepairCost: z.number().optional(),
      urgency: z.string().optional(),
      photos: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Generar número de informe único
      const reportNumber = `INS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const result = await db.insert(pianoInspectionReports).values({
        odId: createId(),
        pianoId: input.pianoId,
        clientId: input.clientId,
        partnerId: ctx.user.partnerId || 1,
        organizationId: ctx.user.organizationId,
        reportNumber,
        inspectionDate: input.inspectionDate,
        inspectorName: input.inspectorName,
        inspectorId: ctx.user.id,
        inspectionType: input.inspectionType,
        overallCondition: input.overallCondition,
        estimatedValue: input.estimatedValue?.toString(),
        exteriorCondition: input.exteriorCondition,
        interiorCondition: input.interiorCondition,
        mechanicalCondition: input.mechanicalCondition,
        soundQuality: input.soundQuality,
        recommendations: input.recommendations,
        estimatedRepairCost: input.estimatedRepairCost?.toString(),
        urgency: input.urgency || 'normal',
        photos: input.photos,
        notes: input.notes,
      });
      
      return { success: true, id: Number(result.insertId), reportNumber };
    }),

  /**
   * Actualizar un informe de inspección
   */
  updateInspectionReport: protectedProcedure
    .input(z.object({
      id: z.number(),
      inspectionDate: z.string().optional(),
      inspectorName: z.string().optional(),
      inspectionType: z.string().optional(),
      overallCondition: z.string().optional(),
      estimatedValue: z.number().optional(),
      exteriorCondition: z.any().optional(),
      interiorCondition: z.any().optional(),
      mechanicalCondition: z.any().optional(),
      soundQuality: z.any().optional(),
      recommendations: z.string().optional(),
      estimatedRepairCost: z.number().optional(),
      urgency: z.string().optional(),
      photos: z.array(z.string()).optional(),
      pdfUrl: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db.update(pianoInspectionReports)
        .set({
          inspectionDate: input.inspectionDate,
          inspectorName: input.inspectorName,
          inspectionType: input.inspectionType,
          overallCondition: input.overallCondition,
          estimatedValue: input.estimatedValue?.toString(),
          exteriorCondition: input.exteriorCondition,
          interiorCondition: input.interiorCondition,
          mechanicalCondition: input.mechanicalCondition,
          soundQuality: input.soundQuality,
          recommendations: input.recommendations,
          estimatedRepairCost: input.estimatedRepairCost?.toString(),
          urgency: input.urgency,
          photos: input.photos,
          pdfUrl: input.pdfUrl,
          notes: input.notes,
        })
        .where(eq(pianoInspectionReports.id, input.id));
      
      return { success: true };
    }),

  /**
   * Eliminar un informe de inspección
   */
  deleteInspectionReport: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db.delete(pianoInspectionReports)
        .where(eq(pianoInspectionReports.id, input.id));
      
      return { success: true };
    }),

  /**
   * Generar PDF de un informe de inspección
   */
  generateInspectionPDF: protectedProcedure
    .input(z.object({
      reportId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Verificar que el informe existe
      const report = await db.query.pianoInspectionReports.findFirst({
        where: eq(pianoInspectionReports.id, input.reportId),
      });
      
      if (!report) {
        throw new Error('Inspection report not found');
      }
      
      // Generar PDF
      const pdfBuffer = await generateInspectionPDF({
        reportId: input.reportId,
        partnerId: ctx.user.partnerId?.toString() || '1',
        organizationId: ctx.user.organizationId,
      });
      
      // Subir PDF a R2
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const filename = `inspection-report-${report.reportNumber}-${timestamp}-${randomSuffix}.pdf`;
      const fileKey = `${ctx.user.partnerId || 1}/inspection-reports/${filename}`;
      
      const { url } = await storagePut(fileKey, pdfBuffer, 'application/pdf');
      
      // Actualizar el informe con la URL del PDF
      await db.update(pianoInspectionReports)
        .set({ pdfUrl: url })
        .where(eq(pianoInspectionReports.id, input.reportId));
      
      return { success: true, url, filename };
    }),

  /**
   * Obtener estadísticas de informes de inspección
   */
  getInspectionStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      
      const allReports = await db.query.pianoInspectionReports.findMany({
        where: eq(pianoInspectionReports.partnerId, ctx.user.partnerId || 1),
      });
      
      const total = allReports.length;
      const byUrgency = {
        urgent: allReports.filter(r => r.urgency === 'urgent').length,
        high: allReports.filter(r => r.urgency === 'high').length,
        normal: allReports.filter(r => r.urgency === 'normal').length,
        low: allReports.filter(r => r.urgency === 'low').length,
      };
      
      const byType = allReports.reduce((acc, report) => {
        const type = report.inspectionType || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        total,
        byUrgency,
        byType,
      };
    }),

  // ============ HISTORIAL DE PROPIETARIOS ============
  
  /**
   * Obtener historial de propietarios de un piano
   */
  getPianoOwnershipHistory: protectedProcedure
    .input(z.object({
      pianoId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const history = await db.query.pianoOwnershipHistory.findMany({
        where: eq(pianoOwnershipHistory.pianoId, input.pianoId),
        orderBy: [desc(pianoOwnershipHistory.purchaseDate)],
      });
      return history;
    }),

  /**
   * Agregar registro de propietario
   */
  addOwnershipRecord: protectedProcedure
    .input(z.object({
      pianoId: z.number(),
      ownerName: z.string(),
      ownerContact: z.string().optional(),
      ownerAddress: z.string().optional(),
      purchaseDate: z.string().optional(),
      saleDate: z.string().optional(),
      purchasePrice: z.string().optional(),
      salePrice: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.insert(pianoOwnershipHistory).values({
        pianoId: input.pianoId,
        ownerName: input.ownerName,
        ownerContact: input.ownerContact || null,
        ownerAddress: input.ownerAddress || null,
        purchaseDate: input.purchaseDate || null,
        saleDate: input.saleDate || null,
        purchasePrice: input.purchasePrice || null,
        salePrice: input.salePrice || null,
        notes: input.notes || null,
      });
      return { success: true };
    }),

  /**
   * Actualizar registro de propietario
   */
  updateOwnershipRecord: protectedProcedure
    .input(z.object({
      id: z.number(),
      ownerName: z.string().optional(),
      ownerContact: z.string().optional(),
      ownerAddress: z.string().optional(),
      purchaseDate: z.string().optional(),
      saleDate: z.string().optional(),
      purchasePrice: z.string().optional(),
      salePrice: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...data } = input;
      await db.update(pianoOwnershipHistory)
        .set(data)
        .where(eq(pianoOwnershipHistory.id, id));
      return { success: true };
    }),

  /**
   * Eliminar registro de propietario
   */
  deleteOwnershipRecord: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.delete(pianoOwnershipHistory)
        .where(eq(pianoOwnershipHistory.id, input.id));
      return { success: true };
    }),

  // ============ HISTORIAL DE PRECIOS ============
  
  /**
   * Obtener historial de precios de un piano
   */
  getPianoPriceHistory: protectedProcedure
    .input(z.object({
      pianoId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const history = await db.query.pianoPriceHistory.findMany({
        where: eq(pianoPriceHistory.pianoId, input.pianoId),
        orderBy: [desc(pianoPriceHistory.date)],
      });
      return history;
    }),

  /**
   * Agregar registro de precio
   */
  addPriceRecord: protectedProcedure
    .input(z.object({
      pianoId: z.number(),
      price: z.string(),
      priceType: z.enum(['purchase', 'sale', 'appraisal', 'market', 'insurance']),
      date: z.string(),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.insert(pianoPriceHistory).values({
        pianoId: input.pianoId,
        price: input.price,
        priceType: input.priceType,
        date: input.date,
        source: input.source || null,
        notes: input.notes || null,
      });
      return { success: true };
    }),

  /**
   * Actualizar registro de precio
   */
  updatePriceRecord: protectedProcedure
    .input(z.object({
      id: z.number(),
      price: z.string().optional(),
      priceType: z.enum(['purchase', 'sale', 'appraisal', 'market', 'insurance']).optional(),
      date: z.string().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...data } = input;
      await db.update(pianoPriceHistory)
        .set(data)
        .where(eq(pianoPriceHistory.id, id));
      return { success: true };
    }),

  /**
   * Eliminar registro de precio
   */
  deletePriceRecord: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.delete(pianoPriceHistory)
        .where(eq(pianoPriceHistory.id, input.id));
      return { success: true };
    }),
});
