import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../lib/store";
import { Timeline } from "../components/Timeline";
import { TodoList } from "../components/TodoList";
import {
  CHANNEL_LABEL,
  JOB_TYPE_LABEL,
  STATUS_LABEL,
  type Channel,
  type ChannelKind,
  type FlowStatus,
  type Job,
} from "../types";
import { derivedStatus, uid } from "../lib/logic";
import { LIGHT_PIPELINE, buildNodes } from "../lib/templates";
import { DemoDialog } from "../components/DemoDialog";

export function JobDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { state, upsertJob, removeJob, upsertTodo, removeTodo } = useStore();
  const job = state?.jobs.find((j) => j.id === id);
  const [channelId, setChannelId] = useState(job?.channels[0]?.id ?? "");
  const [editing, setEditing] = useState(false);
  const [dialog, setDialog] = useState<"shot" | "boss" | null>(null);

  const channel = useMemo(
    () => job?.channels.find((c) => c.id === channelId) ?? job?.channels[0],
    [job, channelId],
  );

  if (!state || !job) {
    return (
      <div className="panel">
        找不到岗位。<Link to="/">回首页</Link>
      </div>
    );
  }

  const active = channel ?? job.channels[0];
  const status = derivedStatus(
    job.channels.map((c) => c.nodes),
    job.statusOverride,
  );

  const save = (next: Job) => upsertJob({ ...next, updatedAt: new Date().toISOString() });

  const resumeName = state.resumes.find((r) => r.id === job.resumeId)?.name ?? "未绑定";

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <Link to="/" className="muted">
            ← 首页
          </Link>
          <h1 style={{ margin: "8px 0 4px", color: "var(--olive)" }} data-tour="job-head">
            {job.company} · {job.title}
          </h1>
          <p className="muted">{JOB_TYPE_LABEL[job.type]}</p>
        </div>
        <button
          className={`star ${job.starred ? "on" : ""}`}
          style={{ fontSize: 28 }}
          onClick={() => save({ ...job, starred: !job.starred })}
        >
          ★
        </button>
      </div>

      <section className="status-lead">
        <span className="status-lead-label">流程状态</span>
        {editing ? (
          <select
            value={job.statusOverride ?? "auto"}
            onChange={(e) =>
              save({
                ...job,
                statusOverride: e.target.value === "auto" ? null : (e.target.value as FlowStatus),
              })
            }
          >
            <option value="auto">跟随时间轴</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        ) : (
          <strong>{STATUS_LABEL[status]}</strong>
        )}
      </section>

      <section className="info-block">
        <div className="info-head">
          <h2>岗位信息</h2>
          <div className="row">
            <label className="btn olive">
              截图识别
              <input type="file" accept="image/*" hidden onChange={() => setDialog("shot")} />
            </label>
            <button className="btn ghost" type="button" onClick={() => setEditing((v) => !v)}>
              {editing ? "完成" : "编辑"}
            </button>
          </div>
        </div>
        {editing ? (
          <>
            <div className="info-grid">
              <label className="field">
                <span>公司</span>
                <input value={job.company} onChange={(e) => save({ ...job, company: e.target.value })} />
              </label>
              <label className="field">
                <span>岗位</span>
                <input value={job.title} onChange={(e) => save({ ...job, title: e.target.value })} />
              </label>
              <label className="field">
                <span>办公地点</span>
                <input value={job.location} onChange={(e) => save({ ...job, location: e.target.value })} />
              </label>
              <label className="field">
                <span>薪酬范围</span>
                <input value={job.salary} onChange={(e) => save({ ...job, salary: e.target.value })} />
              </label>
            </div>
            <label className="field">
              <span>岗位职责</span>
              <textarea
                rows={5}
                value={job.description}
                onChange={(e) => save({ ...job, description: e.target.value })}
              />
            </label>
            <label className="field">
              <span>绑定简历</span>
              <select
                value={job.resumeId ?? ""}
                onChange={(e) => save({ ...job, resumeId: e.target.value || null })}
              >
                <option value="">未绑定</option>
                {state.resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <div className="info-grid">
              <div className="info-item">
                <span>公司</span>
                <b>{job.company}</b>
              </div>
              <div className="info-item">
                <span>岗位</span>
                <b>{job.title}</b>
              </div>
              <div className="info-item">
                <span>办公地点</span>
                <b>{job.location || "—"}</b>
              </div>
              <div className="info-item">
                <span>薪酬范围</span>
                <b>{job.salary || "—"}</b>
              </div>
            </div>
            <div className="info-item" style={{ marginTop: 16 }}>
              <span>岗位职责</span>
              <p>{job.description || "—"}</p>
            </div>
            <div className="info-item" style={{ marginTop: 12 }}>
              <span>绑定简历</span>
              <b>{resumeName}</b>
            </div>
          </>
        )}
      </section>

      <section className="panel">
        <div className="toolbar">
          <h2 style={{ margin: 0, color: "var(--olive)" }}>投递渠道与进度</h2>
          <div className="row">
            <button className="btn ghost" type="button" onClick={() => setDialog("boss")}>
              连接 Boss
            </button>
            <button
              className="btn olive"
              type="button"
              onClick={() => {
              const ch: Channel = {
                id: uid(),
                kind: "official",
                url: "",
                appliedAt: new Date().toISOString(),
                nodes: buildNodes(LIGHT_PIPELINE),
              };
              save({ ...job, channels: [...job.channels, ch] });
              setChannelId(ch.id);
            }}
          >
            加渠道
            </button>
          </div>
        </div>
        <div className="seg" style={{ marginBottom: 12 }}>
          {job.channels.map((c) => (
            <button
              key={c.id}
              className={active?.id === c.id ? "on" : ""}
              onClick={() => setChannelId(c.id)}
              type="button"
            >
              {CHANNEL_LABEL[c.kind]}
            </button>
          ))}
        </div>
        {active && (
          <ChannelEditor
            channel={active}
            onChange={(ch) =>
              save({
                ...job,
                channels: job.channels.map((c) => (c.id === ch.id ? ch : c)),
              })
            }
            onRemove={() => {
              const next = job.channels.filter((c) => c.id !== active.id);
              if (!next.length) return;
              save({ ...job, channels: next });
              setChannelId(next[0].id);
            }}
          />
        )}
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0, color: "var(--olive)" }}>面试反馈与反思（同一岗位汇总）</h2>
        <NotesEditor job={job} onSave={save} />
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0, color: "var(--olive)" }}>这个岗位的待办</h2>
        <TodoList
          todos={state.todos}
          jobs={state.jobs}
          jobId={job.id}
          onSave={upsertTodo}
          onRemove={removeTodo}
        />
      </section>

      <button
        className="btn ghost"
        type="button"
        onClick={() => {
          if (confirm("删除这个岗位？")) {
            removeJob(job.id);
            nav("/");
          }
        }}
      >
        删除岗位
      </button>
      {dialog === "shot" && (
        <DemoDialog title="截图识别" onClose={() => setDialog(null)}>
          <p>识别招聘截图并填写岗位信息，也可以用来整理面试备注。</p>
        </DemoDialog>
      )}
      {dialog === "boss" && (
        <DemoDialog title="授权登录" onClose={() => setDialog(null)}>
          <p>将跳转到 Boss 完成授权，授权后即可管理该渠道的投递。</p>
        </DemoDialog>
      )}
    </div>
  );
}

