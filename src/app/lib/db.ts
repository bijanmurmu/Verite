import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb() {
  if (db) return db;
  
  db = await open({
    filename: path.join(process.cwd(), 'verite_ledger.sqlite'),
    driver: sqlite3.Database
  });

  // Initialize the database table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS ledger (
      hash TEXT PRIMARY KEY,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}
