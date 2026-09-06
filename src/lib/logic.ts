import { CHANNEL_LABEL, type FlowStatus, type Job, type KanbanColumn, type TimelineNode } from "../types";

export function uid(): string {
  return crypto.randomUUID();
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export type DeadlineFlag = "ok" | "urgent" | "overdue";

export function deadlineFlag(deadline: string | null, done: boolean): DeadlineFlag {
  if (!deadline || done) return "ok";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(`${deadline}T00:00:00`);
  const diff = Math.round((due.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return "overdue";
  if (diff <= 2) return "urgent";
  return "ok";
}

export function nearestOpenDeadline(nodes: TimelineNode[]): string | null {
  const open = nodes
    .filter((n) => !n.done && n.deadline)
    .map((n) => n.deadline as string)
    .sort();
  return open[0] ?? null;
}

export function kanbanColumn(status: FlowStatus): KanbanColumn {
  if (status === "rejected" || status === "offer" || status === "ended") return "result";
  if (
    status === "interview_1" ||
    status === "interview_2" ||
    status === "interview_3" ||
    status === "hr"
  ) {
    return "interview";
  }
  return "progress";
}

const RANK: Record<FlowStatus, number> = {
  applied: 1,
  screening: 2,
  assessment: 3,
  interview_1: 4,
  interview_2: 5,
  interview_3: 6,
  hr: 7,
  offer: 8,
  ended: 0,
  rejected: 0,
};

export function derivedStatus(nodesLists: TimelineNode[][], override: FlowStatus | null): FlowStatus {
  if (override) return override;
  const all = nodesLists.flat();
  if (all.some((n) => n.done && n.statusHint === "rejected")) return "rejected";
  if (all.some((n) => n.done && n.statusHint === "offer")) return "offer";
  let best: FlowStatus = "applied";
  let rank = 0;
  for (const n of all) {
    if (!n.done) continue;
    const r = RANK[n.statusHint] ?? 0;
    if (r >= rank) {
      rank = r;
      best = n.statusHint;
    }
  }
  return best;
}

export function completeThrough(nodes: TimelineNode[], index: number): TimelineNode[] {
  const now = new Date().toISOString();
  return nodes.map((n, i) => {
    if (i <= index) {
      return { ...n, done: true, doneAt: n.doneAt ?? now };
    }
    return { ...n, done: false, doneAt: undefined };
  });
}

export interface MustDoItem {
  jobId: string;
  channelId: string;
  nodeId: string;
  company: string;
  jobTitle: string;
  nodeTitle: string;
  deadline: string;
  channel: string;
}

export function todayMustDos(jobs: Job[]): MustDoItem[] {
  const items: MustDoItem[] = [];
  for (const job of jobs) {
    for (const ch of job.channels) {
      for (const n of ch.nodes) {
        if (deadlineFlag(n.deadline, n.done) !== "urgent" || !n.deadline) continue;
        items.push({
          jobId: job.id,
          channelId: ch.id,
          nodeId: n.id,
          company: job.company,
          jobTitle: job.title,
          nodeTitle: n.title,
          deadline: n.deadline,
          channel: CHANNEL_LABEL[ch.kind],
        });
      }
    }
  }
  items.sort((a, b) => a.deadline.localeCompare(b.deadline));
  return items;
}

export function completeMustDo(jobs: Job[], item: MustDoItem): Job | null {
  const job = jobs.find((j) => j.id === item.jobId);
  if (!job) return null;
  const ch = job.channels.find((c) => c.id === item.channelId);
  if (!ch) return null;
  const index = ch.nodes.findIndex((n) => n.id === item.nodeId);
  if (index < 0) return null;
  return {
    ...job,
    updatedAt: new Date().toISOString(),
    channels: job.channels.map((c) =>
      c.id === ch.id ? { ...c, nodes: completeThrough(c.nodes, index) } : c,
    ),
  };
}

export function countApplications(jobs: Job[]): number {
  let n = 0;
  for (const job of jobs) {
    for (const ch of job.channels) {
      for (const node of ch.nodes) {
        if (node.done && (node.statusHint === "applied" || node.title === "投递")) n += 1;
      }
    }
  }
  return n;
}

export function countInterviews(jobs: Job[]): number {
  let n = 0;
  for (const job of jobs) {
    for (const ch of job.channels) {
      for (const node of ch.nodes) {
        if (
          node.done &&
          (node.statusHint === "interview_1" ||
            node.statusHint === "interview_2" ||
            node.statusHint === "interview_3" ||
            node.statusHint === "hr")
        ) {
          n += 1;
        }
      }
    }
  }
  return n;
}

export function jobFunnel(jobs: Job[]): { progress: number; interview: number; result: number } {
  const funnel = { progress: 0, interview: 0, result: 0 };
  for (const job of jobs) {
    funnel[kanbanColumn(derivedStatus(job.channels.map((c) => c.nodes), job.statusOverride))] += 1;
  }
  return funnel;
}
