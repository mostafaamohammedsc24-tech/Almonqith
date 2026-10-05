import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to apply the database schema.');
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const schema = await readFile(path.resolve(scriptDirectory, '../database/schema.sql'), 'utf8');
const pool = new Pool({ connectionString: databaseUrl });

try {
  await pool.query(schema);
  console.log('Database schema applied successfully.');
} catch (error) {
  console.error('Database schema migration failed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