function ChannelEditor({
  channel,
  onChange,
  onRemove,
}: {
  channel: Channel;
  onChange: (c: Channel) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label className="field">
          <span>渠道</span>
          <select
            value={channel.kind}
            onChange={(e) => onChange({ ...channel, kind: e.target.value as ChannelKind })}
          >
            {Object.entries(CHANNEL_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>投递链接</span>
          <input value={channel.url} onChange={(e) => onChange({ ...channel, url: e.target.value })} />
        </label>
      </div>
      <Timeline nodes={channel.nodes} onChange={(nodes) => onChange({ ...channel, nodes })} />
      <button className="btn ghost" type="button" onClick={onRemove}>
        移除此渠道
      </button>
    </div>
  );
}

function NotesEditor({ job, onSave }: { job: Job; onSave: (j: Job) => void }) {
  const [round, setRound] = useState("一面");
  const [kind, setKind] = useState<"feedback" | "reflection">("reflection");
  const [content, setContent] = useState("");
  const grouped = job.notes;

  return (
    <div>
      {grouped.length === 0 && <p className="muted">还没有备注。面完可以写下面试官反馈或自己的反思。</p>}
      <div className="notes">
        {grouped.map((n) => (
          <div key={n.id} className="note">
            <b>
              {n.round} · {n.kind === "feedback" ? "面试官反馈" : "自我反思"}
            </b>
            <p style={{ margin: "6px 0 0" }}>{n.content}</p>
            <small className="muted">{new Date(n.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <input value={round} onChange={(e) => setRound(e.target.value)} placeholder="场次，如二面" />
        <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="feedback">面试官反馈</option>
          <option value="reflection">自我反思</option>
        </select>
      </div>
      <textarea
        rows={3}
        style={{ width: "100%", marginTop: 8, borderRadius: 4, padding: 10 }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写在这里，会汇总进这张岗位卡（含多渠道）"
      />
      <button
        className="btn"
        type="button"
        style={{ marginTop: 8 }}
        onClick={() => {
          if (!content.trim()) return;
          onSave({
            ...job,
            notes: [
              {
                id: uid(),
                round,
                kind,
                content: content.trim(),
                createdAt: new Date().toISOString(),
              },
              ...job.notes,
            ],
          });
          setContent("");
        }}
      >
        记下
      </button>
    </div>
  );
}
