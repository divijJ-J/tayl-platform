import { supabaseAdmin } from '../../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const { id } = params;
  const { user, companyId } = await getCurrentCompanyId();
  if (!user || !companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { comment } = await request.json();
  if (!comment) return NextResponse.json({ error: 'Comment text required' }, { status: 400 });

  const { error } = await supabaseAdmin.from('task_comments').insert({
    task_id: id,
    company_id: companyId,
    author: user.id,
    comment,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
