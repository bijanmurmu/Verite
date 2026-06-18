import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const { hash } = await request.json();
    if (!hash) return NextResponse.json({ error: 'No hash provided' }, { status: 400 });

    const { error } = await supabase
      .from('ledger')
      .insert([{ hash }])
      .select();

    // If error code is 23505, it means unique violation (hash already exists), which is fine
    if (error && error.code !== '23505') {
      console.error("Register Supabase Error:", error);
      return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, hash });
  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
