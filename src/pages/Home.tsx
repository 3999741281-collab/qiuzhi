import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import {
  AUTH_CHANNELS,
  CHANNEL_LABEL,
  STATUS_LABEL,
  type ChannelKind,
  type FlowStatus,
  type Job,
  type JobType,
} from "../types";
import {
  completeMustDo,
  derivedStatus,
  nearestOpenDeadline,
  uid,
  deadlineFlag,
  todayMustDos,
} from "../lib/logic";
import { TEMPLATES, buildNodes } from "../lib/templates";
import { DemoDialog } from "../components/DemoDialog";
import { ResumeAside } from "../components/ResumeAside";
import { useOptionalTour } from "../lib/tour";

type SortKey = "latest" | "deadline" | "star";

function jobStatus(job: Job): FlowStatus {
  return derivedStatus(
    job.channels.map((c) => c.nodes),
    job.statusOverride,
  );
}

function latestApply(job: Job): string {
  return job.channels.map((c) => c.appliedAt).sort().at(-1) ?? job.createdAt;
}

function jobDeadline(job: Job): string {
  const ds = job.channels
    .map((c) => nearestOpenDeadline(c.nodes))
    .filter(Boolean) as string[];
  ds.sort();
  return ds[0] ?? "9999-12-31";
}

export function HomePage() {
  const nav = useNavigate();
  const { state, upsertJob, upsertTodo, removeTodo, patch } = useStore();
  const [view, setView] = useState<"list" | "must">("list");
  const [sort, setSort] = useState<SortKey>("latest");
  const [showNew, setShowNew] = useState(false);
  const [dialog, setDialog] = useState<"shot" | "auth-demo" | "auth-pick" | null>(null);
  const [pendingAuth, setPendingAuth] = useState<ChannelKind | null>(null);
  const [revokeKind, setRevokeKind] = useState<ChannelKind | null>(null);
  const [todoText, setTodoText] = useState("");
  const tour = useOptionalTour();

  useEffect(() => {
    if (tour?.step?.homeView) setView(tour.step.homeView);
  }, [tour?.step]);

  const jobs = useMemo(() => {
    if (!state) return [];
    const list = [...state.jobs];
    list.sort((a, b) => {
      if (sort === "star") {
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        return latestApply(b).localeCompare(latestApply(a));
      }
      if (sort === "deadline") return jobDeadline(a).localeCompare(jobDeadline(b));
      return latestApply(b).localeCompare(latestApply(a));
    });
    return list;
  }, [state, sort]);

  if (!state) return null;

  const must = todayMustDos(state.jobs);

  return (
    <div className="grid-home">
      <div>
        <div className="toolbar">
          <div className="filter-bar">
            <div className="filter-group" data-tour="views">
              <button
                type="button"
                className={`view-btn ${view === "list" ? "on" : ""}`}
                onClick={() => setView("list")}
              >
                列表
              </button>
              <button
                type="button"
                className={`view-btn ${view === "must" ? "on" : ""}`}
                onClick={() => setView("must")}
              >
                今日必做
              </button>
            </div>
            {view === "list" && (
              <div className="filter-group" data-tour="sort">
                <button
                  type="button"
                  className={`view-btn ${sort === "latest" ? "on" : ""}`}
                  onClick={() => setSort("latest")}
                >
                  最新投递
                </button>
                <button
                  type="button"
                  className={`view-btn ${sort === "deadline" ? "on" : ""}`}
                  onClick={() => setSort("deadline")}
                >
                  即将截止
                </button>
                <button
                  type="button"
                  className={`view-btn ${sort === "star" ? "on" : ""}`}
                  onClick={() => setSort("star")}
                >
                  星标优先
                </button>
              </div>
            )}
          </div>
          <div className="row">
            <button className="btn" data-tour="new" onClick={() => setShowNew(true)}>
              新建岗位
            </button>
            <label className="btn olive" data-tour="shot">
              截图导入
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={() => {
                  setDialog("shot");
                }}
              />
            </label>
            <button className="btn ghost" type="button" data-tour="auth" onClick={() => setDialog("auth-pick")}>
              授权登录
            </button>
          </div>
        </div>

        {view === "must" && (
        <div className="panel" style={{ marginBottom: 16 }} data-tour="must">
            <h2 style={{ marginTop: 0, color: "var(--olive)" }}>今日必做</h2>
            <p className="muted">未完成且 2 天内截止的节点，以及你自己加的待办</p>
            <div className="must-list">
              {must.map((m) => (
                <div key={`${m.jobId}-${m.nodeId}`} className="must-item">
                  <button
                    type="button"
                    className="must-check"
                    title="完成"
                    onClick={() => {
                      const next = completeMustDo(state.jobs, m);
                      if (next) upsertJob(next);
                    }}
                  >
                    ☐
                  </button>
                  <button type="button" className="must-body" onClick={() => nav(`/jobs/${m.jobId}`)}>
                    <b>
                      {m.nodeTitle} · {m.deadline}
                    </b>
                    <span className="muted">
                      {m.company} · {m.jobTitle} · {m.channel}
                    </span>
                  </button>
                </div>
              ))}
              {state.todos
                .filter((t) => !t.done)
                .map((t) => {
                  const job = state.jobs.find((j) => j.id === t.jobId);
                  return (
                    <div key={t.id} className="must-item">
                      <button
                        type="button"
                        className="must-check"
                        title="完成"
                        onClick={() => upsertTodo({ ...t, done: true })}
                      >
                        ☐
                      </button>
                      <span className="must-body">
                        <b>{t.text}</b>
                        {job && (
                          <span className="muted">
                            {job.company} · {job.title}
                          </span>
                        )}
                      </span>
                      <button className="btn ghost" type="button" onClick={() => removeTodo(t.id)}>
                        删
                      </button>
                    </div>
                  );
                })}
            </div>
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault();
                if (!todoText.trim()) return;
                upsertTodo({
                  id: uid(),
                  text: todoText.trim(),
                  done: false,
                  createdAt: new Date().toISOString(),
                });
                setTodoText("");
              }}
            >
              <input
                style={{ flex: 1 }}
                placeholder="加一条待办"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
              />
              <button className="btn" type="submit">
                添加
              </button>
            </form>
          </div>
        )}
        {view === "list" && jobs.length === 0 && (
          <div className="panel empty">
            <div className="vinyl" style={{ margin: "0 auto 12px" }} />
            <p>还没有投递。先建一张岗位卡，或用截图导入。</p>
          </div>
        )}

        {view === "list" && (
          <div className="job-list">
            {jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                onOpen={() => nav(`/jobs/${job.id}`)}
                onStar={() => upsertJob({ ...job, starred: !job.starred, updatedAt: new Date().toISOString() })}
              />
            ))}
          </div>
        )}
      </div>

      <ResumeAside />

      {showNew && (
        <NewJobModal
          onClose={() => setShowNew(false)}
          onCreate={(job) => {
            upsertJob(job);
            setShowNew(false);
            nav(`/jobs/${job.id}`);
          }}
        />
      )}
      {dialog === "shot" && (
        <DemoDialog title="截图导入" onClose={() => setDialog(null)}>
          <p>识别招聘截图，抽出公司、岗位、地点、薪酬和职责，确认后再写入。</p>
        </DemoDialog>
      )}
      {dialog === "auth-pick" && (
        <div className="demo-overlay" role="dialog" aria-modal="true">
          <div className="demo-card" style={{ textAlign: "left" }}>
            <h2 id="dialog-title">授权登录</h2>
            <p className="muted">选择渠道。已授权的颜色不同；旁边可取消。</p>
            <div className="auth-list">
              {AUTH_CHANNELS.map((kind) => {
                const on = state.authorizedChannels.includes(kind);
                return (
                  <div key={kind} className="auth-row">
                    <button
                      type="button"
                      className={`auth-chip ${on ? "on" : ""}`}
                      onClick={() => {
                        if (on) return;
                        setPendingAuth(kind);
                        setDialog("auth-demo");
                      }}
                    >
                      {CHANNEL_LABEL[kind]}
                    </button>
                    {on && (
                      <button className="btn ghost" type="button" onClick={() => setRevokeKind(kind)}>
                        取消
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <button className="btn" type="button" onClick={() => setDialog(null)} style={{ marginTop: 16 }}>
              关闭
            </button>
          </div>
        </div>
      )}
      {dialog === "auth-demo" && pendingAuth && (
        <DemoDialog
          title="授权登录"
          onClose={() => {
            patch((s) => ({
              ...s,
              authorizedChannels: s.authorizedChannels.includes(pendingAuth)
                ? s.authorizedChannels
                : [...s.authorizedChannels, pendingAuth],
            }));
            setPendingAuth(null);
            setDialog("auth-pick");
          }}
        >
          <p>
            将跳转到 {CHANNEL_LABEL[pendingAuth]} 完成授权。授权成功后，该渠道会标记为已授权。
          </p>
        </DemoDialog>
      )}
      {revokeKind && (
        <div className="demo-overlay" role="dialog" aria-modal="true">
          <div className="demo-card">
            <h2>确认取消授权？</h2>
            <p>取消后，「{CHANNEL_LABEL[revokeKind]}」会变回未授权颜色。</p>
            <div className="row" style={{ justifyContent: "center" }}>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  patch((s) => ({
                    ...s,
                    authorizedChannels: s.authorizedChannels.filter((k) => k !== revokeKind),
                  }));
                  setRevokeKind(null);
                }}
              >
                取消
              </button>
              <button className="btn ghost" type="button" onClick={() => setRevokeKind(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JobRow({ job, onOpen, onStar }: { job: Job; onOpen: () => void; onStar: () => void }) {
  const status = jobStatus(job);
  const due = jobDeadline(job);
  const flag = due === "9999-12-31" ? "ok" : deadlineFlag(due, false);
  return (
    <div className={`job-row ${job.starred ? "starred" : ""}`}>
      <button className={`star ${job.starred ? "on" : ""}`} onClick={onStar} type="button">
        ★
      </button>
      <button type="button" onClick={onOpen} style={{ background: "none", border: 0, textAlign: "left" }}>
        <h3>
          {job.company} · {job.title}
        </h3>
        <p>
          <span className="chip olive">{STATUS_LABEL[status]}</span>
          {job.channels.map((c) => (
            <span key={c.id} className="chip">
              {CHANNEL_LABEL[c.kind]}
            </span>
          ))}
          {flag === "urgent" && <span className="chip urgent">即将截止 {due}</span>}
          {flag === "overdue" && <span className="chip overdue">已逾期 {due}</span>}
        </p>
      </button>
      <Link to={`/jobs/${job.id}`} className="muted">
        详情
      </Link>
    </div>
  );
}

function NewJobModal({ onClose, onCreate }: { onClose: () => void; onCreate: (job: Job) => void }) {
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<JobType>("intern");
  const [kind, setKind] = useState<ChannelKind>("boss");
  const [url, setUrl] = useState("");
  const [tpl, setTpl] = useState<(typeof TEMPLATES)[number]["id"]>("full");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,22,22,.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 20,
      }}
    >
      <form
        className="panel"
        style={{ width: "min(520px, 100%)" }}
        onSubmit={(e) => {
          e.preventDefault();
          const seeds = TEMPLATES.find((t) => t.id === tpl)?.seeds ?? TEMPLATES[0].seeds;
          const job: Job = {
            id: uid(),
            company: company.trim(),
            title: title.trim(),
            location: "",
            salary: "",
            description: "",
            type,
            starred: false,
            statusOverride: null,
            resumeId: null,
            notes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            channels: [
              {
                id: uid(),
                kind,
                url,
                appliedAt: new Date().toISOString(),
                nodes: buildNodes(seeds),
              },
            ],
          };
          onCreate(job);
        }}
      >
        <h2 style={{ marginTop: 0 }}>新建岗位卡</h2>
        <label className="field">
          <span>公司</span>
          <input required value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
        <label className="field">
          <span>岗位</span>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field">
          <span>类型</span>
          <select value={type} onChange={(e) => setType(e.target.value as JobType)}>
            <option value="intern">实习</option>
            <option value="campus">校招</option>
            <option value="social">社招</option>
          </select>
        </label>
        <label className="field">
          <span>首个渠道</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as ChannelKind)}>
            {Object.entries(CHANNEL_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>链接（可选）</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
        </label>
        <label className="field">
          <span>流程模板（之后可改节点）</span>
          <select value={tpl} onChange={(e) => setTpl(e.target.value as typeof tpl)}>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <div className="row">
          <button className="btn" type="submit">
            创建
          </button>
          <button className="btn ghost" type="button" onClick={onClose}>
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
