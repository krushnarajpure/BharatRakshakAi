"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  MapPin,
  MessageSquare,
  Navigation,
  CheckCircle,
  Shield,
  Wifi,
  Battery,
  Siren,
  Phone,
  ChevronRight,
  Send,
  X,
  Wind,
  Waves,
  Thermometer,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const ALERTS = [
  {
    id: 1,
    type: "Flood",
    level: "Critical",
    location: "2.3 km — Brahmaputra Basin",
    desc: "River overflowing embankments. Evacuate immediately to higher ground.",
    icon: Waves,
    color: {
      border: "border-red-500/40",
      bg: "bg-red-950/25",
      badge: "bg-red-500/20 text-red-300",
      icon: "text-red-400",
    },
  },
  {
    id: 2,
    type: "Cyclone",
    level: "Warning",
    location: "48 km — Odisha coastline",
    desc: "Cyclone Tej approaching at 160 km/h. Secure windows, stay indoors.",
    icon: Wind,
    color: {
      border: "border-orange-500/40",
      bg: "bg-orange-950/20",
      badge: "bg-orange-500/20 text-orange-300",
      icon: "text-orange-400",
    },
  },
  {
    id: 3,
    type: "Heatwave",
    level: "Advisory",
    location: "Your district",
    desc: "Temperature 47°C forecast. Avoid outdoors 12–5 PM. Stay hydrated.",
    icon: Thermometer,
    color: {
      border: "border-yellow-500/40",
      bg: "bg-yellow-950/15",
      badge: "bg-yellow-500/20 text-yellow-300",
      icon: "text-yellow-400",
    },
  },
];

const SHELTERS = [
  { name: "Guwahati Civil School", dist: "1.1 km", occ: 420, cap: 600, open: true },
  { name: "Dispur Community Hall", dist: "2.4 km", occ: 180, cap: 300, open: true },
  { name: "Assam Medical College", dist: "3.8 km", occ: 600, cap: 600, open: false },
];

