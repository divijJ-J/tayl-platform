'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TaskCard({ task, customerName, comments, columns }) {
  const router = useRouter();
  const [status, setStatus] = useState(task.status);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: commentText }),
      });
      setCommentText('');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-white/10 rounded px-3 py-2 text-sm">
      <div className="font-medium">{task.title}</div>
      {customerName && <div className="text-xs opacity-60 mt-0.5">{customerName}</div>}
      {task.trigger_type && (
        <div className="text-xs opacity-40 mt-1">Trigger: {task.trigger_type}</div>
      )}

      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="w-full mt-2 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs"
      >
        {columns.map((c) => (
          <option key={c.key} value={c.key}>
            {c.label}
          </option>
        ))}
      </select>

      <button
        onClick={() => setShowComments(!showComments)}
        className="text-xs opacity-50 hover:opacity-80 mt-2 underline"
      >
        {comments.length > 0 ? `${comments.length} comment(s)` : 'Add comment'}
      </button>

      {showComments && (
        <div className="mt-2 space-y-1">
          {comments.map((c) => (
            <div key={c.id} className="text-xs bg-black/30 rounded px-2 py-1">
              {c.comment}
            </div>
          ))}
          <form onSubmit={handleAddComment} className="flex gap-1 mt-1">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs"
            />
            <button
              type="submit"
              disabled={submitting}
              className="text-xs bg-white text-black rounded px-2 py-1 disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
