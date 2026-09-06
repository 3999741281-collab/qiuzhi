import type { Job, Todo } from "../types";
import { uid } from "../lib/logic";
import { useState } from "react";

export function TodoList({
  todos,
  jobs,
  jobId,
  onSave,
  onRemove,
}: {
  todos: Todo[];
  jobs: Job[];
  jobId?: string;
  onSave: (t: Todo) => void;
  onRemove: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const visible = jobId ? todos.filter((t) => t.jobId === jobId) : todos;

  return (
    <div>
      {visible.length === 0 && <p className="muted">还没有待办。</p>}
      {visible.map((t) => {
        const job = jobs.find((j) => j.id === t.jobId);
        return (
          <label key={t.id} className="todo-item">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => onSave({ ...t, done: !t.done })}
            />
            <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none" }}>
              {t.text}
              {!jobId && job && (
                <small className="muted"> · {job.company}</small>
              )}
            </span>
            <button type="button" className="btn ghost" onClick={() => onRemove(t.id)}>
              删
            </button>
          </label>
        );
      })}
      <form
        className="row"
        style={{ marginTop: 10 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onSave({
            id: uid(),
            jobId,
            text: text.trim(),
            done: false,
            createdAt: new Date().toISOString(),
          });
          setText("");
        }}
      >
        <input
          style={{ flex: 1, borderRadius: 4, border: "1px solid var(--line)", padding: "8px 10px" }}
          placeholder={jobId ? "给这个岗位加待办" : "加一条待办"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" type="submit">
          添加
        </button>
      </form>
    </div>
  );
}
