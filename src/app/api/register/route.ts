import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const { hash } = await request.json();
    if (!hash) return NextResponse.json({ error: 'No hash provided' }, { status: 400 });

    const db = await getDb();
    
    // Insert into real SQLite database, ignoring if it already exists
    await db.run('INSERT OR IGNORE INTO ledger (hash) VALUES (?)', [hash]);

    return NextResponse.json({ success: true, hash });
  } catch (error) {
    console.error("Register DB Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
