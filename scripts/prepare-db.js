import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

console.log(`[DB Setup] Inspecting DATABASE_URL: ${dbUrl.startsWith('file:') ? 'SQLite' : 'PostgreSQL/Remote'}`);

let content = fs.readFileSync(schemaPath, 'utf8');

if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  console.log('[DB Setup] Configuring Prisma for PostgreSQL...');
  content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
} else {
  console.log('[DB Setup] Configuring Prisma for SQLite...');
  content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
}

fs.writeFileSync(schemaPath, content, 'utf8');

try {
  console.log('[DB Setup] Running prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('[DB Setup] Prisma Client ready.');
} catch (err) {
  console.error('[DB Setup] Failed to generate Prisma Client', err);
  process.exit(1);
}
