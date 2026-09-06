import { useState } from "react";
import type { TimelineNode } from "../types";
import { completeThrough, deadlineFlag, todayISO, uid } from "../lib/logic";

export function Timeline({
  nodes,
  onChange,
}: {
  nodes: TimelineNode[];
  onChange: (nodes: TimelineNode[]) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const lastDone = nodes.reduce((acc, n, i) => (n.done ? i : acc), -1);
  const fillPct =
    nodes.length <= 1 ? (lastDone >= 0 ? 100 : 0) : Math.max(0, (lastDone / (nodes.length - 1)) * 100);

  return (
    <div className="timeline" data-tour="timeline">
      <div className="timeline-line" />
      <div className="timeline-fill" style={{ width: `calc(${fillPct}% - 24px)` }} />
      <div className="timeline-track">
        {nodes.map((n, i) => {
          const flag = deadlineFlag(n.deadline, n.done);
          const open = editId === n.id;
          return (
            <div key={n.id} className={`node ${n.done ? "done" : ""}`}>
              <button
                type="button"
                className="node-dot"
                title="完成到这里"
                onClick={() => {
                  setEditId(null);
                  onChange(completeThrough(nodes, i));
                }}
              />
              <button type="button" className="node-meta" onClick={() => setEditId(open ? null : n.id)}>
                <b>{n.title}</b>
                <small>{n.note || "点击改截止日"}</small>
                <small>{n.deadline ? `截止 ${n.deadline}` : "无截止日期"}</small>
                {flag === "urgent" && <span className="chip urgent">即将截止</span>}
                {flag === "overdue" && <span className="chip overdue">已逾期</span>}
              </button>
              {open && (
                <div className="node-pop">
                  <label className="field">
                    <span>节点</span>
                    <input
                      value={n.title}
                      onChange={(e) =>
                        onChange(nodes.map((x) => (x.id === n.id ? { ...x, title: e.target.value } : x)))
                      }
                    />
                  </label>
                  <label className="field">
                    <span>截止日</span>
                    <input
                      type="date"
                      value={n.deadline ?? ""}
                      onChange={(e) =>
                        onChange(
                          nodes.map((x) => (x.id === n.id ? { ...x, deadline: e.target.value || null } : x)),
                        )
                      }
                    />
                  </label>
                  <div className="row">
                    <button className="btn ghost" type="button" onClick={() => setEditId(null)}>
                      关闭
                    </button>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => {
                        onChange(nodes.filter((x) => x.id !== n.id));
                        setEditId(null);
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <button
          type="button"
          className="node-add"
          onClick={() =>
            onChange([
              ...nodes,
              {
                id: uid(),
                title: "新节点",
                note: "",
                deadline: todayISO(),
                done: false,
                statusHint: "applied",
                interviewKind: null,
              },
            ])
          }
        >
          + 加节点
        </button>
      </div>
    </div>
  );
}
