import { Search, Activity, ShieldCheck, Package, MapPin } from "lucide-react";

const NODES = [
  { icon: Search, name: "SmartMatch", desc: "AI picks the right factory for your SKU" },
  { icon: Activity, name: "Production Track", desc: "Live milestones from factory floor" },
  { icon: ShieldCheck, name: "QC Engine", desc: "Photo evidence at every checkpoint" },
  { icon: Package, name: "SmartStock", desc: "Pre-positioned inventory near you" },
  { icon: MapPin, name: "LogiTrack", desc: "Real-time from dispatch to delivery" },
];

const STATS = [
  { val: "48 hrs", cap: "SmartStock SKU delivery" },
  { val: "100%", cap: "QC inspected before dispatch" },
  { val: "₹0", cap: "Hidden charges. Ever." },
];

export default function PackOSSection() {
  return (
    <section className="py-24 px-8 md:px-20 text-center" style={{ background: "#0D1B2A" }}>
      <div className="max-w-7xl mx-auto">
        <p className="font-bold tracking-[0.25em] text-xs uppercase mb-5" style={{ color: "#1B6CA8" }}>
          POWERED BY PACKOS
        </p>
        <h2 className="clash-display text-white mb-4" style={{ fontSize: "clamp(2rem,4vw,3.25rem)", lineHeight: 1.1 }}>
          The operating system<br />for your packaging.
        </h2>
        <p className="mx-auto mb-16" style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, maxWidth: 500 }}>
          PackOS runs every order — from factory matching to your door.
        </p>

        {/* 5-node horizontal flow */}
        <div className="flex items-center justify-center max-w-[900px] mx-auto mb-16 overflow-x-auto">
          {NODES.map((node, i) => {
            const Icon = node.icon;
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center" style={{ minWidth: 100 }}>
                  <div style={{
                    width: 60, height: 60,
                    borderRadius: "50%",
                    background: "#1B6CA8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={22} color="white" />
                  </div>
                  <p className="font-bold text-white mt-2" style={{ fontSize: 13, textAlign: "center" }}>{node.name}</p>
                  <p className="mt-1" style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, textAlign: "center", maxWidth: 100, lineHeight: 1.4 }}>{node.desc}</p>
                </div>
                {i < NODES.length - 1 && (
                  <div className="flow-connector relative mx-2" style={{ height: 2, flex: 1, minWidth: 40, background: "linear-gradient(90deg, #1B6CA8, #E8A838)", overflow: "hidden" }}>
                    <div className="flow-dot" style={{ animationDelay: `${i * 0.4}s` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stat callouts */}
        <div className="flex flex-col sm:flex-row justify-center gap-16">
          {STATS.map((s) => (
            <div key={s.val} className="text-center">
              <p className="clash-display" style={{ color: "#E8A838", fontSize: 48 }}>{s.val}</p>
              <p className="font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>{s.cap}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
