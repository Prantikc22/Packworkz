const noop = () => undefined;

// Node.js has no global `location` — wouter's useSearch() reads it
if (typeof globalThis.location === "undefined") {
  (globalThis as any).location = {
    href: "/",
    pathname: "/",
    search: "",
    hash: "",
    origin: "https://packworkz.com",
    host: "packworkz.com",
    hostname: "packworkz.com",
    protocol: "https:",
    port: "",
    assign: noop,
    replace: noop,
    reload: noop,
  };
}
const fakeStorage = {
  getItem: (_key: string) => null,
  setItem: noop,
  removeItem: noop,
  clear: noop,
  get length() { return 0; },
  key: (_i: number) => null,
};

if (typeof globalThis.localStorage === "undefined") {
  (globalThis as any).localStorage = fakeStorage;
}
if (typeof globalThis.sessionStorage === "undefined") {
  (globalThis as any).sessionStorage = fakeStorage;
}
if (typeof globalThis.requestAnimationFrame === "undefined") {
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 0);
  (globalThis as any).cancelAnimationFrame = clearTimeout;
}
if (typeof globalThis.ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe = noop;
    unobserve = noop;
    disconnect = noop;
  };
}
if (typeof globalThis.IntersectionObserver === "undefined") {
  (globalThis as any).IntersectionObserver = class {
    observe = noop;
    unobserve = noop;
    disconnect = noop;
  };
}
if (typeof globalThis.matchMedia === "undefined") {
  (globalThis as any).matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  });
}
