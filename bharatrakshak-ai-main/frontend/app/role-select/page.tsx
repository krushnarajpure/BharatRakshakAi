"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Siren,
  Satellite,
  Radio,
  AlertTriangle,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const TICKER = [
  "CYCLONE WARNING · Category 3 — Odisha coastline · ETA 6 hours · Evacuation underway",
  "FLOOD ALERT · Brahmaputra Basin breach · Level RED · 12 districts affected",
  "NDRF MOBILISATION · 12 battalions deployed — Assam, Odisha, Tamil Nadu",
  "ACTIVE SOS · 246 distress signals received · SDRF coordinating response",
  "IMD BULLETIN · Extreme rainfall predicted — Northeast India next 48 hrs",
  "LANDSLIDE WATCH · Sikkim district 4 · High-risk zones sealed",
];

const ROLES = [
  {
    id: "citizen",
    path: "/login?role=citizen",
    label: "Citizen",
    sublabel: "Emergency Access",
    icon: Users,
    description:
      "Request immediate rescue, locate nearby shelters, and receive AI-guided safety instructions during active disasters.",
    status: "Public Access",
    pulse: "bg-blue-400",
    accent: "blue",
    border: "border-blue-500/40 hover:border-blue-400/70",
    glow: "rgba(59,130,246,0.12)",
    badge: "bg-blue-500/15 text-blue-300 border border-blue-500/25",
    icon_bg: "bg-blue-500/10 border-blue-500/30",
    icon_color: "text-blue-400",
    enter: "text-blue-400",
    bg_hover: "from-blue-950/30 via-transparent to-transparent",
  },
  {
    id: "responder",
    path: "/login?role=responder",
    label: "Responder",
    sublabel: "Field Operations",
    icon: Siren,
    description:
      "Access mission briefings, coordinate with ground teams, manage rescue logistics, and relay real-time field intelligence.",
    status: "Operational",
    pulse: "bg-orange-400",
    accent: "orange",
    border: "border-orange-500/40 hover:border-orange-400/70",
    glow: "rgba(249,115,22,0.12)",
    badge: "bg-orange-500/15 text-orange-300 border border-orange-500/25",
    icon_bg: "bg-orange-500/10 border-orange-500/30",
    icon_color: "text-orange-400",
    enter: "text-orange-400",
    bg_hover: "from-orange-950/30 via-transparent to-transparent",
  },
  {
    id: "admin",
    path: "/login?role=authority",
    label: "Authority",
    sublabel: "Command Level",
    icon: Shield,
    description:
      "Monitor national disaster landscape, allocate strategic resources, issue emergency broadcasts, and direct state-level response.",
    status: "Restricted",
    pulse: "bg-cyan-400",
    accent: "cyan",
    border: "border-cyan-500/40 hover:border-cyan-400/70",
    glow: "rgba(34,211,238,0.12)",
    badge: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25",
    icon_bg: "bg-cyan-500/10 border-cyan-500/30",
    icon_color: "text-cyan-400",
    enter: "text-cyan-400",
    bg_hover: "from-cyan-950/30 via-transparent to-transparent",
  },
] as const;

// Approximate positions of Indian cities/regions (as % of viewport)
const INCIDENT_NODES = [
  { x: 62, y: 27, sev: "critical" },  // Assam
  { x: 71, y: 40, sev: "critical" },  // Odisha
  { x: 35, y: 28, sev: "high" },      // Rajasthan
  { x: 74, y: 52, sev: "high" },      // Andhra
  { x: 55, y: 44, sev: "moderate" },  // MP
  { x: 46, y: 34, sev: "moderate" },  // Gujarat
  { x: 80, y: 34, sev: "high" },      // West Bengal
  { x: 29, y: 48, sev: "low" },       // Maharashtra
  { x: 62, y: 60, sev: "moderate" },  // Tamil Nadu
  { x: 49, y: 22, sev: "high" },      // Punjab
  { x: 20, y: 35, sev: "critical" },  // Jaisalmer
  { x: 68, y: 68, sev: "moderate" },  // Kerala
];

const SEV_COLOR: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  moderate: "#eab308",
  low: "#22c55e",
};

