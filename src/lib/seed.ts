import type { ChannelKind, Job, JobType, Resume, TimelineNode, Todo } from "../types";
import { addDays, completeThrough, todayISO, uid } from "./logic";
import { DEFAULT_PIPELINE, LIGHT_PIPELINE, buildNodes, type NodeSeed } from "./templates";

function channel(
  kind: ChannelKind,
  seeds: NodeSeed[],
  doneThrough: number,
  startOffset: number,
  url = "",
): Job["channels"][0] {
  const start = addDays(todayISO(), startOffset);
  let nodes: TimelineNode[] = buildNodes(seeds, start);
  if (doneThrough >= 0) nodes = completeThrough(nodes, doneThrough);
  return {
    id: uid(),
    kind,
    url,
    appliedAt: `${start}T10:00:00.000Z`,
    nodes,
  };
}

function job(partial: {
  company: string;
  title: string;
  location: string;
  salary: string;
  description: string;
  type: JobType;
  starred?: boolean;
  resumeId?: string | null;
  channels: Job["channels"];
  notes?: Job["notes"];
}): Job {
  const now = new Date().toISOString();
  return {
    id: uid(),
    statusOverride: null,
    resumeId: null,
    notes: [],
    starred: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function demoResumes(): Resume[] {
  const stub = "data:text/plain;charset=utf-8," + encodeURIComponent("简历预览");
  const t = new Date().toISOString();
  return [
    { id: uid(), name: "产品实习-偏用户研究", mime: "application/pdf", dataUrl: stub, createdAt: t },
    { id: uid(), name: "校招-前端开发", mime: "application/pdf", dataUrl: stub, createdAt: t },
    { id: uid(), name: "运营实习-社区方向", mime: "application/pdf", dataUrl: stub, createdAt: t },
  ];
}

export function demoJobs(resumes: Resume[] = []): Job[] {
  const [pm, fe, ops] = resumes;
  return [
    job({
      company: "字节跳动",
      title: "产品经理实习",
      location: "北京 · 海淀",
      salary: "300-400/天",
      description: "负责抖音生活服务增长实验，拆解指标、写 PRD、跟进上线。",
      type: "intern",
      starred: true,
      resumeId: pm?.id ?? null,
      channels: [
        channel("boss", DEFAULT_PIPELINE, 6, -12, "https://www.zhipin.com/"),
        channel("official", LIGHT_PIPELINE, 2, -10, "https://jobs.bytedance.com/"),
      ],
      notes: [
        {
          id: uid(),
          round: "一面",
          kind: "reflection",
          content: "指标拆得还行，对供给侧不熟，下次先补本地生活案例。",
          createdAt: new Date().toISOString(),
        },
      ],
    }),
    job({
      company: "腾讯",
      title: "用户研究实习",
      location: "深圳 · 南山",
      salary: "250-350/天",
      description: "微信生态访谈、问卷与可用性测试，输出洞察报告。",
      type: "intern",
      starred: true,
      resumeId: pm?.id ?? null,
      channels: [channel("official", DEFAULT_PIPELINE, 2, -3)],
    }),
    job({
      company: "阿里巴巴",
      title: "策略产品实习",
      location: "杭州 · 余杭",
      salary: "280-380/天",
      description: "淘宝搜推策略，实验设计与复盘。",
      type: "intern",
      channels: [channel("qiancheng", LIGHT_PIPELINE, 1, -8)],
    }),
    job({
      company: "美团",
      title: "商业分析实习",
      location: "北京 · 朝阳",
      salary: "250-320/天",
      description: "到店供给分析，SQL + 看板，协助业务周会。",
      type: "intern",
      channels: [channel("shixiseng", DEFAULT_PIPELINE, 4, -10)],
    }),
    job({
      company: "小红书",
      title: "社区运营实习",
      location: "上海 · 黄浦",
      salary: "200-280/天",
      description: "笔记生态运营，选题与创作者沟通。",
      type: "intern",
      resumeId: ops?.id ?? null,
      channels: [channel("maimai", LIGHT_PIPELINE, 0, -4)],
    }),
    job({
      company: "网易",
      title: "游戏策划实习",
      location: "杭州 · 滨江",
      salary: "220-300/天",
      description: "玩法案、数值表、对局体验记录。",
      type: "intern",
      channels: [channel("boss", LIGHT_PIPELINE, 3, -20)],
    }),
    job({
      company: "华为",
      title: "终端软件开发（校招）",
      location: "东莞 · 松山湖",
      salary: "18-25k",
      description: "HarmonyOS 应用层开发，参与特性交付。",
      type: "campus",
      resumeId: fe?.id ?? null,
      channels: [channel("official", DEFAULT_PIPELINE, 5, -6)],
    }),
    job({
      company: "米哈游",
      title: "UI 设计实习",
      location: "上海 · 徐汇",
      salary: "300-450/天",
      description: "活动页与角色相关视觉，跟进切图规范。",
      type: "intern",
      starred: true,
      channels: [channel("official", LIGHT_PIPELINE, 4, -30)],
    }),
    job({
      company: "快手",
      title: "数据产品实习",
      location: "北京 · 海淀",
      salary: "250-350/天",
      description: "直播中台指标口径与自助取数。",
      type: "intern",
      channels: [channel("boss", DEFAULT_PIPELINE, 1, -4)],
    }),
    job({
      company: "理想汽车",
      title: "车载交互设计实习",
      location: "北京 · 亦庄",
      salary: "280-400/天",
      description: "座舱信息架构与任务流，实车走查。",
      type: "intern",
      channels: [channel("other", LIGHT_PIPELINE, 0, -15)],
    }),
  ];
}

export function demoTodos(jobs: Job[]): Todo[] {
  const bytedance = jobs[0];
  const meituan = jobs[3];
  const xhs = jobs[4];
  return [
    {
      id: uid(),
      jobId: meituan?.id,
      text: "今晚 12 点前做完美团性格测评",
      done: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      jobId: xhs?.id,
      text: "更新小红书岗位那一版运营向简历",
      done: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      jobId: bytedance?.id,
      text: "整理一面反馈，准备二面作品集",
      done: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function seedBoard(phone: string) {
  const resumes = demoResumes();
  const jobs = demoJobs(resumes);
  return {
    phone,
    displayName: "",
    jobs,
    resumes,
    todos: demoTodos(jobs),
    settings: { openaiKey: "", notifyEnabled: true },
    authorizedChannels: [],
  };
}
