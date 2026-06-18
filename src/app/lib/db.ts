import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb() {
  if (db) return db;
  
  // In production (Render), we will mount a persistent disk at /data
  const dbPath = process.env.NODE_ENV === 'production' 
    ? '/data/verite_ledger.sqlite'
    : path.join(process.cwd(), 'verite_ledger.sqlite');
    
  db = await open({
    filename: dbPath,
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
