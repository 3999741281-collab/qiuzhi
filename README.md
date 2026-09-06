# 求职看板

大学生求职申请管理：岗位卡、多渠道投递、时间轴节点、面试状态、简历库、待办与导入。

## 视觉

配色来自你提供的唱片 UI 灵感：

- 强调 `#E24B2A`
- 文字 `#0F1616`
- 完成 / 标题 `#556F59`
- 未完成节点 `#F3EDD1`
- 背景 `#FFFAE4`

未完成节点为米色，点选后绿色延伸到该节点（含之前全部完成）。星标岗位左侧红边 + 白底。

## 本地运行

```bash
npm install
npm run dev
```

登录：11 位手机号，验证码开发期为 `123456`。每个手机号一份本地数据。

## GitHub Pages

使用 Hash 路由（`#/jobs/...`），静态托管即可。构建：

```bash
npm run build
```

把 `dist/` 发布为 Pages。仓库 Pages 来源选 GitHub Actions 或 `/docs`，按你的习惯即可。

## 后续：Supabase

复制 `.env.example` 为 `.env.local`，填 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`，在 Supabase 执行 `supabase/schema.sql`。不要把 service role 放进仓库。

截图识别、关键词搜岗位候选：在「设置」填写你自己的 OpenAI API Key。
