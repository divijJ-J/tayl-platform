import { supabaseAdmin } from '../../lib/supabase';
import { getCurrentCompanyId } from '../../lib/supabase-server';
import { redirect } from 'next/navigation';
import TaskCard from './TaskCard';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const COLUMNS = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'done', label: 'Done' },
];

export default async function TasksPage() {
  const { user, companyId } = await getCurrentCompanyId();
  if (!user) redirect('/login');

  const { data: tasks, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  const { data: customers } = await supabaseAdmin
    .from('customers')
    .select('id, name')
    .eq('company_id', companyId);
  const customerMap = Object.fromEntries((customers || []).map((c) => [c.id, c]));

  const { data: comments } = await supabaseAdmin
    .from('task_comments')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true });

  const commentsByTask = {};
  (comments || []).forEach((c) => {
    commentsByTask[c.task_id] = commentsByTask[c.task_id] || [];
    commentsByTask[c.task_id].push(c);
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Tasks</h1>

      {error && <p className="text-red-400 text-sm mb-4">Error: {error.message}</p>}

      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = (tasks || []).filter((t) => t.status === col.key);
          return (
            <div key={col.key}>
              <div className="text-sm font-medium opacity-70 mb-2 flex items-center gap-2">
                {col.label}
                <span className="text-xs opacity-50">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    customerName={customerMap[task.related_customer_id]?.name}
                    comments={commentsByTask[task.id] || []}
                    columns={COLUMNS}
                  />
                ))}
                {colTasks.length === 0 && (
                  <p className="text-xs opacity-40">Nothing here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
