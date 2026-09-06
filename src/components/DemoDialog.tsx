import type { ReactNode } from "react";

export function DemoDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="demo-overlay" role="dialog" aria-labelledby="dialog-title" aria-modal="true">
      <div className="demo-card">
        <h2 id="dialog-title">{title}</h2>
        {children}
        <button className="btn" type="button" onClick={onClose} style={{ marginTop: 8 }}>
          知道了
        </button>
      </div>
    </div>
  );
}
