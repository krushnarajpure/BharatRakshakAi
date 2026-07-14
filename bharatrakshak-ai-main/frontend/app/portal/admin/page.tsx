"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Radio,
  Globe,
  Cpu,
  Zap,
  Satellite,
  Activity,
  Users,
  Package,
  Send,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Lock,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const NATIONAL_STATS = [
  { label: "Active Incidents", value: "18", sub: "+3 last 2h", trend: "up", color: "text-red-400", border: "border-red-500/25", bg: "bg-red-500/8" },
  { label: "Persons Affected", value: "2.4L", sub: "Assam, Odisha, WB", trend: "up", color: "text-orange-400", border: "border-orange-500/25", bg: "bg-orange-500/8" },
  { label: "Teams Deployed", value: "58", sub: "12 states", trend: "stable", color: "text-cyan-400", border: "border-cyan-500/25", bg: "bg-cyan-500/8" },
  { label: "Persons Rescued", value: "12,841", sub: "Last 24 hours", trend: "up", color: "text-green-400", border: "border-green-500/25", bg: "bg-green-500/8" },
  { label: "Relief Camps", value: "124", sub: "Operational", trend: "stable", color: "text-yellow-400", border: "border-yellow-500/25", bg: "bg-yellow-500/8" },
  { label: "AI Alerts Issued", value: "847", sub: "Via UECS channel", trend: "up", color: "text-purple-400", border: "border-purple-500/25", bg: "bg-purple-500/8" },
];

const STATES = [
  { name: "Assam", risk: "critical", event: "Flood", level: 5, districts: 14, teams: 12 },
  { name: "Odisha", risk: "critical", event: "Cyclone", level: 5, districts: 8, teams: 10 },
  { name: "West Bengal", risk: "high", event: "Flood", level: 4, districts: 6, teams: 7 },
  { name: "Sikkim", risk: "high", event: "Landslide", level: 4, districts: 3, teams: 4 },
  { name: "Tamil Nadu", risk: "high", event: "Cyclone", level: 3, districts: 5, teams: 5 },
  { name: "Rajasthan", risk: "moderate", event: "Heatwave", level: 3, districts: 9, teams: 6 },
  { name: "Bihar", risk: "moderate", event: "Flood", level: 3, districts: 7, teams: 5 },
  { name: "Manipur", risk: "moderate", event: "Landslide", level: 2, districts: 4, teams: 3 },
  { name: "Gujarat", risk: "low", event: "Coastal Alert", level: 1, districts: 2, teams: 2 },
  { name: "Maharashtra", risk: "low", event: "Monitoring", level: 1, districts: 3, teams: 2 },
  { name: "Kerala", risk: "low", event: "Monitoring", level: 1, districts: 1, teams: 1 },
  { name: "Uttarakhand", risk: "moderate", event: "Flood", level: 2, districts: 4, teams: 2 },
];

const RISK_STYLE = {
  critical: {
    badge: "bg-red-500/20 text-red-300 border border-red-500/30",
    dot: "bg-red-500 animate-pulse",
    bar: "bg-red-500",
    card: "border-red-500/25 bg-red-950/10",
  },
  high: {
    badge: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
    card: "border-orange-500/20 bg-orange-950/8",
  },
  moderate: {
    badge: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    dot: "bg-yellow-500",
    bar: "bg-yellow-500",
    card: "border-yellow-500/15 bg-yellow-950/5",
  },
  low: {
    badge: "bg-green-500/20 text-green-300 border border-green-500/30",
    dot: "bg-green-500",
    bar: "bg-green-500",
    card: "border-white/8 bg-white/3",
  },
};

const AI_PREDICTIONS = [
  { label: "Cyclone Tej landfall — Odisha coast", probability: 91, risk: "critical", eta: "ETA 5.5 hrs" },
  { label: "Brahmaputra Basin breach — Assam", probability: 87, risk: "critical", eta: "Active" },
  { label: "Secondary flood — Bihar floodplains", probability: 68, risk: "high", eta: "24–36 hrs" },
  { label: "Heatwave escalation — Rajasthan", probability: 52, risk: "moderate", eta: "48 hrs" },
  { label: "Landslide risk — Uttarakhand NH-58", probability: 41, risk: "moderate", eta: "72 hrs" },
];

const RESOURCES = [
  { label: "NDRF Battalions", deployed: 58, total: 72, icon: Shield },
  { label: "Helicopters", deployed: 12, total: 18, icon: Activity },
  { label: "Relief Camps", deployed: 124, total: 180, icon: Package },
  { label: "Medical Units", deployed: 46, total: 60, icon: Zap },
  { label: "Army Columns", deployed: 8, total: 14, icon: Users },
  { label: "Rescue Boats", deployed: 340, total: 420, icon: Globe },
];

