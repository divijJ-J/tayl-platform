import { supabaseAdmin } from '../../../lib/supabase';
import { getCurrentCompanyId } from '../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('knowledge_sources')
    .select('id, title, content, source_type, created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sources: data });
}

export async function POST(request) {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { title, content, source_type } = await request.json();
  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('knowledge_sources').insert({
    company_id: companyId,
    title,
    content,
    source_type: source_type === 'file' ? 'file' : 'text',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
