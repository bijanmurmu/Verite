import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const { hash } = await request.json();
    if (!hash) return NextResponse.json({ error: 'No hash provided' }, { status: 400 });

    const { data, error } = await supabase
      .from('ledger')
      .select('*')
      .eq('hash', hash)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error("Verify Supabase Error:", error);
    }

    return NextResponse.json({ verified: !!data });
  } catch (error) {
    console.error("Verify API Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
