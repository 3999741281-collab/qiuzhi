import type { FlowStatus, TimelineNode } from "../types";
import { addDays, todayISO, uid } from "./logic";

export interface NodeSeed {
  title: string;
  note: string;
  statusHint: FlowStatus;
  interviewKind?: TimelineNode["interviewKind"];
  offsetDays: number;
}

export const DEFAULT_PIPELINE: NodeSeed[] = [
  { title: "投递", note: "提交简历 / 完成网申", statusHint: "applied", offsetDays: 0 },
  { title: "简历筛选", note: "等待 HR 查看", statusHint: "screening", offsetDays: 5 },
  { title: "性格 / 综合测评", note: "按时完成在线测评", statusHint: "assessment", offsetDays: 7 },
  { title: "专项测评", note: "岗位相关笔试或量表", statusHint: "assessment", offsetDays: 8 },
  { title: "AI 面试", note: "按链接完成视频问答", statusHint: "assessment", offsetDays: 10 },
  { title: "AI Coding", note: "在线编程测评", statusHint: "assessment", offsetDays: 11 },
  { title: "一面", note: "技术或业务初面", statusHint: "interview_1", interviewKind: "tech", offsetDays: 18 },
  { title: "二面", note: "深入业务 / 交叉面", statusHint: "interview_2", interviewKind: "biz", offsetDays: 25 },
  { title: "HR 面", note: "薪资、到岗、背景", statusHint: "hr", interviewKind: "hr", offsetDays: 32 },
  { title: "Offer", note: "口头或书面 offer", statusHint: "offer", offsetDays: 40 },
];

export const LIGHT_PIPELINE: NodeSeed[] = [
  { title: "投递", note: "已投出简历", statusHint: "applied", offsetDays: 0 },
  { title: "测评", note: "性格 / 笔试 / AI", statusHint: "assessment", offsetDays: 5 },
  { title: "一面", note: "第一轮面试", statusHint: "interview_1", offsetDays: 12 },
  { title: "二面", note: "第二轮面试", statusHint: "interview_2", offsetDays: 18 },
  { title: "HR 面", note: "谈薪与确认", statusHint: "hr", interviewKind: "hr", offsetDays: 24 },
];

export const TEMPLATES = [
  { id: "full", name: "完整校招 / 实习流程", seeds: DEFAULT_PIPELINE },
  { id: "light", name: "精简流程", seeds: LIGHT_PIPELINE },
] as const;

export function buildNodes(seeds: NodeSeed[], start = todayISO()): TimelineNode[] {
  return seeds.map((s) => ({
    id: uid(),
    title: s.title,
    note: s.note,
    deadline: addDays(start, s.offsetDays),
    done: false,
    statusHint: s.statusHint,
    interviewKind: s.interviewKind ?? null,
  }));
}