const INCIDENT_STREAM = [
  { time: "10:41", event: "NDRF helicopter extraction — 18 rescued — Majuli Island, Assam", sev: "critical" },
  { time: "10:38", event: "Cyclone Tej track updated — Category 3 sustained", sev: "critical" },
  { time: "10:32", event: "Relief camp opened — Bhubaneswar · 1,200 capacity", sev: "info" },
  { time: "10:28", event: "IMD bulletin: 48h rainfall forecast extreme — NE India", sev: "high" },
  { time: "10:21", event: "Medical convoy dispatched — Silchar district", sev: "info" },
  { time: "10:17", event: "Landslide confirmed — NH-10 Sikkim · road blocked", sev: "high" },
  { time: "10:09", event: "Army column deployed — Brahmaputra embankment", sev: "info" },
  { time: "09:55", event: "ISRO satellite imagery processed — Assam flood extent", sev: "info" },
];

const INFRA = [
  { label: "IMD Weather Feed", status: "Operational", ok: true },
  { label: "ISRO SAR Satellite", status: "Connected", ok: true },
  { label: "VSAT Emergency Net", status: "Active · 98.2%", ok: true },
  { label: "AI Prediction Engine", status: "Healthy · v4.2", ok: true },
  { label: "State NOC Links", status: "28/36 Connected", ok: true },
  { label: "NDMA Data Bridge", status: "Degraded — Bihar", ok: false },
];

