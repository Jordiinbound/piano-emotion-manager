import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a TiDB...\n');
    
    const tidbUrl = 'mysql://2GeAqAcm5LrcHRv.root:PianoEmotion2026@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/piano_emotion_db?ssl={"rejectUnauthorized":true}';
    
    const db = drizzle(tidbUrl);
    
    // Probar la conexión con una consulta simple
    console.log('📊 Ejecutando consulta de prueba...');
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Conexión exitosa!');
    
    // Listar todas las tablas en la base de datos
    console.log('\n📋 Listando todas las tablas en la base de datos...');
    const tablesResult = await db.execute(sql`SHOW TABLES`);
    
    console.log('\n🔍 Resultado raw de SHOW TABLES:');
    console.log(JSON.stringify(tablesResult, null, 2));
    
    // Intentar diferentes formas de extraer los nombres
    console.log('\n🔍 Analizando estructura de datos...');
    if (tablesResult && tablesResult.length > 0) {
      const firstRow = tablesResult[0];
      console.log('Primera fila:', firstRow);
      console.log('Tipo:', typeof firstRow);
      console.log('Keys:', Object.keys(firstRow));
      console.log('Values:', Object.values(firstRow));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al conectar a TiDB:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testConnection();
