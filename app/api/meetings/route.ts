import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DEFAULT_ORG_ID, DEFAULT_USER_ID } from '@/lib/services/crmService';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('org_id', DEFAULT_ORG_ID)
      .is('deleted_at', null)
      .order('meeting_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('meetings')
      .insert({
        org_id: DEFAULT_ORG_ID,
        created_by: DEFAULT_USER_ID,
        ...body,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