const TELEMETRY = [
  { label: "Active Incidents", value: "18", color: "text-red-400" },
  { label: "SOS Signals", value: "246", color: "text-orange-400" },
  { label: "Teams Deployed", value: "58", color: "text-cyan-400" },
  { label: "States on Alert", value: "12", color: "text-yellow-400" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [tickerIdx, setTickerIdx] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    const id = setInterval(
      () => setTickerIdx((i) => (i + 1) % TICKER.length),
      3500
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03050a] text-white">
      <style>{`
        @keyframes grid-breathe {
          0%,100% { opacity:0.025; }
          50%      { opacity:0.055; }
        }
        @keyframes scan {
          0%   { transform:translateY(-2px); opacity:0; }
          5%   { opacity:1; }
          95%  { opacity:1; }
          100% { transform:translateY(100vh); opacity:0; }
        }
        @keyframes node-ping {
          0%   { transform:scale(1); opacity:0.9; }
          100% { transform:scale(3); opacity:0; }
        }
        @keyframes ticker-slide {
          0%   { opacity:0; transform:translateY(8px); }
          8%   { opacity:1; transform:translateY(0); }
          92%  { opacity:1; transform:translateY(0); }
          100% { opacity:0; transform:translateY(-8px); }
        }
        @keyframes card-enter {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .grid-bg { animation: grid-breathe 5s ease-in-out infinite; }
        .scan-line { animation: scan 6s linear infinite; }
        .node-ring { animation: node-ping 2.5s ease-out infinite; }
        .node-ring-2 { animation: node-ping 2.5s ease-out 0.6s infinite; }
        .ticker-anim { animation: ticker-slide 3.5s ease-in-out; }
        .card-0 { animation: card-enter 0.6s ease both; }
        .card-1 { animation: card-enter 0.6s ease 0.1s both; }
        .card-2 { animation: card-enter 0.6s ease 0.2s both; }
      `}</style>

      {/* Grid background */}
      <div
        className="grid-bg pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,.8) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.03,
        }}
      />

      {/* Scan line */}
      <div className="scan-line pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

      {/* Incident nodes */}
      <div className="pointer-events-none absolute inset-0">
        {INCIDENT_NODES.map((n, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div className="relative flex items-center justify-center">
              <div
                className="node-ring absolute h-5 w-5 rounded-full"
                style={{ backgroundColor: SEV_COLOR[n.sev], opacity: 0.35 }}
              />
              <div
                className="node-ring-2 absolute h-5 w-5 rounded-full"
                style={{ backgroundColor: SEV_COLOR[n.sev], opacity: 0.2 }}
              />
              <div
                className="relative h-2 w-2 rounded-full"
                style={{ backgroundColor: SEV_COLOR[n.sev] }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/50 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Satellite className="h-4 w-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold tracking-[0.25em] text-cyan-400">
            BHARATRAKSHAK AI
          </span>
          <span className="rounded-sm bg-red-500/25 px-2 py-0.5 font-mono text-[10px] font-bold text-red-400">
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-2 sm:flex">
            <Radio className="h-3 w-3 text-emerald-400" />
            <span className="font-mono text-[11px] text-emerald-400">
              ALL SYSTEMS NOMINAL
            </span>
          </div>
          <span className="font-mono text-sm tabular-nums text-slate-300">
            {time} IST
          </span>
        </div>
      </div>

      {/* ── Ticker ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center gap-4 border-b border-white/5 bg-red-950/15 px-5 py-2.5">
        <div className="flex shrink-0 items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-red-400" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
            Alert Feed
          </span>
        </div>
        <div className="mx-2 h-3 w-px shrink-0 bg-white/15" />
        <div className="overflow-hidden flex-1 h-4 relative">
          <p
            key={tickerIdx}
            className="ticker-anim absolute font-mono text-[11px] text-slate-400"
          >
            {TICKER[tickerIdx]}
          </p>
        </div>
      </div>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-5 py-12">
        {/* Eyebrow */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-500/40" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-500/80">
            Unified Emergency Command System · v2.4.1
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-500/40" />
        </div>

        <h1 className="mb-2 text-center font-mono text-4xl font-bold tracking-tight text-white sm:text-5xl">
          SELECT OPERATIONAL ROLE
        </h1>
        <p className="mb-14 text-center text-sm text-slate-500">
          Authenticate your access level to enter the appropriate command environment
        </p>

        {/* Role cards */}
        <div className="grid w-full max-w-5xl gap-5 md:grid-cols-3">
          {ROLES.map((role, idx) => (
            <button
              key={role.id}
              onClick={() => router.push(role.path)}
              onMouseEnter={() => setHovered(role.id)}
              onMouseLeave={() => setHovered(null)}
              className={`card-${idx} group relative overflow-hidden border text-left transition-all duration-300 ${role.border} bg-[#07101a]`}
              style={{
                boxShadow:
                  hovered === role.id
                    ? `0 0 48px 0 ${role.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`
                    : "inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              {/* Hover tint */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${role.bg_hover} transition-opacity duration-300 ${hovered === role.id ? "opacity-100" : "opacity-0"}`}
              />

              {/* Corner brackets */}
              {(["tl", "tr", "bl", "br"] as const).map((c) => (
                <div
                  key={c}
                  className={`absolute h-5 w-5 border-opacity-60 ${role.border.split(" ")[0]} ${c === "tl"
                      ? "left-0 top-0 border-l-2 border-t-2"
                      : c === "tr"
                        ? "right-0 top-0 border-r-2 border-t-2"
                        : c === "bl"
                          ? "bottom-0 left-0 border-b-2 border-l-2"
                          : "bottom-0 right-0 border-b-2 border-r-2"
                    }`}
                />
              ))}

              <div className="relative p-7">
                {/* Icon */}
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center border ${role.icon_bg}`}
                >
                  <role.icon className={`h-7 w-7 ${role.icon_color}`} />
                </div>

                {/* Status badge */}
                <div
                  className={`mb-4 inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 ${role.badge}`}
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${role.pulse} animate-pulse`}
                  />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
                    {role.status}
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {role.label}
                </h2>
                <p
                  className={`mb-4 mt-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] ${role.icon_color}`}
                >
                  {role.sublabel}
                </p>

                <p className="text-sm leading-relaxed text-slate-400">
                  {role.description}
                </p>

                <div
                  className={`mt-7 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest ${role.enter} transition-all duration-200 ${hovered === role.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
                >
                  <span>Enter Portal</span>
                  <span>→</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom telemetry */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-10">
          <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/10 to-transparent sm:hidden" />
          {TELEMETRY.map((t) => (
            <div key={t.label} className="text-center">
              <p className={`font-mono text-3xl font-bold tabular-nums ${t.color}`}>
                {t.value}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
                {t.label}
              </p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-12 font-mono text-[10px] text-slate-700">
          National Disaster Management Authority · Ministry of Home Affairs, India
        </p>
      </div>
    </div>
  );
}