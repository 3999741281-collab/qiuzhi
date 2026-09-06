import { useState } from "react";
import { useStore } from "../lib/store";

export function LoginPage() {
  const { login } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  return (
    <div className="login-wrap">
      <form
        className="login-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr("");
          try {
            if (!sent) {
              setSent(true);
              return;
            }
            await login(phone, otp, name);
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "登录失败");
          }
        }}
      >
        <div className="vinyl" style={{ margin: "0 auto" }} />
        <h1>求职看板</h1>
        <p className="sub">把投递、测评和面试排进一张唱片轴</p>
        <label className="field" style={{ textAlign: "left" }}>
          <span>称呼</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="怎么称呼你" required />
        </label>
        <label className="field" style={{ textAlign: "left" }}>
          <span>手机号</span>
          <input
            inputMode="numeric"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="11 位手机号"
            required
          />
        </label>
        {sent && (
          <label className="field" style={{ textAlign: "left" }}>
            <span>验证码</span>
            <input
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </label>
        )}
        {err && <p className="err">{err}</p>}
        <button className="play" type="submit" aria-label="登录">
          ▶
        </button>
      </form>
    </div>
  );
}
