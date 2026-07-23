import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../lib/supabase-server';
import { callGemini } from '../../../../lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { customer_description } = await request.json();
  if (!customer_description) {
    return NextResponse.json({ error: 'Describe the job first' }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'AI estimator is not configured yet — add GEMINI_API_KEY in Vercel env vars.' },
      { status: 500 }
    );
  }

  const { data: services } = await supabaseAdmin
    .from('services')
    .select('name, description, unit_price, unit')
    .eq('company_id', companyId);

  if (!services || services.length === 0) {
    return NextResponse.json(
      { error: 'Add services to your pricing catalog first — go to Settings > Pricing Catalog.' },
      { status: 400 }
    );
  }

  const systemPrompt = `You are a pricing estimator for a service business. You are given the business's pricing catalog and a description of a job a customer wants done. Your job: pick the most relevant catalog items, estimate reasonable quantities, and produce a structured estimate.

Pricing catalog (only use these, do not invent services or prices):
${JSON.stringify(services, null, 2)}

Respond with ONLY valid JSON, no other text, in exactly this shape:
{
  "line_items": [{"description": "string", "quantity": number, "unit_price": number}],
  "notes": "short note about assumptions made",
  "flagged_concerns": "any risks, ambiguity, or upsell opportunities worth a human reviewing before sending — or empty string if none"
}`;

  try {
    const raw = await callGemini(systemPrompt, customer_description);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const estimate = JSON.parse(cleaned);
    return NextResponse.json({ estimate });
  } catch (err) {
    return NextResponse.json({ error: `Failed to generate estimate: ${err.message}` }, { status: 500 });
  }
}
