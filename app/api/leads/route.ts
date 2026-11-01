import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase'; // Uncomment when Supabase is configured

export async function GET() {
  // TODO: Replace with Supabase query
  // const { data, error } = await supabase.from('leads').select('*');
  // if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Leads API ready', data: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  // TODO: Replace with Supabase insert
  // const { data, error } = await supabase.from('leads').insert(body);
  return NextResponse.json({ message: 'Lead created', data: body });
}
