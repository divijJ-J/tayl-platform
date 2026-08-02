import { supabaseAdmin } from '../../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { slug } = params;

  const { data: company, error } = await supabaseAdmin
    .from('companies')
    .select('name, ai_display_name, chat_greeting')
    .eq('public_slug', slug)
    .single();

  if (error || !company) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  return NextResponse.json({
    name: company.ai_display_name || 'TAYL',
    greeting: company.chat_greeting,
  });
}
