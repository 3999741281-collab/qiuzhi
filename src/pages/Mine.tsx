import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { CHANNEL_LABEL } from "../types";
import { countApplications, countInterviews, jobFunnel, todayMustDos } from "../lib/logic";

export function MinePage() {
  const { state, logout } = useStore();
  if (!state) return null;

  const applied = countApplications(state.jobs);
  const interviews = countInterviews(state.jobs);
  const funnel = jobFunnel(state.jobs);
  const must = todayMustDos(state.jobs);
  const authed = state.authorizedChannels;

  const ratio = applied === 0 ? 0 : Math.round((interviews / applied) * 100);
  const analysis =
    applied === 0
      ? "还没投。海是空的，漂流瓶也是空的。"
      : `你已经完成 ${applied} 次投递，坐到面试桌前 ${interviews} 次（约 ${ratio}%）。进行中 ${funnel.progress} 个，面试中 ${funnel.interview} 个，有结果 ${funnel.result} 个。${must.length ? `还有 ${must.length} 件两天内要交的，HR 的日历比你的更硬。` : "这两天没有卡点，适合发呆或改一版简历。"}`;

  return (
    <div className="panel mine-page">
      <h2 style={{ marginTop: 0, color: "var(--olive)" }}>我的</h2>
      <p className="mine-name">{state.displayName || "同学"}</p>
      <p className="muted">授权手机号 {state.phone}</p>

      <h3>已授权渠道</h3>
      {authed.length === 0 ? (
        <p className="muted">还没有授权。去首页点「授权登录」，选择 Boss、实习僧等渠道即可。</p>
      ) : (
        <p>
          {authed.map((k) => (
            <span key={k} className="chip olive" style={{ marginRight: 6 }}>
              {CHANNEL_LABEL[k]}
            </span>
          ))}
        </p>
      )}

      <div className="mine-stats" data-tour="mine-stats">
        <div>
          <b>{applied}</b>
          <span>投递次数</span>
          <small className="muted">已完成的投递节点</small>
        </div>
        <div>
          <b>{interviews}</b>
          <span>面试次数</span>
          <small className="muted">已完成的一面/二面/HR 节点</small>
        </div>
        <div>
          <b>{state.jobs.length}</b>
          <span>岗位卡</span>
        </div>
      </div>

      <h3>大概分析</h3>
      <p style={{ lineHeight: 1.7 }}>{analysis}</p>

      <div style={{ marginTop: 36 }}>
        <Link to="/settings" className="muted">
          设置
        </Link>
      </div>
      <button className="btn ghost" type="button" data-tour="mine-logout" onClick={logout} style={{ marginTop: 24 }}>
        退出
      </button>
    </div>
  );
}
