import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

async function analyzeTables() {
  try {
    const tidbUrl = 'mysql://2GeAqAcm5LrcHRv.root:PianoEmotion2026@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/piano_emotion_db?ssl={"rejectUnauthorized":true}';
    const db = drizzle(tidbUrl);
    
    console.log('🔍 Analizando estructura de tablas principales...\n');
    
    const mainTables = ['users', 'clients', 'services', 'pianos', 'appointments', 'invoices', 'inventory'];
    
    for (const tableName of mainTables) {
      console.log(`\n📋 Tabla: ${tableName}`);
      console.log('='.repeat(60));
      
      try {
        // Describir estructura de la tabla
        const structure = await db.execute(sql.raw(`DESCRIBE ${tableName}`));
        console.log('\nColumnas:');
        structure.forEach(col => {
          console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // Contar registros
        const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${tableName}`));
        const count = countResult[0].count;
        console.log(`\n📊 Total de registros: ${count}`);
        
        // Mostrar algunos registros de ejemplo si existen
        if (count > 0) {
          const sample = await db.execute(sql.raw(`SELECT * FROM ${tableName} LIMIT 3`));
          console.log('\n🔍 Muestra de datos (primeros 3 registros):');
          sample.forEach((row, index) => {
            console.log(`\n  Registro ${index + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
              const displayValue = value === null ? 'NULL' : 
                                  typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' :
                                  value;
              console.log(`    ${key}: ${displayValue}`);
            });
          });
        }
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

analyzeTables();
