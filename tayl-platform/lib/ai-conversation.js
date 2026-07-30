import { supabaseAdmin } from './supabase';
import { callGemini } from './gemini';

// Finds/creates a customer record for a visitor identified by email or phone,
// so every channel (website chat, WhatsApp) feeds the same Customer Memory.
export async function findOrCreateCustomer(companyId, { name, email, phone }) {
  if (!email && !phone) return null;

  let query = supabaseAdmin.from('customers').select('id').eq('company_id', companyId);
  if (email) query = query.ilike('email', email);
  else query = query.eq('phone', phone);

  const { data: existing } = await query.maybeSingle();
  if (existing) return existing.id;

  const { data: created } = await supabaseAdmin
    .from('customers')
    .insert({ company_id: companyId, name: name || email || phone, email: email || null, phone: phone || null })
    .select('id')
    .single();

  return created?.id || null;
}

// Generates an AI reply for a company, using the shared Knowledge Base
// (Phase 8), Customer Memory (Phase 9), and the conversation persona
// (Phase 10). Used identically by the website chat widget and WhatsApp.
export async function generateAIReply(company, conversationText, customerId) {
  const { data: knowledge } = await supabaseAdmin
    .from('knowledge_sources')
    .select('title, content')
    .eq('company_id', company.id);

  const knowledgeBlock =
    knowledge && knowledge.length > 0
      ? `\n\nBusiness knowledge base:\n${knowledge.map((k) => `--- ${k.title} ---\n${k.content}`).join('\n\n')}`
      : '';

  let customerBlock = '';
  if (customerId) {
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('name, ai_summary')
      .eq('id', customerId)
      .maybeSingle();
    if (customer?.ai_summary) {
      customerBlock = `\n\nWhat we know about this customer (${customer.name}) from past interactions:\n${customer.ai_summary}`;
    }
  }

  const systemPrompt = `${company.chat_persona || 'You are a friendly, professional receptionist for this business.'}

You work for: ${company.name}${knowledgeBlock}${customerBlock}

Keep replies short and conversational (2-4 sentences unless more detail is truly needed). Never invent prices, availability, or policies not present in the knowledge base above — if you don't know, say you'll have the team follow up.`;

  const reply = await callGemini(systemPrompt, conversationText);
  return reply.trim();
}

// Logs a message pair into communication_log so it feeds the customer's
// AI Memory Summary the same way regardless of which channel it came from.
export async function logToCustomerHistory(companyId, customerId, subjectPrefix, incomingText, replyText) {
  if (!customerId) return;
  await supabaseAdmin.from('communication_log').insert([
    { company_id: companyId, customer_id: customerId, type: 'chat', subject: subjectPrefix, body: incomingText },
    { company_id: companyId, customer_id: customerId, type: 'chat', subject: `${subjectPrefix} (AI reply)`, body: replyText },
  ]);
}
