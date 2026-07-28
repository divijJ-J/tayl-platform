import { supabaseAdmin } from '../../../../../lib/supabase';
import { callGemini } from '../../../../../lib/gemini';
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

  // Find or create the conversation
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
    // Try to match an existing customer by email so this chat feeds
    // straight into their memory (Phase 9), instead of starting a silo.
    let customerId = null;
    if (visitor_email) {
      const { data: existingCustomer } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('company_id', company.id)
        .ilike('email', visitor_email)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer } = await supabaseAdmin
          .from('customers')
          .insert({
            company_id: company.id,
            name: visitor_name || visitor_email,
            email: visitor_email,
          })
          .select('id')
          .single();
        customerId = newCustomer?.id || null;
      }
    }

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

  // Save the incoming visitor message
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

  // Recent history for context (last 10 messages)
  const { data: history } = await supabaseAdmin
    .from('chat_messages')
    .select('role, content')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const orderedHistory = (history || []).reverse();

  // Knowledge base context (Phase 8) — same source of truth as AI estimates
  const { data: knowledge } = await supabaseAdmin
    .from('knowledge_sources')
    .select('title, content')
    .eq('company_id', company.id);

  const knowledgeBlock =
    knowledge && knowledge.length > 0
      ? `\n\nBusiness knowledge base:\n${knowledge.map((k) => `--- ${k.title} ---\n${k.content}`).join('\n\n')}`
      : '';

  const systemPrompt = `${company.chat_persona || 'You are a friendly, professional receptionist for this business.'}

You work for: ${company.name}${knowledgeBlock}

Keep replies short and conversational (2-4 sentences unless more detail is truly needed). Never invent prices, availability, or policies not present in the knowledge base above — if you don't know, say you'll have the team follow up.`;

  const conversationText = orderedHistory
    .map((m) => `${m.role === 'user' ? 'Customer' : 'You'}: ${m.content}`)
    .join('\n');

  try {
    const reply = await callGemini(systemPrompt, conversationText);

    await supabaseAdmin.from('chat_messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: reply.trim(),
    });

    if (conversation.customer_id) {
      await supabaseAdmin.from('communication_log').insert({
        company_id: company.id,
        customer_id: conversation.customer_id,
        type: 'chat',
        subject: 'Website chat (AI reply)',
        body: reply.trim(),
      });
    }

    return NextResponse.json({ conversation_id: conversation.id, reply: reply.trim() });
  } catch (err) {
    return NextResponse.json({ error: `Chat failed: ${err.message}` }, { status: 500 });
  }
}
