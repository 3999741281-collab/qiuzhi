import { useLayoutEffect, useState, type CSSProperties } from "react";
import { useTour } from "../lib/tour";

type Box = { top: number; left: number; width: number; height: number };

export function TourOverlay() {
  const { active, index, total, step, next } = useTour();
  const [box, setBox] = useState<Box | null>(null);

  useLayoutEffect(() => {
    if (!active || !step) {
      setBox(null);
      return;
    }
    let cancelled = false;
    const measure = () => {
      const el = document.querySelector(step.selector);
      if (!el) return false;
      el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      const r = el.getBoundingClientRect();
      const pad = 8;
      setBox({
        top: r.top - pad,
        left: r.left - pad,
        width: r.width + pad * 2,
        height: r.height + pad * 2,
      });
      return true;
    };
    const tick = () => {
      if (cancelled) return;
      if (!measure()) requestAnimationFrame(tick);
    };
    const t0 = window.setTimeout(tick, 50);
    const t1 = window.setTimeout(tick, 200);
    tick();
    const onWin = () => measure();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      cancelled = true;
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [active, step, index]);

  if (!active || !step) return null;

  const tipStyle = tipPosition(box);

  return (
    <div className="tour-root">
      <div className="tour-dim" style={dimStyle(box, "top")} />
      <div className="tour-dim" style={dimStyle(box, "left")} />
      <div className="tour-dim" style={dimStyle(box, "right")} />
      <div className="tour-dim" style={dimStyle(box, "bottom")} />
      {box && <div className="tour-hole" style={{ top: box.top, left: box.left, width: box.width, height: box.height }} />}
      <div className="tour-glass" style={tipStyle}>
        <p className="tour-count">
          {index + 1}/{total}
        </p>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
        <button className="btn" type="button" onClick={next}>
          知道了
        </button>
      </div>
    </div>
  );
}

function dimStyle(box: Box | null, side: "top" | "left" | "right" | "bottom"): CSSProperties {
  if (!box) return { inset: 0 };
  if (side === "top") return { top: 0, left: 0, right: 0, height: Math.max(0, box.top) };
  if (side === "left") {
    return { top: box.top, left: 0, width: Math.max(0, box.left), height: box.height };
  }
  if (side === "right") {
    return {
      top: box.top,
      left: box.left + box.width,
      right: 0,
      height: box.height,
    };
  }
  return { top: box.top + box.height, left: 0, right: 0, bottom: 0 };
}

function tipPosition(box: Box | null): CSSProperties {
  if (!box) return { top: "30%", left: "50%", transform: "translateX(-50%)" };
  const below = box.top + box.height + 16;
  const spaceBelow = window.innerHeight - below;
  const top = spaceBelow > 180 ? below : Math.max(16, box.top - 170);
  let left = box.left;
  const width = 320;
  if (left + width > window.innerWidth - 16) left = window.innerWidth - width - 16;
  if (left < 16) left = 16;
  return { top, left };
}
