import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Wire the stored access token into every generated API hook request
setAuthTokenGetter(() => localStorage.getItem("packwerk_access_token"));

// ── Global scroll-reveal IntersectionObserver ──────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("pw-in");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -36px 0px" }
);

function scanRevealElements() {
  const animatedGroups = [
    ".pw-home .pw-starter-heading",
    ".pw-home .pw-starter-card",
    ".pw-home .pw-family-directory",
    ".pw-home .pw-sector-copy > *",
    ".pw-home .pw-sector-solution",
    ".pw-home .pw-home-smartstock-demo .smartstock-demo-copy",
    ".pw-home .pw-home-smartstock-demo .smartstock-demo-shell",
    ".pw-home .pw-proof-metrics > div",
    ".pw-home .pw-testimonial-card",
    ".pw-home .pw-proof-logo",
    ".pw-home .pw-advantage-feature",
    ".pw-home .pw-sustainability-card",
    ".pw-home .pw-final-cta-content > *",
    ".pw-sample-page section > div > h2",
    ".pw-sample-page article",
  ].join(",");

  document.querySelectorAll<HTMLElement>(animatedGroups).forEach((el, index) => {
    if (el.classList.contains("scroll-animate") || el.classList.contains("pw-reveal")) return;
    el.classList.add("pw-reveal");
    el.style.setProperty("--pw-delay", `${(index % 4) * 70}ms`);
  });

  document.querySelectorAll(".pw-reveal:not(.pw-in), .pw-fadein:not(.pw-in)").forEach((el) => {
    revealObserver.observe(el);
  });
}

// Re-scan whenever React adds new DOM nodes (route changes etc.)
const domObserver = new MutationObserver(scanRevealElements);
domObserver.observe(document.body, { childList: true, subtree: true });
setTimeout(scanRevealElements, 50);

createRoot(document.getElementById("root")!).render(<App />);