const CONTACTS = [
  { label: "Police", number: "100", icon: Shield, color: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
  { label: "Ambulance", number: "108", icon: Siren, color: "border-red-500/40 bg-red-500/10 text-red-400" },
  { label: "NDRF", number: "1078", icon: AlertTriangle, color: "border-orange-500/40 bg-orange-500/10 text-orange-400" },
  { label: "Fire", number: "101", icon: Phone, color: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" },
];

const SOS_HISTORY = [
  { id: "SOS-1041", time: "09:32 AM today", status: "En Route", team: "NDRF Battalion 7", active: true },
  { id: "SOS-1022", time: "Yesterday 3:15 PM", status: "Resolved", team: "SDRF Team 3", active: false },
];

const TIPS = [
  "Move to the highest available floor immediately if water is rising.",
  "Do not attempt to cross flooded roads, even knee-deep water can sweep you away.",
  "Conserve phone battery — enable low-power mode, close background apps.",
  "Signal rescuers from height using bright fabric, flashlight, or mirror reflection.",
  "Keep doors and windows shut if storm is active. Stay away from glass.",
];

const AI_RESPONSES: Record<string, string> = {
  default:
    "Understood. I've noted your situation and shared it with nearby response teams. Stay calm — follow the safety steps below and keep this channel open.",
  flood:
    "Flood response activated. Move immediately to upper floors. Do NOT enter floodwater. NDRF has been alerted to your GPS coordinates.",
  stuck:
    "Your location is pinned. Signal from your window or roof. A rescue team (ETA ~15 min) is being routed to you now.",
  help:
    "Help is on the way. Your SOS has priority status. Keep the line open and signal your position from the highest accessible point.",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CitizenPortal() {
  const [sosSent, setSosSent] = useState(false);
  const [sosHeld, setSosHeld] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "I'm your emergency assistant. Are you safe right now? Tell me your situation and I'll guide you step by step.",
    },
  ]);
  const [input, setInput] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const id = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(id);
  }, []);

  // SOS hold logic
  useEffect(() => {
    if (!sosHeld || sosSent) {
      return;
    }

    const interval = window.setInterval(() => {
      setHoldProgress((p) => {
        if (p >= 100) {
          window.clearInterval(interval);
          setSosSent(true);
          setSosHeld(false);
          return 100;
        }
        return p + 5;
      });
    }, 80);

    return () => window.clearInterval(interval);
  }, [sosHeld, sosSent]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const lower = input.toLowerCase();
    const key = lower.includes("flood")
      ? "flood"
      : lower.includes("stuck") || lower.includes("trap")
        ? "stuck"
        : lower.includes("help")
          ? "help"
          : "default";
    setMessages((m) => [
      ...m,
      { role: "user", text: input },
      { role: "ai", text: AI_RESPONSES[key] },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#04070d] text-white">
      <style>{`
        @keyframes sos-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6), 0 0 0 0 rgba(239,68,68,0.3); }
          50%      { box-shadow: 0 0 0 18px rgba(239,68,68,0), 0 0 0 36px rgba(239,68,68,0); }
        }
        @keyframes sos-ring {
          0%   { transform:scale(1); opacity:0.6; }
          100% { transform:scale(1.8); opacity:0; }
        }
        .sos-idle { animation: sos-glow 2.2s ease-in-out infinite; }
        .sos-ring { animation: sos-ring 1.5s ease-out infinite; }
        @keyframes fill-arc {
          from { stroke-dashoffset: 264; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* ── Status bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-black/60 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="font-mono text-xs font-bold text-red-400">
            EMERGENCY ACTIVE · Guwahati, Assam
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <Battery className="h-3.5 w-3.5" />
          <Wifi className="h-3.5 w-3.5" />
          <span className="font-mono text-xs tabular-nums">{time}</span>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6 pb-16">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
            BharatRakshak · Citizen Emergency
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Emergency Assistant
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="h-3 w-3 text-red-400" />
            Location verified · 3 active alerts nearby
          </p>
        </div>

        {/* ── SOS Button ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center py-4">
          {!sosSent ? (
            <>
              <div className="relative flex items-center justify-center">
                {/* Outer rings */}
                <div className="sos-ring absolute h-44 w-44 rounded-full border-2 border-red-500/30" />
                <div
                  className="sos-ring absolute h-44 w-44 rounded-full border-2 border-red-500/20"
                  style={{ animationDelay: "0.5s" }}
                />

                {/* Progress circle */}
                {holdProgress > 0 && (
                  <svg
                    className="absolute h-44 w-44 -rotate-90"
                    viewBox="0 0 88 88"
                  >
                    <circle
                      cx="44"
                      cy="44"
                      r="42"
                      fill="none"
                      stroke="rgba(239,68,68,0.8)"
                      strokeWidth="3"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * holdProgress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                <button
                  onMouseDown={() => setSosHeld(true)}
                  onMouseUp={() => setSosHeld(false)}
                  onMouseLeave={() => setSosHeld(false)}
                  onTouchStart={() => setSosHeld(true)}
                  onTouchEnd={() => setSosHeld(false)}
                  className={`sos-idle relative flex h-36 w-36 flex-col items-center justify-center rounded-full bg-red-600 transition-transform active:scale-95 ${sosHeld ? "scale-95" : ""}`}
                >
                  <Siren className="h-10 w-10 text-white" />
                  <span className="mt-1 font-mono text-sm font-bold tracking-[0.2em]">
                    SOS
                  </span>
                </button>
              </div>
              <p className="mt-5 text-center text-xs text-slate-500">
                Hold button to transmit emergency rescue request
              </p>
            </>
          ) : (
            <div className="w-full space-y-3 rounded-sm border border-red-500/30 bg-red-950/25 p-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-red-400" />
              <p className="text-xl font-bold text-white">SOS Transmitted</p>
              <p className="text-sm text-slate-400">
                Your GPS location has been shared with NDRF command.
              </p>
              <div className="space-y-1 pt-2">
                <p className="font-mono text-sm font-semibold text-red-400">
                  Request ID: SOS-1048
                </p>
                <p className="font-mono text-xs text-slate-500">
                  NDRF Battalion 7 · ETA ~12 minutes
                </p>
              </div>
              <button
                onClick={() => {
                  setSosSent(false);
                  setHoldProgress(0);
                }}
                className="mt-2 flex items-center gap-1.5 mx-auto text-xs text-slate-500 hover:text-slate-300"
              >
                <X className="h-3 w-3" />
                Cancel request
              </button>
            </div>
          )}
        </div>

        {/* ── Nearby Alerts ─────────────────────────────────────────────── */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Active Alerts Near You
          </p>
          <div className="space-y-2.5">
            {ALERTS.map((a) => (
              <div
                key={a.id}
                className={`flex gap-3 rounded-sm border p-4 ${a.color.border} ${a.color.bg}`}
              >
                <a.icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${a.color.icon}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${a.color.badge}`}
                    >
                      {a.level}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {a.type}
                    </span>
                    <span className="ml-auto text-xs text-slate-500">
                      {a.location}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                    {a.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Emergency Contacts ───────────────────────────────────────── */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Emergency Contacts
          </p>
          <div className="grid grid-cols-4 gap-2">
            {CONTACTS.map((c) => (
              <a
                key={c.label}
                href={`tel:${c.number}`}
                className={`flex flex-col items-center gap-2 rounded-sm border p-3 text-center transition-opacity active:opacity-70 ${c.color}`}
              >
                <c.icon className="h-5 w-5" />
                <span className="font-mono text-sm font-bold">{c.number}</span>
                <span className="text-[10px] font-medium">{c.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ── Shelter Finder ───────────────────────────────────────────── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Nearest Safe Shelters
            </p>
            <button className="flex items-center gap-1 text-xs font-medium text-blue-400">
              <Navigation className="h-3.5 w-3.5" />
              Navigate
            </button>
          </div>
          <div className="space-y-2">
            {SHELTERS.map((s) => {
              const pct = Math.round((s.occ / s.cap) * 100);
              return (
                <div
                  key={s.name}
                  className="flex items-center gap-4 rounded-sm border border-white/8 bg-white/4 p-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-white">
                        {s.name}
                      </p>
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${s.open ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {s.open ? "Open" : "Full"}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <p className="text-xs text-slate-500">
                        {s.dist} · {s.occ}/{s.cap} capacity
                      </p>
                    </div>
                    {/* Capacity bar */}
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AI Survival Chat ─────────────────────────────────────────── */}
        <div className="rounded-sm border border-blue-500/25 bg-blue-950/10">
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              AI Survival Assistant
            </p>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="font-mono text-[10px] text-green-400">Online</span>
            </div>
          </div>

          <div className="max-h-56 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[84%] rounded-sm px-3 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white/8 text-slate-200"}`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 border-t border-white/8 px-4 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Describe your situation…"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
            <button
              onClick={sendMessage}
              className="flex items-center gap-1.5 rounded-sm bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </button>
          </div>
        </div>

        {/* ── Safety Tips ──────────────────────────────────────────────── */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Safety Guidance
          </p>
          <div className="space-y-2">
            {TIPS.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-sm border border-white/6 bg-white/4 px-4 py-3"
              >
                <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-cyan-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-relaxed text-slate-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SOS History ──────────────────────────────────────────────── */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Your Requests
          </p>
          <div className="space-y-2">
            {SOS_HISTORY.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-sm border border-white/8 bg-white/4 p-4"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-white">
                    {s.id}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {s.time} · {s.team}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold ${s.active ? "bg-orange-500/20 text-orange-300" : "bg-green-500/20 text-green-400"}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${s.active ? "bg-orange-400 animate-pulse" : "bg-green-400"}`}
                  />
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}