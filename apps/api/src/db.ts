import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(path.join(dataDir, 'app.db'));
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

export function migrate() {
  db.run(sql`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER
    )
  `);
  db.run(sql`CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes (updated_at)`);
}
