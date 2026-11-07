import { execSync } from 'node:child_process';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || '';
const isPostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');
const run = (command) => execSync(command, { stdio: 'inherit', env: process.env });

if ((process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') && !isPostgres && process.env.ALLOW_SQLITE_PRODUCTION !== 'true') {
  console.error('[DB Setup] A PostgreSQL DATABASE_URL is required in production. SQLite is allowed only when ALLOW_SQLITE_PRODUCTION=true (CI/local test).');
  process.exit(1);
}

if (isPostgres) {
  const schema = 'prisma/schema.postgresql.prisma';
  console.log('[DB Setup] Preparing isolated PostgreSQL schema: niopdc_app');
  try {
    run(`npx prisma generate --schema ${schema}`);
    if (process.env.PRISMA_DB_PUSH === 'true') {
      console.log('[DB Setup] Explicit PRISMA_DB_PUSH=true: syncing the isolated niopdc_app schema.');
      run(`npx prisma db push --schema ${schema} --skip-generate`);
    } else {
      console.log('[DB Setup] Automatic db push is disabled; using the provisioned niopdc_app schema.');
    }
    console.log('[DB Setup] PostgreSQL Prisma Client is ready.');
  } catch (error) {
    console.error('[DB Setup] PostgreSQL preparation failed. Check DATABASE_URL and Prisma schema configuration.');
    process.exit(1);
  }
} else {
  if (databaseUrl && !databaseUrl.startsWith('file:')) {
    console.error('[DB Setup] Unsupported DATABASE_URL. Use a PostgreSQL URL or a file: SQLite URL.');
    process.exit(1);
  }
  console.log('[DB Setup] Preparing local SQLite Prisma Client.');
  try {
    run('npx prisma generate --schema prisma/schema.prisma');
    console.log('[DB Setup] SQLite Prisma Client is ready.');
  } catch (error) {
    console.error('[DB Setup] SQLite Prisma generation failed.', error);
    process.exit(1);
  }
}
