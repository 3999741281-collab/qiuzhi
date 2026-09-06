import { useState } from "react";
import { useStore } from "../lib/store";
import { uid } from "../lib/logic";

export function ResumeAside() {
  const { state, upsertResume, removeResume } = useStore();
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<{ name: string; dataUrl: string; mime: string } | null>(null);
  if (!state) return null;

  return (
    <aside className="panel" data-tour="resume">
      <h2 style={{ marginTop: 0, color: "var(--olive)" }}>简历库</h2>
      <form
        className="row"
        onSubmit={(e) => e.preventDefault()}
        style={{ marginBottom: 12 }}
      >
        <input
          style={{ flex: 1, minWidth: 0 }}
          placeholder="简历名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="btn olive">
          上传
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const dataUrl = await fileToDataUrl(file);
              upsertResume({
                id: uid(),
                name: name.trim() || file.name,
                mime: file.type,
                dataUrl,
                createdAt: new Date().toISOString(),
              });
              setName("");
              e.target.value = "";
            }}
          />
        </label>
      </form>
      {state.resumes.map((r) => (
        <div key={r.id} className="todo-item">
          <span style={{ flex: 1 }}>{r.name}</span>
          <button
            className="btn ghost"
            type="button"
            onClick={() => setPreview({ name: r.name, dataUrl: r.dataUrl, mime: r.mime })}
          >
            预览
          </button>
          <button className="btn ghost" type="button" onClick={() => removeResume(r.id)}>
            删
          </button>
        </div>
      ))}
      {preview && (
        <div className="demo-overlay" role="dialog" aria-modal="true">
          <div className="demo-card" style={{ width: "min(720px, 96vw)", textAlign: "left" }}>
            <h2>{preview.name}</h2>
            {preview.mime.includes("word") || preview.mime.includes("msword") ? (
              <p className="muted">Word 无法在浏览器里预览，请改用 PDF。</p>
            ) : (
              <iframe
                title={preview.name}
                src={preview.dataUrl}
                style={{ width: "100%", height: "60vh", border: "1px solid var(--line)", background: "#fff" }}
              />
            )}
            <button className="btn" type="button" onClick={() => setPreview(null)} style={{ marginTop: 12 }}>
              关闭
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
