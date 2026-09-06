import { useState } from "react";

export function DemoNotice() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="demo-overlay" role="dialog" aria-labelledby="demo-title" aria-modal="true">
      <div className="demo-card">
        <div className="vinyl" style={{ margin: "0 auto 12px" }} />
        <h2 id="demo-title">欢迎</h2>
        <p>这里可以管理投递进度、截止日期和简历。需要空白看板时，可以重置后重新建卡。</p>
        <button className="btn" type="button" onClick={() => setOpen(false)}>
          知道了
        </button>
      </div>
    </div>
  );
}
