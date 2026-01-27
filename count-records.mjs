import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const tidbUrl = 'mysql://2GeAqAcm5LrcHRv.root:PianoEmotion2026@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/piano_emotion_db?ssl={"rejectUnauthorized":true}';
const db = drizzle(tidbUrl);

const tables = ['clients', 'services', 'pianos', 'appointments', 'invoices', 'inventory', 'users'];

console.log('\n📊 Conteo de registros en tablas principales:\n');

for (const table of tables) {
  const result = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`));
  const count = result[0].count;
  console.log(`  ${table.padEnd(15)} → ${count} registros`);
}

process.exit(0);
