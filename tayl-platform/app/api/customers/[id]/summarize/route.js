import { supabaseAdmin } from '../../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../../lib/supabase-server';
import { callGemini } from '../../../../../lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const { id } = params;
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'AI summary is not configured yet — add GEMINI_API_KEY in Vercel env vars.' },
      { status: 500 }
    );
  }

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

  const { data: log } = await supabaseAdmin
    .from('communication_log')
    .select('type, subject, body, created_at')
    .eq('customer_id', id)
    .eq('company_id', companyId)
    .order('created_at', { ascending: true });

  if (!log || log.length === 0) {
    return NextResponse.json({ error: 'No history yet for this customer' }, { status: 400 });
  }

  const systemPrompt = `You summarize a service business's history with one customer, so staff can get up to speed in seconds and the AI estimator can make smarter suggestions. Be concise — 3-5 sentences. Note their preferences, past issues, and anything staff should keep in mind. Do not invent facts not present in the log.`;

  const userMessage = `Customer: ${customer.name}\n\nHistory log (chronological):\n${log
    .map((l) => `[${l.created_at}] (${l.type}) ${l.subject || ''}: ${l.body || ''}`)
    .join('\n')}`;

  try {
    const summary = await callGemini(systemPrompt, userMessage);
    await supabaseAdmin
      .from('customers')
      .update({ ai_summary: summary.trim(), ai_summary_updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ summary: summary.trim() });
  } catch (err) {
    return NextResponse.json({ error: `Failed to generate summary: ${err.message}` }, { status: 500 });
  }
}
