import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('public_slug, chat_greeting, chat_persona')
    .eq('id', companyId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { public_slug, chat_greeting, chat_persona } = await request.json();

  if (!public_slug) {
    return NextResponse.json({ error: 'Pick a public link name' }, { status: 400 });
  }

  // Check the slug isn't taken by another company
  const { data: existing } = await supabaseAdmin
    .from('companies')
    .select('id')
    .eq('public_slug', public_slug)
    .neq('id', companyId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'That link name is already taken — try another' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('companies')
    .update({ public_slug, chat_greeting, chat_persona })
    .eq('id', companyId)
    .select('public_slug, chat_greeting, chat_persona')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
