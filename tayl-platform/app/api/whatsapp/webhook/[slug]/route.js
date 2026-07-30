import { supabaseAdmin } from '../../../../../lib/supabase';
import { sendWhatsAppMessage } from '../../../../../lib/whatsapp';
import { findOrCreateCustomer, generateAIReply, logToCustomerHistory } from '../../../../../lib/ai-conversation';
import { NextResponse } from 'next/server';

// Meta calls this once when you paste the webhook URL into their dashboard,
// to prove you control this endpoint.
export async function GET(request, { params }) {
  const { slug } = params;
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('id')
    .eq('public_slug', slug)
    .single();

  if (!company) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { data: connection } = await supabaseAdmin
    .from('whatsapp_connections')
    .select('verify_token')
    .eq('company_id', company.id)
    .maybeSingle();

  if (mode === 'subscribe' && connection && token === connection.verify_token) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Verification failed', { status: 403 });
}

// Incoming WhatsApp messages land here.
export async function POST(request, { params }) {
  const { slug } = params;
  const body = await request.json();

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('id, name, chat_persona')
    .eq('public_slug', slug)
    .single();

  if (!company) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: connection } = await supabaseAdmin
    .from('whatsapp_connections')
    .select('phone_number_id, access_token')
    .eq('company_id', company.id)
    .maybeSingle();

  if (!connection) {
    // No connection configured — acknowledge so Meta doesn't retry forever.
    return NextResponse.json({ ok: true });
  }

  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message || message.type !== 'text') {
      // Status updates, non-text messages, etc. — nothing to reply to.
      return NextResponse.json({ ok: true });
    }

    const fromPhone = message.from;
    const text = message.text?.body || '';
    const contactName = change.value.contacts?.[0]?.profile?.name;

    const customerId = await findOrCreateCustomer(company.id, { name: contactName, phone: fromPhone });

    const { data: conversation, error: convoErr } = await supabaseAdmin
      .from('chat_conversations')
      .insert({
        company_id: company.id,
        customer_id: customerId,
        visitor_name: contactName || null,
      })
      .select('id')
      .single();

    if (convoErr) throw new Error(convoErr.message);

    await supabaseAdmin.from('chat_messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: text,
    });

    const reply = await generateAIReply(company, text, customerId);

    await supabaseAdmin.from('chat_messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: reply,
    });

    await logToCustomerHistory(company.id, customerId, 'WhatsApp', text, reply);

    await sendWhatsAppMessage(connection.phone_number_id, connection.access_token, fromPhone, reply);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('WhatsApp webhook error:', err.message);
    // Still return 200 — Meta retries aggressively on non-2xx and that
    // doesn't help once something's genuinely broken server-side.
    return NextResponse.json({ ok: true });
  }
}
