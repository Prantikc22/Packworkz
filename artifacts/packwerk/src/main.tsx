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
  document.querySelectorAll(".pw-reveal:not(.pw-in), .pw-fadein:not(.pw-in)").forEach((el) => {
    revealObserver.observe(el);
  });
}

// Re-scan whenever React adds new DOM nodes (route changes etc.)
const domObserver = new MutationObserver(scanRevealElements);
domObserver.observe(document.body, { childList: true, subtree: true });
setTimeout(scanRevealElements, 50);

createRoot(document.getElementById("root")!).render(<App />);
