import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  const { id } = params;
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { status } = await request.json();
  const allowed = ['open', 'in_progress', 'done', 'blocked'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
