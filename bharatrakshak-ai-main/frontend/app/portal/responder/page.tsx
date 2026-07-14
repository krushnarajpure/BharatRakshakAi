"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Radio,
  MapPin,
  Users,
  Package,
  Siren,
  Navigation,
  Zap,
  Target,
  Truck,
  Send,
  Circle,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const TEAM = {
  callsign: "BRAVO-7",
  unit: "NDRF 7th Battalion",
  base: "Guwahati Sector",
  members: 24,
  status: "Active Deployment",
};

const MISSIONS = [
  {
    id: "MSN-0741",
    op: "Flood Rescue",
    location: "Dibrugarh, Assam",
    priority: "critical",
    status: "In Progress",
    assigned: "Bravo-7",
    eta: "En route · 8 min",
    victims: 34,
  },
  {
    id: "MSN-0738",
    op: "Cyclone Evacuation",
    location: "Puri, Odisha",
    priority: "high",
    status: "Staging",
    assigned: "Alpha-3",
    eta: "Standby",
    victims: 120,
  },
  {
    id: "MSN-0735",
    op: "Medical Supply Drop",
    location: "Silchar, Assam",
    priority: "moderate",
    status: "Assigned",
    assigned: "Delta-2",
    eta: "Departs 14:30",
    victims: 0,
  },
  {
    id: "MSN-0729",
    op: "Landslide Rescue",
    location: "Gangtok, Sikkim",
    priority: "high",
    status: "Complete",
    assigned: "Charlie-5",
    eta: "Resolved",
    victims: 18,
  },
];

const TEAM_UNITS = [
  { name: "Alpha-3", role: "Search & Rescue", status: "Deployed", loc: "Puri", ok: true },
  { name: "Bravo-7", role: "Flood Response", status: "En Route", loc: "Dibrugarh", ok: true },
  { name: "Charlie-5", role: "Medical Evac", status: "Returning", loc: "Gangtok", ok: true },
  { name: "Delta-2", role: "Supply Convoy", status: "Staging", loc: "Guwahati Base", ok: false },
  { name: "Echo-9", role: "Air Support", status: "Airborne", loc: "2,400 ft AGL", ok: true },
];

const RESOURCES = [
  { label: "Rescue Boats", total: 24, used: 18, icon: Navigation },
  { label: "Rescue Kits", total: 140, used: 92, icon: Package },
  { label: "Medical Packs", total: 80, used: 51, icon: Zap },
  { label: "Rope Kits", total: 60, used: 44, icon: Circle },
  { label: "Vehicles", total: 12, used: 9, icon: Truck },
];

const COMMS = [
  { from: "HQ Command", msg: "Prioritise Dibrugarh sector. Civilian count revised to 34.", time: "10:41", type: "command" },
  { from: "Echo-9", msg: "Visual on rooftop survivors. 8 persons. Coordinates transmitted.", time: "10:38", type: "field" },
  { from: "Alpha-3", msg: "Puri staging complete. Awaiting GO on cyclone track update.", time: "10:32", type: "field" },
  { from: "HQ Command", msg: "Weather window closes 1300h. All extraction before 1250h.", time: "10:28", type: "command" },
  { from: "Delta-2", msg: "Medical convoy departs 1430h. Silchar ETA 1620h.", time: "10:21", type: "field" },
];

const TIMELINE = [
  { time: "09:00", event: "Mission briefing — Bravo-7 deployed", done: true },
  { time: "09:45", event: "Arrival at Dibrugarh forward base", done: true },
  { time: "10:30", event: "Boat deployment into flood zone", done: true },
  { time: "11:00", event: "First extraction wave", done: false },
  { time: "12:30", event: "Return to staging area", done: false },
  { time: "13:00", event: "Debrief and handoff to Charlie-5", done: false },
];

const PRIORITY_STYLE = {
  critical: {
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    dot: "bg-red-400 animate-pulse",
    row: "border-l-2 border-red-500/60",
  },
  high: {
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    dot: "bg-orange-400",
    row: "border-l-2 border-orange-500/60",
  },
  moderate: {
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    dot: "bg-yellow-400",
    row: "border-l-2 border-yellow-500/60",
  },
};

