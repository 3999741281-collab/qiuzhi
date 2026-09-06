export type ChannelKind =
  | "boss"
  | "official"
  | "qiancheng"
  | "shixiseng"
  | "maimai"
  | "other";

export type JobType = "intern" | "campus" | "social";

export type FlowStatus =
  | "applied"
  | "screening"
  | "assessment"
  | "interview_1"
  | "interview_2"
  | "interview_3"
  | "hr"
  | "rejected"
  | "offer"
  | "ended";

export type InterviewKind = "tech" | "biz" | "hr";

export type KanbanColumn = "progress" | "interview" | "result";

export interface TimelineNode {
  id: string;
  title: string;
  note: string;
  deadline: string | null;
  done: boolean;
  doneAt?: string;
  statusHint: FlowStatus;
  interviewKind?: InterviewKind | null;
}

export interface Channel {
  id: string;
  kind: ChannelKind;
  customName?: string;
  url: string;
  appliedAt: string;
  nodes: TimelineNode[];
}

export interface Note {
  id: string;
  channelId?: string;
  round: string;
  kind: "feedback" | "reflection";
  content: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  jobId?: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface Resume {
  id: string;
  name: string;
  mime: string;
  dataUrl: string;
  createdAt: string;
}

export interface Job {
  id: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  description: string;
  type: JobType;
  starred: boolean;
  statusOverride: FlowStatus | null;
  resumeId: string | null;
  channels: Channel[];
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  openaiKey: string;
  notifyEnabled: boolean;
}

export interface BoardState {
  phone: string;
  displayName: string;
  jobs: Job[];
  resumes: Resume[];
  todos: Todo[];
  settings: Settings;
  authorizedChannels: ChannelKind[];
}

export const AUTH_CHANNELS: ChannelKind[] = [
  "boss",
  "shixiseng",
  "qiancheng",
  "maimai",
  "official",
];

export const CHANNEL_LABEL: Record<ChannelKind, string> = {
  boss: "Boss 直聘",
  official: "官网",
  qiancheng: "前程无忧",
  shixiseng: "实习僧",
  maimai: "脉脉",
  other: "其他",
};

export const STATUS_LABEL: Record<FlowStatus, string> = {
  applied: "已投递",
  screening: "简历筛选",
  assessment: "测评中",
  interview_1: "一面",
  interview_2: "二面",
  interview_3: "三面",
  hr: "HR 面",
  rejected: "明确拒绝",
  offer: "Offer",
  ended: "已结束",
};

export const INTERVIEW_LABEL: Record<InterviewKind, string> = {
  tech: "技术面",
  biz: "业务面",
  hr: "HR 面",
};

export const JOB_TYPE_LABEL: Record<JobType, string> = {
  intern: "实习",
  campus: "校招",
  social: "社招",
};
