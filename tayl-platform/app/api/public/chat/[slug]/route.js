import { supabaseAdmin } from '../../../../../lib/supabase';
import { findOrCreateCustomer, generateAIReply, logToCustomerHistory } from '../../../../../lib/ai-conversation';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const { slug } = params;
  const { conversation_id, visitor_name, visitor_email, message } = await request.json();

  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const { data: company, error: companyErr } = await supabaseAdmin
    .from('companies')
    .select('id, name, chat_persona')
    .eq('public_slug', slug)
    .single();

  if (companyErr || !company) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'This business has not finished setting up chat yet.' },
      { status: 500 }
    );
  }

  let conversation;
  if (conversation_id) {
    const { data } = await supabaseAdmin
      .from('chat_conversations')
      .select('*')
      .eq('id', conversation_id)
      .eq('company_id', company.id)
      .maybeSingle();
    conversation = data;
  }

  if (!conversation) {
    const customerId = visitor_email
      ? await findOrCreateCustomer(company.id, { name: visitor_name, email: visitor_email })
      : null;

    const { data: newConvo, error: convoErr } = await supabaseAdmin
      .from('chat_conversations')
      .insert({
        company_id: company.id,
        customer_id: customerId,
        visitor_name: visitor_name || null,
        visitor_email: visitor_email || null,
      })
      .select('*')
      .single();

    if (convoErr) return NextResponse.json({ error: convoErr.message }, { status: 500 });
    conversation = newConvo;
  }

  await supabaseAdmin.from('chat_messages').insert({
    conversation_id: conversation.id,
    role: 'user',
    content: message.trim(),
  });

  if (conversation.customer_id) {
    await supabaseAdmin.from('communication_log').insert({
      company_id: company.id,
      customer_id: conversation.customer_id,
      type: 'chat',
      subject: 'Website chat',
      body: message.trim(),
    });
  }

  const { data: history } = await supabaseAdmin
    .from('chat_messages')
    .select('role, content')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const orderedHistory = (history || []).reverse();
  const conversationText = orderedHistory
    .map((m) => `${m.role === 'user' ? 'Customer' : 'You'}: ${m.content}`)
    .join('\n');

  try {
    const reply = await generateAIReply(company, conversationText, conversation.customer_id);

    await supabaseAdmin.from('chat_messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: reply,
    });

    if (conversation.customer_id) {
      await supabaseAdmin.from('communication_log').insert({
        company_id: company.id,
        customer_id: conversation.customer_id,
        type: 'chat',
        subject: 'Website chat (AI reply)',
        body: reply,
      });
    }

    return NextResponse.json({ conversation_id: conversation.id, reply });
  } catch (err) {
    return NextResponse.json({ error: `Chat failed: ${err.message}` }, { status: 500 });
  }
}
