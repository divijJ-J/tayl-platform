import { supabaseAdmin } from '../../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const { id } = params;
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { note } = await request.json();
  if (!note) return NextResponse.json({ error: 'Note text is required' }, { status: 400 });

  const { error } = await supabaseAdmin.from('communication_log').insert({
    company_id: companyId,
    customer_id: id,
    type: 'note',
    subject: 'Manual note',
    body: note,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