const SEV_STYLE: Record<string, string> = {
  critical: "border-l-2 border-red-500 bg-red-950/15",
  high: "border-l-2 border-orange-500 bg-orange-950/10",
  info: "border-l-2 border-cyan-500/40 bg-white/3",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPortal() {
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [activeView, setActiveView] = useState<"states" | "resources">("states");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const sendBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMsg("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#03070f] text-white">
      <style>{`
        @keyframes pulse-gold {
          0%,100% { opacity:1; }
          50%      { opacity:0.5; }
        }
        @keyframes row-enter {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .gold-pulse { animation: pulse-gold 2s ease-in-out infinite; }
        @keyframes data-flash {
          0%   { background-color:rgba(34,211,238,0.15); }
          100% { background-color:transparent; }
        }
        .data-flash { animation: data-flash 1.5s ease; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-cyan-500/20 bg-[#040c18]">
        <div className="mx-auto max-w-[1600px] px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center border border-cyan-500/40 bg-cyan-500/10">
                <Satellite className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-500">
                    BharatRakshak AI
                  </p>
                  <span className="rounded-sm bg-red-500/25 px-2 py-0.5 font-mono text-[10px] font-bold text-red-400">
                    OPERATION ACTIVE
                  </span>
                  <span className="rounded-sm border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-yellow-400">
                    AUTHORITY LEVEL 5
                  </span>
                </div>
                <h1 className="font-mono text-xl font-bold text-white">
                  National Disaster Command Center
                </h1>
              </div>
            </div>
            <div className="text-right font-mono">
              <p className="text-2xl font-bold tabular-nums text-white">{time} IST</p>
              <p className="text-xs text-slate-500">{date}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">

        {/* ── National stats ─────────────────────────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {NATIONAL_STATS.map((s) => (
            <div
              key={s.label}
              className={`rounded-sm border p-4 ${s.border} ${s.bg}`}
            >
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                  {s.label}
                </p>
                {s.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-red-400" />
                ) : s.trend === "down" ? (
                  <TrendingDown className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-slate-600" />
                )}
              </div>
              <p className={`mt-3 font-mono text-2xl font-bold tabular-nums ${s.color}`}>
                {s.value}
              </p>
              <p className="mt-1 text-[10px] text-slate-600">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main grid ──────────────────────────────────────────────────── */}
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">

          {/* ── Left: state monitoring + resource tabs ──────────────────── */}
          <div className="space-y-5">

            {/* Tab header */}
            <div className="flex items-center gap-1 border-b border-white/8">
              {(["states", "resources"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={`border-b-2 px-5 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors ${activeView === v ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-600 hover:text-slate-400"}`}
                >
                  {v === "states" ? "State-Wise Monitoring" : "Resource Allocation"}
                </button>
              ))}
            </div>

            {/* State grid */}
            {activeView === "states" && (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {STATES.map((s) => {
                  const st = RISK_STYLE[s.risk as keyof typeof RISK_STYLE];
                  return (
                    <div
                      key={s.name}
                      className={`rounded-sm border p-4 ${st.card}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${st.dot}`} />
                            <h3 className="font-semibold text-white">{s.name}</h3>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">{s.event}</p>
                        </div>
                        <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${st.badge}`}>
                          {s.risk}
                        </span>
                      </div>

                      {/* Risk level bar */}
                      <div className="mt-3 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${i < s.level ? st.bar : "bg-white/8"}`}
                          />
                        ))}
                      </div>

                      <div className="mt-3 flex justify-between text-[10px] text-slate-600">
                        <span>{s.districts} districts affected</span>
                        <span className="text-slate-400">{s.teams} teams</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Resource allocation */}
            {activeView === "resources" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {RESOURCES.map((r) => {
                  const pct = Math.round((r.deployed / r.total) * 100);
                  const col = pct > 85 ? "bg-red-500" : pct > 65 ? "bg-orange-500" : "bg-cyan-500";
                  return (
                    <div
                      key={r.label}
                      className="rounded-sm border border-white/8 bg-[#07111a] p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <r.icon className="h-5 w-5 text-cyan-400/70" />
                          <span className="text-sm font-medium text-white">{r.label}</span>
                        </div>
                        <div className="font-mono text-sm">
                          <span className="font-bold text-white">{r.deployed}</span>
                          <span className="text-slate-600"> / {r.total}</span>
                        </div>
                      </div>
                      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                        <div className={`h-full rounded-full ${col}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-2 flex justify-between font-mono text-[10px]">
                        <span className="text-slate-600">{pct}% utilised</span>
                        <span className="text-slate-500">{r.total - r.deployed} reserve</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Broadcast Console */}
            <div className="rounded-sm border border-yellow-500/20 bg-yellow-950/10">
              <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3">
                <Radio className="h-4 w-4 text-yellow-400" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-400">
                  Emergency Broadcast Console
                </p>
                <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-yellow-500">
                  <Lock className="h-3 w-3" />
                  Authority-Level Only
                </span>
              </div>

              <div className="p-5">
                <div className="mb-3 flex flex-wrap gap-2">
                  {["All States", "Flood Zones", "Cyclone Path", "Assam Only", "Odisha Only"].map((zone) => (
                    <button
                      key={zone}
                      className="rounded-sm border border-yellow-500/20 bg-yellow-500/8 px-3 py-1.5 text-xs font-semibold text-yellow-400 transition-colors hover:bg-yellow-500/15"
                    >
                      {zone}
                    </button>
                  ))}
                </div>

                <textarea
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Compose national emergency broadcast… (All connected state systems, NDMA relay, public alert channels)"
                  rows={3}
                  className="w-full resize-none rounded-sm border border-white/8 bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-yellow-500/30"
                />

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    Transmitted to: IMD, All-State NOCs, Doordarshan Emergency, Mobile Alert System
                  </p>
                  <button
                    onClick={sendBroadcast}
                    className={`flex items-center gap-2 rounded-sm px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${broadcastSent ? "bg-green-600 text-white" : "bg-yellow-600 text-black hover:bg-yellow-500"}`}
                  >
                    {broadcastSent ? (
                      <>✓ Transmitted</>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Issue Broadcast
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column ───────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* AI Prediction Engine */}
            <div className="rounded-sm border border-purple-500/20 bg-purple-950/10">
              <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
                <Cpu className="h-4 w-4 text-purple-400" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-400">
                  AI Prediction Engine
                </p>
                <span className="ml-auto font-mono text-[10px] text-purple-500">
                  Model v4.2 · Real-time
                </span>
              </div>

              <div className="space-y-3 p-4">
                {AI_PREDICTIONS.map((pred, i) => {
                  const col =
                    pred.risk === "critical"
                      ? { bar: "bg-red-500", text: "text-red-400", bg: "bg-red-500/15" }
                      : pred.risk === "high"
                        ? { bar: "bg-orange-500", text: "text-orange-400", bg: "bg-orange-500/15" }
                        : { bar: "bg-yellow-500", text: "text-yellow-400", bg: "bg-yellow-500/15" };
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs leading-relaxed text-slate-300">
                          {pred.label}
                        </p>
                        <span className={`shrink-0 font-mono text-sm font-bold tabular-nums ${col.text}`}>
                          {pred.probability}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                          <div
                            className={`h-full rounded-full transition-all ${col.bar}`}
                            style={{ width: `${pred.probability}%` }}
                          />
                        </div>
                        <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${col.bg} ${col.text}`}>
                          {pred.eta}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Infrastructure status */}
            <div className="rounded-sm border border-white/8 bg-[#07111a]">
              <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
                <Eye className="h-4 w-4 text-cyan-400/70" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  System Infrastructure
                </p>
              </div>
              <div className="divide-y divide-white/5">
                {INFRA.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${item.ok ? "bg-emerald-400" : "bg-red-400 animate-pulse"}`}
                      />
                      <span
                        className={`font-mono text-xs font-medium ${item.ok ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Incident Stream */}
            <div className="rounded-sm border border-white/8 bg-[#07111a]">
              <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
                <Activity className="h-4 w-4 text-cyan-400/70" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Live Incident Stream
                </p>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                  <span className="font-mono text-[10px] text-red-400">LIVE</span>
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {INCIDENT_STREAM.map((ev, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-3 ${SEV_STYLE[ev.sev]}`}
                  >
                    <span className="shrink-0 font-mono text-[10px] tabular-nums text-slate-600">
                      {ev.time}
                    </span>
                    <p className="text-xs leading-relaxed text-slate-300">{ev.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}