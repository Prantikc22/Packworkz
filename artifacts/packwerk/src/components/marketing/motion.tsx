import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Fires once when the element scrolls into view. */
export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, threshold]);
  return [ref, inView] as const;
}

/** Animated number that counts up once visible. Non-numeric parts ("+", "%", "×") are preserved. */
export function CountUp({ value, duration = 1600 }: { value: string; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  const match = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, "")) : NaN;
  const decimals = match?.[2].includes(".") ? match[2].split(".")[1].length : 0;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || !match || Number.isNaN(target) || prefersReducedMotion()) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = (target * eased).toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      setDisplay(`${match[1]}${current}${match[3]}`);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return <span ref={ref} className="pw-p-count">{display}</span>;
}

/** Infinite horizontal marquee. Content is duplicated so the loop is seamless. */
export function Marquee({ children, speed = 38, reverse = false, className = "" }: { children: ReactNode; speed?: number; reverse?: boolean; className?: string }) {
  return (
    <div className={`pw-p-marquee ${className}`} style={{ "--pw-marquee-speed": `${speed}s` } as CSSProperties}>
      <div className={`pw-p-marquee-track${reverse ? " is-reverse" : ""}`}>
        <div className="pw-p-marquee-group">{children}</div>
        <div className="pw-p-marquee-group" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

/**
 * Headline whose lines rise into place on load (pure CSS, so it also animates
 * in prerendered HTML before hydration). Prefix a line with "*" to wrap it in <em>.
 */
export function SplitHeadline({ lines, as: Tag = "h1", id, className = "" }: { lines: string[]; as?: "h1" | "h2"; id?: string; className?: string }) {
  return (
    <Tag id={id} className={`pw-p-split ${className}`}>
      {lines.map((line, index) => {
        const emphasised = line.startsWith("*");
        const text = emphasised ? line.slice(1) : line;
        return (
          <span className="pw-p-split-line" key={line} style={{ "--pw-line": index } as CSSProperties}>
            <span>{emphasised ? <em>{text}</em> : text}</span>
          </span>
        );
      })}
    </Tag>
  );
}

/** Card that tracks the pointer to paint a soft spotlight via CSS variables. */
export function SpotlightCard({ children, className = "", as: Tag = "article", style }: { children: ReactNode; className?: string; as?: "article" | "div"; style?: CSSProperties }) {
  const onMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pw-mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--pw-my", `${event.clientY - rect.top}px`);
  };
  return <Tag className={`pw-p-spotlight ${className}`} onPointerMove={onMove} style={style}>{children}</Tag>;
}

/** Vertical rail that fills as its container scrolls through the viewport. */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = rect.height + viewport * 0.4;
      const passed = viewport * 0.7 - rect.top;
      setProgress(Math.max(0, Math.min(1, passed / total)));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return [ref, progress] as const;
}
