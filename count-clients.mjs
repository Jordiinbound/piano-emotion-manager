import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const tidbUrl = 'mysql://2GeAqAcm5LrcHRv.root:PianoEmotion2026@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/piano_emotion_db?ssl={"rejectUnauthorized":true}';
const db = drizzle(tidbUrl);

console.log('📊 Contando clientes en la base de datos...\n');

const result = await db.execute(sql`SELECT COUNT(*) as total FROM clients`);
console.log('Resultado completo:', JSON.stringify(result, null, 2));

const count = result[0]?.total || result[0]?.count || result[0]?.COUNT;
console.log('\n✅ Total de clientes:', count);

// Mostrar primeros 5 clientes
console.log('\n📋 Primeros 5 clientes:');
const clients = await db.execute(sql`SELECT id, odId, name, email, phone FROM clients LIMIT 5`);
clients.forEach((client, index) => {
  console.log(`\n${index + 1}. ${client.name}`);
  console.log(`   Email: ${client.email}`);
  console.log(`   Teléfono: ${client.phone}`);
  console.log(`   ID: ${client.id}`);
});

process.exit(0);
