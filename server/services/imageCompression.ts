import sharp from 'sharp';

interface CompressionOptions {
  quality?: number; // 1-100, default 80
  maxWidth?: number; // Max width in pixels, default 1920
  maxHeight?: number; // Max height in pixels, default 1920
  format?: 'jpeg' | 'png' | 'webp'; // Output format, default auto-detect
  generateThumbnail?: boolean; // Generate thumbnail, default false
  thumbnailSize?: number; // Thumbnail size in pixels, default 200
}

interface CompressionResult {
  compressed: Buffer;
  thumbnail?: Buffer;
  metadata: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    width: number;
    height: number;
    format: string;
  };
}

/**
 * Comprime una imagen usando Sharp con opciones configurables
 * Reduce el tamaño del archivo 60-80% manteniendo calidad visual
 */
export async function compressImage(
  imageBuffer: Buffer,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    quality = 80,
    maxWidth = 1920,
    maxHeight = 1920,
    format,
    generateThumbnail = false,
    thumbnailSize = 200,
  } = options;

  // Obtener metadata original
  const originalMetadata = await sharp(imageBuffer).metadata();
  const originalSize = imageBuffer.length;

  // Determinar formato de salida
  const outputFormat = format || (originalMetadata.format as 'jpeg' | 'png' | 'webp') || 'jpeg';

  // Crear pipeline de compresión
  let pipeline = sharp(imageBuffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside', // Mantener aspect ratio
      withoutEnlargement: true, // No agrandar imágenes pequeñas
    })
    .rotate(); // Auto-rotar según EXIF

  // Aplicar compresión según formato
  if (outputFormat === 'jpeg') {
    pipeline = pipeline.jpeg({
      quality,
      progressive: true, // JPEG progresivo para mejor UX
      mozjpeg: true, // Usar mozjpeg para mejor compresión
    });
  } else if (outputFormat === 'png') {
    pipeline = pipeline.png({
      quality,
      compressionLevel: 9, // Máxima compresión PNG
      progressive: true,
    });
  } else if (outputFormat === 'webp') {
    pipeline = pipeline.webp({
      quality,
      effort: 6, // Balance entre velocidad y compresión
    });
  }

  // Comprimir imagen principal
  const compressed = await pipeline.toBuffer();
  const compressedMetadata = await sharp(compressed).metadata();

  // Generar thumbnail si se solicita
  let thumbnail: Buffer | undefined;
  if (generateThumbnail) {
    thumbnail = await sharp(imageBuffer)
      .resize(thumbnailSize, thumbnailSize, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 70 })
      .toBuffer();
  }

  return {
    compressed,
    thumbnail,
    metadata: {
      originalSize,
      compressedSize: compressed.length,
      compressionRatio: Math.round((1 - compressed.length / originalSize) * 100),
      width: compressedMetadata.width || 0,
      height: compressedMetadata.height || 0,
      format: outputFormat,
    },
  };
}

/**
 * Convierte una imagen base64 a Buffer
 */
export function base64ToBuffer(base64String: string): Buffer {
  // Remover prefijo "data:image/...;base64," si existe
  const base64Data = base64String.includes(',')
    ? base64String.split(',')[1]
    : base64String;
  
  return Buffer.from(base64Data, 'base64');
}

/**
 * Detecta el formato de imagen desde base64
 */
export function detectImageFormat(base64String: string): 'jpeg' | 'png' | 'webp' | undefined {
  if (base64String.includes('data:image/jpeg') || base64String.includes('data:image/jpg')) {
    return 'jpeg';
  }
  if (base64String.includes('data:image/png')) {
    return 'png';
  }
  if (base64String.includes('data:image/webp')) {
    return 'webp';
  }
  return undefined;
}

/**
 * Valida que el buffer sea una imagen válida
 */
export async function validateImage(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata();
    return !!(metadata.width && metadata.height);
  } catch {
    return false;
  }
}
