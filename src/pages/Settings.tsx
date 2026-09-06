import { useStore } from "../lib/store";
import { requestNotifyPermission } from "../lib/notify";

export function SettingsPage() {
  const { state, setSettings, logout } = useStore();
  if (!state) return null;

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0, color: "var(--olive)" }}>设置</h2>
      <p className="muted">当前账号 {state.phone}</p>
      <label className="todo-item">
        <input
          type="checkbox"
          checked={state.settings.notifyEnabled}
          onChange={(e) => {
            setSettings({ notifyEnabled: e.target.checked });
            if (e.target.checked) requestNotifyPermission();
          }}
        />
        <span>开启浏览器截止日期提醒</span>
      </label>
      <button className="btn ghost" type="button" onClick={logout} style={{ marginTop: 16 }}>
        退出登录
      </button>
    </div>
  );
}
