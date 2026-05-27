---
name: Animation system
description: CSS animation classes + JS observer wiring for the Packworkz frontend.
---

# Animation System

## CSS classes (index.css keyframes + utilities)
- `pw-reveal` — starts hidden (opacity 0, translateY 24px); becomes visible when `.pw-in` is added
- `pw-in` — added by IntersectionObserver in main.tsx to trigger fade-up
- `pw-d1` through `pw-d6` — stagger delays (60ms, 110ms, 180ms, 260ms, 330ms, 410ms)
- `pw-lift` — hover: translateY(-6px) + shadow elevation
- `pw-glow-drift` / `pw-glow-drift-slow` — 20s/28s background blob drift
- `pw-btn-transition` — hover lift for CTA buttons
- `pwFadeUp`, `pwSlowDrift`, `pwFadeIn` — keyframe definitions

## JS wiring (main.tsx)
- Global `IntersectionObserver` watches `.pw-reveal` elements, adds `.pw-in` at threshold 0.12
- `MutationObserver` watches for newly added `.pw-reveal` nodes and observes them too

**Why:** Centralised so every page gets scroll-reveal for free. Pages just need to add `pw-reveal` (+ optional `pw-d*` stagger) to elements — no per-page JS needed.
