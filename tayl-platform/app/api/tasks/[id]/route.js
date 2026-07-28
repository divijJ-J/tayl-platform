import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../lib/supabase-server';
import { getValidAccessToken, createCalendarEvent, updateCalendarEvent } from '../../../../lib/google-calendar';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  const { id } = params;
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await request.json();
  const updates = { updated_at: new Date().toISOString() };

  if (body.status) {
    const allowed = ['open', 'in_progress', 'done', 'blocked'];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (body.due_date !== undefined) {
    updates.due_date = body.due_date || null;
  }

  const { data: task, error } = await supabaseAdmin
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If a due_date was set (or changed), try to sync it to Google Calendar.
  // Best-effort: calendar failures never block the task update itself.
  if (body.due_date !== undefined && task.due_date) {
    try {
      const accessToken = await getValidAccessToken(companyId);
      if (accessToken) {
        const eventPayload = {
          summary: task.title,
          description: task.description || `TAYL task (${task.trigger_type || 'manual'})`,
          date: task.due_date,
        };
        let eventId = task.google_event_id;
        if (eventId) {
          await updateCalendarEvent(accessToken, eventId, eventPayload);
        } else {
          eventId = await createCalendarEvent(accessToken, eventPayload);
          await supabaseAdmin.from('tasks').update({ google_event_id: eventId }).eq('id', id);
        }
      }
    } catch (calErr) {
      // Swallow — task update already succeeded, calendar sync is a bonus.
      console.error('Calendar sync failed:', calErr.message);
    }
  }

  return NextResponse.json({ success: true });
}
