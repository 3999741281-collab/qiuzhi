import type { Job } from "../types";
import { deadlineFlag, nearestOpenDeadline } from "./logic";

export function requestNotifyPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

export function scanDeadlines(jobs: Job[]) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const key = "jobboard:last-notify";
  const last = localStorage.getItem(key);
  const today = new Date().toISOString().slice(0, 10);
  if (last === today) return;

  const hits: string[] = [];
  for (const job of jobs) {
    for (const ch of job.channels) {
      for (const n of ch.nodes) {
        const f = deadlineFlag(n.deadline, n.done);
        if (f === "urgent" || f === "overdue") {
          hits.push(`${job.company} · ${n.title}（${f === "overdue" ? "已逾期" : "即将截止"}）`);
        }
      }
      const near = nearestOpenDeadline(ch.nodes);
      if (near) {
        const f = deadlineFlag(near, false);
        if (f === "ok") {
          /* skip */
        }
      }
    }
  }
  if (hits.length) {
    new Notification("求职看板 · 截止日期", {
      body: hits.slice(0, 4).join("\n") + (hits.length > 4 ? `\n另有 ${hits.length - 4} 项` : ""),
    });
    localStorage.setItem(key, today);
  }
}
