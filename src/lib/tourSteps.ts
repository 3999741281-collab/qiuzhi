export type TourStep = {
  id: string;
  selector: string;
  title: string;
  body: string;
  route: "home" | "job" | "mine";
  homeView?: "list" | "must";
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "quote",
    selector: "[data-tour='quote']",
    route: "home",
    homeView: "list",
    title: "放轻松",
    body: "放轻松，你会有灿烂的未来的。这句话每天换一句，只是轻轻待在标题旁边。",
  },
  {
    id: "auth",
    selector: "[data-tour='auth']",
    route: "home",
    homeView: "list",
    title: "授权登录",
    body: "在这里选择 Boss、实习僧、前程无忧、脉脉等，跳转授权后即可同步该渠道。已授权的选项颜色会不一样。",
  },
  {
    id: "views",
    selector: "[data-tour='views']",
    route: "home",
    homeView: "list",
    title: "列表和今日必做",
    body: "左边一组：列表看全部岗位，今日必做只看两天内要赶的事。点中的框会加上黑边。",
  },
  {
    id: "sort",
    selector: "[data-tour='sort']",
    route: "home",
    homeView: "list",
    title: "怎么排序",
    body: "岗位多了，可以按最新投递、即将截止、或星标优先来排。",
  },
  {
    id: "new",
    selector: "[data-tour='new']",
    route: "home",
    homeView: "list",
    title: "新建岗位",
    body: "自己加一张卡：公司、岗位、投递渠道和流程模板，之后都能改。",
  },
  {
    id: "shot",
    selector: "[data-tour='shot']",
    route: "home",
    homeView: "list",
    title: "截图导入",
    body: "招聘页截一张图丢进来，会抽出地点、薪酬和职责，确认后再写入。",
  },
  {
    id: "must",
    selector: "[data-tour='must']",
    route: "home",
    homeView: "must",
    title: "打勾就做完",
    body: "左边方框点一下：截止任务会推进时间轴，自己加的待办也会勾掉。",
  },
  {
    id: "resume",
    selector: "[data-tour='resume']",
    route: "home",
    homeView: "must",
    title: "简历库",
    body: "不同岗位可以绑不同版本。预览在这里看，不用另开一页。",
  },
  {
    id: "job",
    selector: "[data-tour='job-head']",
    route: "job",
    title: "岗位详情",
    body: "点进一张岗位，看地点、薪酬、职责和现在走到哪一轮。",
  },
  {
    id: "timeline",
    selector: "[data-tour='timeline']",
    route: "job",
    title: "时间轴",
    body: "点圆点：完成到这里，绿轴会跟上。点名称或截止日期：改截止、加节点或删除。",
  },
  {
    id: "stats",
    selector: "[data-tour='mine-stats']",
    route: "mine",
    title: "投递和面试",
    body: "数字按你真正完成的节点来算：投了几次、面了几轮，不是凭空焦虑。",
  },
  {
    id: "logout",
    selector: "[data-tour='mine-logout']",
    route: "mine",
    title: "退出",
    body: "退出在最底下。累了可以先离开，再进来还是这个账号。",
  },
];