const STATUS_COLOR: Record<string, string> = {
  "In Progress": "text-orange-400",
  Staging: "text-yellow-400",
  Assigned: "text-blue-400",
  Complete: "text-green-400",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResponderPortal() {
  const [activeTab, setActiveTab] = useState<"queue" | "team" | "resources">("queue");
  const [commInput, setCommInput] = useState("");
  const [comms, setComms] = useState(COMMS);
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const sendComm = () => {
    if (!commInput.trim()) return;
    setComms((c) => [
      { from: "Bravo-7 (You)", msg: commInput, time: time.slice(0, 5), type: "field" },
      ...c,
    ]);
    setCommInput("");
  };

  return (
    <div className="min-h-screen bg-[#040a0e] text-white">
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .radar-arm { animation: radar-sweep 4s linear infinite; transform-origin: 50% 50%; }
        @keyframes blink-cursor {
          0%,100% { opacity:1; } 50% { opacity:0; }
        }
        .cursor { animation: blink-cursor 1s step-start infinite; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-orange-500/20 bg-[#060e14]">
        <div className="mx-auto max-w-7xl px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center border border-orange-500/40 bg-orange-500/10">
                <Siren className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-white">
                    {TEAM.callsign}
                  </span>
                  <span className="rounded-sm bg-orange-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-orange-400">
                    ACTIVE DEPLOYMENT
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {TEAM.unit} · {TEAM.base} · {TEAM.members} personnel
                </p>
              </div>
            </div>

            {/* Telemetry strip */}
            <div className="flex items-center gap-6 font-mono text-xs">
              {[
                { label: "Missions", value: "4", color: "text-orange-400" },
                { label: "Rescued", value: "52", color: "text-green-400" },
                { label: "Critical", value: "1", color: "text-red-400" },
                { label: "Clock", value: time, color: "text-slate-300" },
              ].map((s) => (
                <div key={s.label} className="text-right">
                  <p className={`text-base font-bold tabular-nums ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          {/* ── Left column ────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Tab selector */}
            <div className="flex gap-1 border-b border-white/8 pb-px">
              {(["queue", "team", "resources"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === tab ? "border-orange-500 text-orange-400" : "border-transparent text-slate-600 hover:text-slate-400"}`}
                >
                  {tab === "queue"
                    ? "Mission Queue"
                    : tab === "team"
                      ? "Team Status"
                      : "Resources"}
                </button>
              ))}
            </div>

            {/* Mission Queue */}
            {activeTab === "queue" && (
              <div className="space-y-3">
                {MISSIONS.map((m) => {
                  const p = PRIORITY_STYLE[m.priority as keyof typeof PRIORITY_STYLE] ?? PRIORITY_STYLE.moderate;
                  return (
                    <div
                      key={m.id}
                      className={`rounded-sm bg-[#07111a] p-4 pl-5 ${p.row}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-slate-500">
                              {m.id}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${p.badge}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                              {m.priority}
                            </span>
                          </div>
                          <h3 className="mt-1.5 text-base font-bold text-white">
                            {m.op}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {m.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {m.victims > 0 ? `${m.victims} persons` : "Supply mission"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {m.eta}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-semibold ${STATUS_COLOR[m.status] ?? "text-slate-400"}`}
                          >
                            {m.status}
                          </span>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {m.assigned}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Team Status */}
            {activeTab === "team" && (
              <div className="space-y-2.5">
                {TEAM_UNITS.map((u) => (
                  <div
                    key={u.name}
                    className="flex items-center gap-4 rounded-sm border border-white/8 bg-[#07111a] px-5 py-4"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-xs font-bold ${u.ok ? "bg-orange-500/15 text-orange-400" : "bg-slate-800 text-slate-500"}`}
                    >
                      {u.name.split("-")[0].charAt(0)}
                      {u.name.split("-")[1]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span
                          className={`h-2 w-2 rounded-full ${u.ok ? "bg-green-400" : "bg-slate-600"}`}
                        />
                        <span
                          className={`text-sm font-semibold ${u.ok ? "text-green-400" : "text-slate-500"}`}
                        >
                          {u.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600">{u.loc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resources */}
            {activeTab === "resources" && (
              <div className="space-y-3">
                {RESOURCES.map((r) => {
                  const pct = Math.round((r.used / r.total) * 100);
                  const barColor =
                    pct > 85
                      ? "bg-red-500"
                      : pct > 60
                        ? "bg-orange-500"
                        : "bg-green-500";
                  return (
                    <div
                      key={r.label}
                      className="rounded-sm border border-white/8 bg-[#07111a] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <r.icon className="h-4 w-4 text-orange-400" />
                          <span className="text-sm font-medium text-white">
                            {r.label}
                          </span>
                        </div>
                        <div className="text-right font-mono text-sm">
                          <span className="font-bold text-white">{r.used}</span>
                          <span className="text-slate-600"> / {r.total}</span>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1 text-right font-mono text-[10px] text-slate-600">
                        {pct}% deployed
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Radar + map placeholder */}
            <div className="rounded-sm border border-white/8 bg-[#07111a] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Tactical Map · Dibrugarh Sector
                  </p>
                </div>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                  LIVE FEED
                </span>
              </div>
              {/* Radar visualisation */}
              <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-orange-500/20" />
                <div className="absolute h-32 w-32 rounded-full border border-orange-500/15" />
                <div className="absolute h-16 w-16 rounded-full border border-orange-500/25" />
                <svg
                  className="radar-arm absolute inset-0"
                  viewBox="0 0 192 192"
                  fill="none"
                >
                  <defs>
                    <radialGradient id="sweep" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(249,115,22,0.4)" />
                      <stop offset="100%" stopColor="rgba(249,115,22,0)" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M96 96 L96 8 A88 88 0 0 1 96 8 Z"
                    fill="url(#sweep)"
                    opacity="0.6"
                  />
                  <line
                    x1="96"
                    y1="96"
                    x2="96"
                    y2="8"
                    stroke="rgba(249,115,22,0.6)"
                    strokeWidth="1"
                  />
                </svg>
                {/* Blips */}
                {[
                  { cx: 110, cy: 72, c: "#ef4444" },
                  { cx: 78, cy: 115, c: "#f97316" },
                  { cx: 130, cy: 110, c: "#f97316" },
                  { cx: 60, cy: 80, c: "#22c55e" },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="absolute h-2 w-2 -translate-x-1 -translate-y-1 rounded-full"
                    style={{
                      left: b.cx,
                      top: b.cy,
                      backgroundColor: b.c,
                      boxShadow: `0 0 4px 1px ${b.c}60`,
                    }}
                  />
                ))}
                <div className="z-10 flex h-2 w-2 rounded-full bg-orange-400 ring-2 ring-orange-400/30" />
              </div>

              {/* Mission timeline */}
              <div className="mt-5 border-t border-white/8 pt-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Mission Timeline
                </p>
                <div className="space-y-2">
                  {TIMELINE.map((t, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 font-mono text-[10px] text-slate-600">
                        {t.time}
                      </span>
                      <div
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${t.done ? "bg-green-400" : "bg-slate-700"}`}
                      />
                      <p
                        className={`text-xs ${t.done ? "text-slate-400" : "text-slate-600"}`}
                      >
                        {t.event}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column: Comms ────────────────────────────────────── */}
          <div className="flex flex-col rounded-sm border border-white/8 bg-[#07111a]">
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
              <Radio className="h-4 w-4 text-orange-400" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Comms Feed
              </p>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                <span className="font-mono text-[10px] text-red-400">LIVE</span>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {comms.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] font-bold ${c.type === "command" ? "text-cyan-400" : "text-orange-400"}`}
                    >
                      {c.from}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-slate-600">
                      {c.time}
                    </span>
                  </div>
                  <div
                    className={`rounded-sm px-3 py-2.5 text-xs leading-relaxed text-slate-300 ${c.type === "command" ? "border border-cyan-500/15 bg-cyan-950/20" : "border border-white/5 bg-white/4"}`}
                  >
                    {c.msg}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-white/8 p-4">
              <div className="flex gap-2">
                <input
                  value={commInput}
                  onChange={(e) => setCommInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendComm()}
                  placeholder="Transmit to HQ…"
                  className="flex-1 rounded-sm border border-white/10 bg-white/4 px-3 py-2 font-mono text-xs text-white outline-none placeholder:text-slate-700 focus:border-orange-500/40"
                />
                <button
                  onClick={sendComm}
                  className="flex items-center gap-1 rounded-sm bg-orange-600 px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}