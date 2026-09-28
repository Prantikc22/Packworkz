import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

/**
 * A printed mailer that folds from a flat dieline into a closed box as the
 * section scrolls through the viewport. Pure CSS 3D — no WebGL on the homepage.
 */
function useFoldProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the box enters the bottom of the screen, 1 once it reaches the upper third.
      setProgress(clamp((vh * 0.9 - rect.top) / (vh * 0.85)));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return [ref, progress] as const;
}

export function FoldingBox() {
  const [ref, progress] = useFoldProgress();
  // Stage the fold: walls first, then the lid, then a slow turn to show it off.
  const walls = ease(clamp((progress - 0.1) / 0.5));
  const lid = ease(clamp((progress - 0.58) / 0.27));
  const turn = ease(clamp((progress - 0.6) / 0.4));
  const stage = progress < 0.2 ? "Flat dieline" : progress < 0.72 ? "Folding" : "Ready to ship";

  const style = {
    "--walls": walls,
    "--lid": lid,
    "--turn": turn,
  } as CSSProperties;

  return (
    <div className="pw-fold" ref={ref} aria-label="A custom mailer box folding from a flat dieline into a finished box">
      <div className="pw-fold-stage" style={style}>
        <div className="pw-fold-box">
          <div className="pw-fold-face is-base" />
          <div className="pw-fold-face is-front"><b>NOVA PANTRY</b><small>Good things inside.</small></div>
          <div className="pw-fold-face is-left" />
          <div className="pw-fold-face is-right" />
          <div className="pw-fold-face is-back">
            <div className="pw-fold-face is-lid"><span className="pw-fold-mark" /><b>NOVA</b></div>
          </div>
        </div>
        <div className="pw-fold-shadow" />
      </div>
      <div className="pw-fold-caption">
        <span className={progress < 0.2 ? "is-active" : ""}>01 · Dieline</span>
        <span className={progress >= 0.2 && progress < 0.72 ? "is-active" : ""}>02 · Proof & print</span>
        <span className={progress >= 0.72 ? "is-active" : ""}>03 · Delivered</span>
      </div>
      <p className="pw-fold-stage-label">{stage}</p>
    </div>
  );
}
