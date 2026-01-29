import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { pianos } from '../../drizzle/schema';
import { eq, like, or, and, sql, desc } from 'drizzle-orm';
import { withCache, invalidateCachePattern } from '../cache';
import { getDynamicTTL, trackEntityUpdate } from '../dynamicTTL';

export const pianosRouter = router({
  // Obtener estadísticas de pianos
  getStats: publicProcedure.query(async () => {
    return withCache(
      'pianos:stats',
      async () => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const [result] = await db
          .select({
            total: sql<number>`COUNT(*)`,
            vertical: sql<number>`SUM(CASE WHEN ${pianos.category} = 'vertical' THEN 1 ELSE 0 END)`,
            grand: sql<number>`SUM(CASE WHEN ${pianos.category} = 'grand' THEN 1 ELSE 0 END)`,
          })
          .from(pianos);

        return {
          total: Number(result?.total || 0),
          vertical: Number(result?.vertical || 0),
          grand: Number(result?.grand || 0),
        };
      },
      600 // 10 minutos de TTL
    );
  }),

  // Obtener lista de pianos con paginación y filtros
  getPianos: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(50),
        search: z.string().optional(),
        category: z.enum(['vertical', 'grand']).optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, search, category } = input;
      const cacheKey = `pianos:list:${page}:${pageSize}:${search || 'all'}:${category || 'all'}`;
      
      return withCache(
        cacheKey,
        async () => {
          const db = await getDb();
          if (!db) throw new Error('Database not available');
          const offset = (page - 1) * pageSize;

      // Construir condiciones de filtrado
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            like(pianos.brand, `%${search}%`),
            like(pianos.model, `%${search}%`),
            like(pianos.serialNumber, `%${search}%`)
          )
        );
      }

      if (category) {
        conditions.push(eq(pianos.category, category));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Obtener pianos con paginación
      const result = await db
        .select()
        .from(pianos)
        .where(whereClause)
        .orderBy(desc(pianos.createdAt))
        .limit(pageSize)
        .offset(offset);

      // Contar total de pianos
      const [countResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pianos)
        .where(whereClause);

      const total = Number(countResult?.count || 0);

          return {
            pianos: result,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          };
        },
        600 // 10 minutos de TTL
      );
    }),

  // Obtener piano por ID
  getPianoById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const ttl = getDynamicTTL('piano', input.id);
      return withCache(
        `pianos:detail:${input.id}`,
        async () => {
          const db = await getDb();
          if (!db) throw new Error('Database not available');

          const [piano] = await db
            .select()
            .from(pianos)
            .where(eq(pianos.id, input.id))
            .limit(1);

                  return piano;
        },
        ttl // TTL dinámico basado en frecuencia de actualización
      );
    }),

  // Crear nuevo piano
  createPiano: publicProcedure
    .input(
      z.object({
        clientId: z.number(),
        brand: z.string(),
        model: z.string(),
        serialNumber: z.string().optional(),
        category: z.enum(['vertical', 'grand']),
        pianoType: z.string(),
        manufactureYear: z.number().optional(),
        condition: z.string().optional(),
        location: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const odId = `PIANO-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const result = await db.insert(pianos).values({ ...input, odId, partnerId: 1 } as any);
      const pianoId = (result as any).insertId || 0;

      // Trackear actualización para TTL dinámico
      trackEntityUpdate('piano', pianoId);

      // Invalidar caché relacionado
      await invalidateCachePattern('pianos:list');
      await invalidateCachePattern('pianos:stats');

      return {
        success: true,
        pianoId,
      };
    }),

  // Actualizar piano
  updatePiano: publicProcedure
    .input(
      z.object({
        id: z.number(),
        clientId: z.number().optional(),
        brand: z.string().optional(),
        model: z.string().optional(),
        serialNumber: z.string().optional(),
        category: z.enum(['vertical', 'grand']).optional(),
        manufactureYear: z.number().optional(),
        condition: z.string().optional(),
        location: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updateData } = input;

      await db
        .update(pianos)
        .set(updateData as any)
        .where(eq(pianos.id, id));

      // Trackear actualización para TTL dinámico
      trackEntityUpdate('piano', id);

      // Invalidar caché relacionado
      await invalidateCachePattern(`pianos:detail:${id}`);
      await invalidateCachePattern('pianos:list');

      return { success: true };
    }),

  // Eliminar piano
  deletePiano: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(pianos).where(eq(pianos.id, input.id));

      // Trackear actualización para TTL dinámico (eliminación)
      trackEntityUpdate('piano', input.id);

      // Invalidar caché relacionado
      await invalidateCachePattern(`pianos:detail:${input.id}`);
      await invalidateCachePattern('pianos:list');
      await invalidateCachePattern('pianos:stats');

      return { success: true };
    }),

  // Upload de foto de piano a R2
  uploadPianoPhoto: publicProcedure
    .input(
      z.object({
        pianoId: z.number(),
        photoBase64: z.string(), // base64 string con formato "data:image/jpeg;base64,..."
        filename: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { storagePut } = await import('../storage');
      const { compressImage, base64ToBuffer, detectImageFormat, validateImage } = await import('../services/imageCompression');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Convertir base64 a Buffer
      const originalBuffer = base64ToBuffer(input.photoBase64);

      // Validar que sea una imagen válida
      const isValid = await validateImage(originalBuffer);
      if (!isValid) {
        throw new Error('Invalid image format');
      }

      // Detectar formato de imagen
      const imageFormat = detectImageFormat(input.photoBase64);

      // Comprimir imagen (reduce 60-80% del tamaño)
      const { compressed, metadata } = await compressImage(originalBuffer, {
        quality: 80,
        maxWidth: 1920,
        maxHeight: 1920,
        format: imageFormat,
      });

      // Log de compresión para debugging
      console.log(`[Image Compression] Original: ${metadata.originalSize} bytes, Compressed: ${metadata.compressedSize} bytes, Ratio: ${metadata.compressionRatio}%`);

      // Generar nombre único de archivo
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const extension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;
      const uniqueFilename = `piano-${input.pianoId}-${timestamp}-${randomSuffix}.${extension}`;
      const fileKey = `pianos/${input.pianoId}/${uniqueFilename}`;

      // Detectar content type
      const contentType = `image/${metadata.format}`;

      // Subir imagen comprimida a R2
      const { url } = await storagePut(fileKey, compressed, contentType);

      // Obtener fotos actuales del piano
      const [piano] = await db.select().from(pianos).where(eq(pianos.id, input.pianoId));
      if (!piano) {
        throw new Error('Piano not found');
      }

      // Agregar nueva foto al array
      const currentPhotos = piano.photos ? (Array.isArray(piano.photos) ? piano.photos : [piano.photos]) : [];
      const updatedPhotos = [...currentPhotos, url];

      // Actualizar piano con nueva foto
      await db
        .update(pianos)
        .set({ photos: updatedPhotos })
        .where(eq(pianos.id, input.pianoId));

      return { success: true, url };
    }),

  // Eliminar foto de piano de R2
  deletePianoPhoto: publicProcedure
    .input(
      z.object({
        pianoId: z.number(),
        photoUrl: z.string(), // URL completa de la foto a eliminar
      })
    )
    .mutation(async ({ input }) => {
      const { storageDelete } = await import('../storage');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Obtener piano actual
      const [piano] = await db.select().from(pianos).where(eq(pianos.id, input.pianoId));
      if (!piano) {
        throw new Error('Piano not found');
      }

      // Extraer fileKey de la URL (formato: https://.../.../fileKey)
      // Asumiendo que la URL tiene el formato: https://storage.../pianos/{pianoId}/{filename}
      const urlParts = input.photoUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const pianoIdFromUrl = urlParts[urlParts.length - 2];
      const fileKey = `pianos/${pianoIdFromUrl}/${filename}`;

      try {
        // Eliminar de R2
        await storageDelete(fileKey);
      } catch (error) {
        // Si falla la eliminación de R2, continuar de todos modos para limpiar la BD
        console.error('Error deleting from R2:', error);
      }

      // Eliminar URL del array de fotos
      const currentPhotos = piano.photos ? (Array.isArray(piano.photos) ? piano.photos : [piano.photos]) : [];
      const updatedPhotos = currentPhotos.filter(url => url !== input.photoUrl);

      // Actualizar piano sin la foto eliminada
      await db
        .update(pianos)
        .set({ photos: updatedPhotos.length > 0 ? updatedPhotos : null })
        .where(eq(pianos.id, input.pianoId));

      return { success: true };
    }),
});
