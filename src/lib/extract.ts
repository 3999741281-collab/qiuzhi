export interface ExtractedJob {
  company: string;
  title: string;
  location: string;
  salary: string;
  description: string;
}

const empty: ExtractedJob = {
  company: "",
  title: "",
  location: "",
  salary: "",
  description: "",
};

export function parseJobText(text: string): ExtractedJob {
  const t = text.replace(/\r/g, "").trim();
  if (!t) return empty;

  const salary =
    t.match(/(\d{1,3}\s*[-~—至到]\s*\d{1,3}\s*[kK千]|薪资[:：]?\s*[^\n]{2,20}|月薪[:：]?\s*[^\n]{2,20})/)?.[0] ??
    "";
  const location =
    t.match(/(地点|办公地点|工作地点|城市)[:：]\s*([^\n]{2,20})/)?.[2] ??
    t.match(/(北京|上海|深圳|广州|杭州|成都|南京|武汉|苏州|西安|长沙|重庆)[^\n,]{0,12}/)?.[0] ??
    "";
  const company =
    t.match(/(公司|企业)[:：]\s*([^\n]{2,30})/)?.[2] ??
    t.split("\n").find((l) => l.length >= 2 && l.length <= 20 && !l.includes("http")) ??
    "";
  const title =
    t.match(/(职位|岗位|招聘)[:：]\s*([^\n]{2,40})/)?.[2] ?? "";

  return {
    company: company.trim(),
    title: title.trim(),
    location: location.trim(),
    salary: salary.trim(),
    description: t.slice(0, 4000),
  };
}

export function parseCsv(text: string): ExtractedJob[] {
  const lines = text.trim().split(/\n+/);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = (aliases: string[]) => header.findIndex((h) => aliases.some((a) => h.includes(a)));
  const c = idx(["company", "公司"]);
  const title = idx(["title", "岗位", "职位"]);
  const loc = idx(["location", "地点"]);
  const salary = idx(["salary", "薪酬", "薪资"]);
  const desc = idx(["description", "职责", "jd"]);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    return {
      company: cols[c] ?? "",
      title: cols[title] ?? "",
      location: cols[loc] ?? "",
      salary: cols[salary] ?? "",
      description: cols[desc] ?? "",
    };
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (const ch of line) {
    if (ch === '"') {
      q = !q;
      continue;
    }
    if (ch === "," && !q) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

export async function extractFromImage(
  dataUrl: string,
  apiKey: string,
): Promise<ExtractedJob> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "从招聘截图提取 JSON：company,title,location,salary,description。没有的字段用空字符串。description 为岗位职责摘要。",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "提取岗位信息" },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`识别失败：${res.status}`);
  }
  const json = await res.json();
  const raw = JSON.parse(json.choices[0].message.content as string);
  return {
    company: String(raw.company ?? ""),
    title: String(raw.title ?? ""),
    location: String(raw.location ?? ""),
    salary: String(raw.salary ?? ""),
    description: String(raw.description ?? ""),
  };
}

export async function fetchUrlText(url: string): Promise<string> {
  const target = `https://r.jina.ai/${url}`;
  const res = await fetch(target);
  if (!res.ok) throw new Error("链接抓取失败，请改粘贴职位描述");
  return res.text();
}

export async function searchJobs(query: string, apiKey: string): Promise<ExtractedJob[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            '根据公司与岗位名，给出最多 4 条可能的校招/实习岗位候选。JSON: {"items":[{company,title,location,salary,description}]}。不确定就标「待确认」，不要编造具体薪资数字。',
        },
        { role: "user", content: query },
      ],
    }),
  });
  if (!res.ok) throw new Error(`搜索失败：${res.status}`);
  const json = await res.json();
  const raw = JSON.parse(json.choices[0].message.content as string);
  const items = Array.isArray(raw.items) ? raw.items : [];
  return items.map((it: Record<string, string>) => ({
    company: String(it.company ?? ""),
    title: String(it.title ?? ""),
    location: String(it.location ?? ""),
    salary: String(it.salary ?? ""),
    description: String(it.description ?? ""),
  }));
}
