const LINES = [
  "HR 已读不回，也可能只是去吃饭了。",
  "测评全选「完全符合」，人格比岗位还整齐。",
  "简历第 12 版改完，第 1 版其实已经能看。",
  "「你还有什么想问的」——周末双休是合法问题。",
  "投递像扔漂流瓶。海里很挤，盖子拧紧。",
  "被拒不等于你差，有时只是内推名额用完了。",
  "AI 面试官没有表情，你也不用一直赔笑。",
  "截止日期是真的，焦虑可以分期。",
  "今天没消息，不代表宇宙针对你。",
  "Offer 没来之前，先把晚饭吃了。",
];

export function dailyLine(date = new Date()): string {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const day = Math.round((now - start) / 86400000);
  return LINES[day % LINES.length];
}
