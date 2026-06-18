import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const { hash } = await request.json();
    if (!hash) return NextResponse.json({ error: 'No hash provided' }, { status: 400 });

    const db = await getDb();
    
    // Query the real SQLite database using SQL
    const row = await db.get('SELECT * FROM ledger WHERE hash = ?', [hash]);

    return NextResponse.json({ verified: !!row });
  } catch (error) {
    console.error("Verify DB Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
