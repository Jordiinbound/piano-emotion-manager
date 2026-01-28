import puppeteer from 'puppeteer';
import { getDb } from '../db';
import { pianos, pianoTechnicalData, pianoInspectionReports } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

interface GenerateInspectionPDFParams {
  reportId: number;
  partnerId: string;
  organizationId: string;
}

/**
 * Genera un PDF profesional de informe de inspección de piano
 * Incluye: logo, datos técnicos, fotos, hallazgos y recomendaciones
 */
export async function generateInspectionPDF({
  reportId,
  partnerId,
  organizationId,
}: GenerateInspectionPDFParams): Promise<Buffer> {
  const db = await getDb();
  
  // Obtener datos del informe
  const report = await db
    .select()
    .from(pianoInspectionReports)
    .where(eq(pianoInspectionReports.id, reportId))
    .limit(1)
    .then(rows => rows[0]);

  if (!report) {
    throw new Error(`Inspection report with id ${reportId} not found`);
  }

  // Obtener datos del piano
  const piano = await db
    .select()
    .from(pianos)
    .where(eq(pianos.id, report.pianoId))
    .limit(1)
    .then(rows => rows[0]);

  if (!piano) {
    throw new Error(`Piano with id ${report.pianoId} not found`);
  }

  // Obtener datos técnicos del piano
  const technicalData = await db
    .select()
    .from(pianoTechnicalData)
    .where(eq(pianoTechnicalData.pianoId, report.pianoId))
    .limit(1)
    .then(rows => rows[0]);

  // Generar HTML del PDF
  const html = generateInspectionHTML(report, piano, technicalData);

  // Generar PDF con Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Genera el HTML para el PDF de inspección
 */
function generateInspectionHTML(
  report: any,
  piano: any,
  technicalData: any | undefined
): string {
  const photos = piano.photos ? (Array.isArray(piano.photos) ? piano.photos : JSON.parse(piano.photos)) : [];
  const photosHTML = photos.slice(0, 4).map((url: string) => `
    <div style="width: 48%; margin-bottom: 10px;">
      <img src="${url}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;" />
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de Inspección - ${piano.brand} ${piano.model}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1f2937;
      line-height: 1.6;
    }
    
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 30px;
      text-align: center;
      margin-bottom: 30px;
    }
    
    .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    
    .subtitle {
      font-size: 18px;
      opacity: 0.9;
    }
    
    .content {
      padding: 0 20px;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #3b82f6;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .info-item {
      background: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }
    
    .info-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .photos-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    
    .findings-box {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .findings-title {
      font-size: 16px;
      font-weight: bold;
      color: #92400e;
      margin-bottom: 10px;
    }
    
    .findings-text {
      color: #78350f;
      white-space: pre-wrap;
    }
    
    .recommendations-box {
      background: #dbeafe;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .recommendations-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .recommendations-text {
      color: #1e3a8a;
      white-space: pre-wrap;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-completed {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-approved {
      background: #dbeafe;
      color: #1e40af;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🎹 PIANO EMOTION</div>
    <div class="subtitle">Informe de Inspección Técnica</div>
  </div>

  <div class="content">
    <!-- Información del Piano -->
    <div class="section">
      <h2 class="section-title">Información del Piano</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Marca</div>
          <div class="info-value">${piano.brand || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Modelo</div>
          <div class="info-value">${piano.model || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Número de Serie</div>
          <div class="info-value">${piano.serialNumber || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Tipo</div>
          <div class="info-value">${piano.pianoType === 'vertical' ? 'Vertical' : 'De Cola'}</div>
        </div>
      </div>
    </div>

    <!-- Información del Informe -->
    <div class="section">
      <h2 class="section-title">Detalles del Informe</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Fecha de Inspección</div>
          <div class="info-value">${new Date(report.inspectionDate).toLocaleDateString('es-ES')}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Inspector</div>
          <div class="info-value">${report.inspector || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Estado</div>
          <div class="info-value">
            <span class="status-badge status-${report.status || 'pending'}">
              ${report.status === 'pending' ? 'Pendiente' : report.status === 'completed' ? 'Completado' : 'Aprobado'}
            </span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Puntuación General</div>
          <div class="info-value">${report.overallScore || 'N/A'}/10</div>
        </div>
      </div>
    </div>

    ${technicalData ? `
    <!-- Datos Técnicos -->
    <div class="section">
      <h2 class="section-title">Datos Técnicos</h2>
      <div class="info-grid">
        ${technicalData.height ? `
        <div class="info-item">
          <div class="info-label">Altura</div>
          <div class="info-value">${technicalData.height} cm</div>
        </div>
        ` : ''}
        ${technicalData.width ? `
        <div class="info-item">
          <div class="info-label">Ancho</div>
          <div class="info-value">${technicalData.width} cm</div>
        </div>
        ` : ''}
        ${technicalData.depth ? `
        <div class="info-item">
          <div class="info-label">Profundidad</div>
          <div class="info-value">${technicalData.depth} cm</div>
        </div>
        ` : ''}
        ${technicalData.weight ? `
        <div class="info-item">
          <div class="info-label">Peso</div>
          <div class="info-value">${technicalData.weight} kg</div>
        </div>
        ` : ''}
        ${technicalData.numberOfKeys ? `
        <div class="info-item">
          <div class="info-label">Número de Teclas</div>
          <div class="info-value">${technicalData.numberOfKeys}</div>
        </div>
        ` : ''}
        ${technicalData.numberOfPedals ? `
        <div class="info-item">
          <div class="info-label">Número de Pedales</div>
          <div class="info-value">${technicalData.numberOfPedals}</div>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    ${photos.length > 0 ? `
    <!-- Galería de Fotos -->
    <div class="section">
      <h2 class="section-title">Galería de Fotos</h2>
      <div class="photos-grid">
        ${photosHTML}
      </div>
    </div>
    ` : ''}

    <!-- Hallazgos -->
    <div class="section">
      <h2 class="section-title">Hallazgos de la Inspección</h2>
      <div class="findings-box">
        <div class="findings-title">⚠️ Observaciones</div>
        <div class="findings-text">${report.findings || 'Sin hallazgos registrados.'}</div>
      </div>
    </div>

    <!-- Recomendaciones -->
    <div class="section">
      <h2 class="section-title">Recomendaciones</h2>
      <div class="recommendations-box">
        <div class="recommendations-title">💡 Acciones Sugeridas</div>
        <div class="recommendations-text">${report.recommendations || 'Sin recomendaciones específicas.'}</div>
      </div>
    </div>

    <!-- Notas Adicionales -->
    ${report.notes ? `
    <div class="section">
      <h2 class="section-title">Notas Adicionales</h2>
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 3px solid #6b7280;">
        <div style="white-space: pre-wrap; color: #4b5563;">${report.notes}</div>
      </div>
    </div>
    ` : ''}

    ${report.clientSignature ? `
    <!-- Firma del Cliente -->
    <div class="section" style="page-break-inside: avoid;">
      <h2 class="section-title">Firma del Cliente</h2>
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p style="margin-bottom: 15px; color: #6b7280; font-size: 14px;">Confirmo que he revisado este informe de inspección y estoy conforme con los hallazgos y recomendaciones presentados.</p>
        <div style="text-align: center; margin: 20px 0;">
          <img src="${report.clientSignature}" alt="Firma del cliente" style="max-width: 300px; max-height: 150px; border: 1px solid #d1d5db; border-radius: 4px; background: white; padding: 10px;" />
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">FECHA DE FIRMA</div>
            <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${new Date().toLocaleDateString('es-ES')}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">HORA</div>
            <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${new Date().toLocaleTimeString('es-ES')}</div>
          </div>
        </div>
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <p><strong>Piano Emotion Manager</strong></p>
      <p>Sistema profesional de gestión de pianos acústicos</p>
      <p>Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
    </div>
  </div>
</body>
</html>
  `;
}
