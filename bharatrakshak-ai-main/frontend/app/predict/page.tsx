"use client";

import { useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronUp,
  CloudRain,
  Database,
  Globe,
  Mountain,
  Radio,
  RefreshCw,
  Satellite,
  Shield,
  Siren,
  ThermometerSun,
  TrendingUp,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";


// ─── Types ────────────────────────────────────────────────────────────────────

type RiskLevel = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
type Trend = "increasing" | "stable" | "decreasing";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const predictionCards = [
  {
    type: "Flood",
    icon: Waves,
    level: "HIGH" as RiskLevel,
    confidence: 92,
    affected: ["Assam", "Bihar"],
    trend: "increasing" as Trend,
    color: "cyan",
  },
  {
    type: "Cyclone",
    icon: Wind,
    level: "CRITICAL" as RiskLevel,
    confidence: 87,
    affected: ["Odisha", "Andhra Pradesh"],
    trend: "increasing" as Trend,
    color: "red",
  },
  {
    type: "Heatwave",
    icon: ThermometerSun,
    level: "MODERATE" as RiskLevel,
    confidence: 81,
    affected: ["Rajasthan", "MP"],
    trend: "stable" as Trend,
    color: "orange",
  },
  {
    type: "Landslide",
    icon: Mountain,
    level: "MODERATE" as RiskLevel,
    confidence: 78,
    affected: ["Sikkim", "Uttarakhand"],
    trend: "decreasing" as Trend,
    color: "yellow",
  },
];

const riskLevelStyle: Record<RiskLevel, string> = {
  CRITICAL: "text-red-400 border-red-500/40 bg-red-500/10",
  HIGH:     "text-orange-400 border-orange-500/40 bg-orange-500/10",
  MODERATE: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  LOW:      "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
};

const stateRisks = [
  { state: "Assam",     type: "Flood Risk",     pct: 92, color: "bg-cyan-500" },
  { state: "Odisha",    type: "Cyclone Risk",   pct: 87, color: "bg-red-500" },
  { state: "Rajasthan", type: "Heatwave Risk",  pct: 81, color: "bg-orange-500" },
  { state: "Sikkim",    type: "Landslide Risk", pct: 78, color: "bg-yellow-500" },
  { state: "Bihar",     type: "Flood Risk",     pct: 74, color: "bg-cyan-500" },
  { state: "Kerala",    type: "Landslide Risk", pct: 69, color: "bg-yellow-500" },
];

const models = [
  { name: "XGBoost Flood Model",      status: "ONLINE" },
  { name: "Cyclone Forecast Engine",  status: "ONLINE" },
  { name: "Heatwave Predictor",       status: "ONLINE" },
  { name: "Landslide Analyzer",       status: "ONLINE" },
  { name: "Data Pipeline",            status: "ONLINE" },
];

const dataSources = [
  { name: "IMD Weather Feed",           icon: CloudRain,  status: "Live" },
  { name: "Satellite Imagery",          icon: Satellite,  status: "Live" },
  { name: "River Monitoring Stations",  icon: Waves,      status: "Live" },
  { name: "Historical Records",         icon: Database,   status: "Synced" },
  { name: "Ground Sensors",             icon: Radio,      status: "Live" },
];

const forecastTimeline = [
  { label: "Today",    flood: 89, cyclone: 82, heat: 71, land: 55 },
  { label: "Tomorrow", flood: 91, cyclone: 87, heat: 74, land: 52 },
  { label: "3 Days",   flood: 85, cyclone: 79, heat: 68, land: 60 },
  { label: "7 Days",   flood: 70, cyclone: 65, heat: 80, land: 65 },
];

const forecastOutput = {
  type: "Flood Prediction",
  risk: 89,
  severity: "HIGH" as RiskLevel,
  districts: ["Dibrugarh", "Jorhat", "Golaghat", "Morigaon"],
  actions: [
    "Prepare evacuation plans for low-lying areas",
    "Activate NDRF rescue teams in Assam",
    "Issue public alerts via emergency broadcast",
    "Pre-position relief materials at district HQs",
  ],
};

const inputFields = [
  { label: "Rainfall (mm)",      key: "rainfall",    value: "142",  unit: "mm/24h" },
  { label: "Temperature (°C)",   key: "temperature", value: "36.4", unit: "°C" },
  { label: "Humidity (%)",       key: "humidity",    value: "87",   unit: "%" },
  { label: "River Level (m)",    key: "river",       value: "8.2",  unit: "m" },
  { label: "Wind Speed (km/h)",  key: "wind",        value: "64",   unit: "km/h" },
  { label: "Pressure (hPa)",     key: "pressure",    value: "992",  unit: "hPa" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
      {children}
    </p>
  );
}

function OnlineDot({ pulse = true }: { pulse?: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {pulse && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      )}
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  );
}

function TrendBadge({ trend }: { trend: Trend }) {
  if (trend === "increasing")
    return <span className="flex items-center gap-1 text-xs text-red-400"><TrendingUp className="h-3 w-3" /> Increasing</span>;
  if (trend === "decreasing")
    return <span className="flex items-center gap-1 text-xs text-emerald-400"><ChevronUp className="h-3 w-3 rotate-180" /> Decreasing</span>;
  return <span className="flex items-center gap-1 text-xs text-slate-400"><Activity className="h-3 w-3" /> Stable</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PredictPage() {
  const [inputs, setInputs] = useState<Record<string, string>>(
    Object.fromEntries(inputFields.map((f) => [f.key, f.value]))
  );
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  function handleRun() {
    setRunning(true);
    setTimeout(() => { setRunning(false); setRan(true); }, 1800);
  }

  return (
    <main className="min-h-screen bg-[#04060a] text-white">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.07] bg-[#070c12]">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">
                BharatRakshak · Prediction Intelligence
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                AI Disaster Prediction Center
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Real-time disaster forecasting and risk intelligence for India
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2">
                <OnlineDot />
                <span className="text-slate-300">All Systems Nominal</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2">
                <RefreshCw className="h-3 w-3 text-cyan-400" />
                <span className="text-slate-400">Updated 12:45 IST</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2">
                <BarChart3 className="h-3 w-3 text-cyan-400" />
                <span className="text-slate-400">5 Models Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 p-6">

        {/* ── Prediction Overview Cards ─────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {predictionCards.map((card) => (
            <Card key={card.type} className="border-white/[0.07] bg-[#080f17]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <card.icon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">{card.type} Risk</span>
                  </div>
                  <TrendBadge trend={card.trend} />
                </div>

                <div className={`mt-4 inline-flex rounded border px-2.5 py-1 text-xs font-bold tracking-widest ${riskLevelStyle[card.level]}`}>
                  {card.level}
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Confidence</span>
                    <span className="font-mono font-semibold text-white">{card.confidence}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-500 transition-all duration-700" style={{ width: `${card.confidence}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {card.affected.map((r) => (
                    <span key={r} className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                      {r}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Risk Map + Input Panel ─────────────────────────────────────────── */}
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

          {/* Schematic Risk Map */}
          <Card className="border-white/[0.07] bg-[#080f17]">
            <CardContent className="p-0">
              <div className="border-b border-white/[0.07] px-5 py-4">
                <SectionLabel>National Risk Coverage Map</SectionLabel>
              </div>

              {/* SVG schematic of India with risk zones */}
              <div className="relative h-[420px] overflow-hidden bg-[#050c14]">
                <svg viewBox="0 0 480 500" className="h-full w-full opacity-90" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid lines */}
                  {[80,160,240,320,400].map(x => (
                    <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="#0d1f2d" strokeWidth="1"/>
                  ))}
                  {[80,160,240,320,400].map(y => (
                    <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#0d1f2d" strokeWidth="1"/>
                  ))}

                  {/* India outline approximation */}
                  <path
                    d="M180,30 L260,28 L300,60 L340,80 L360,130 L370,180 L350,240 L320,290 L290,350 L260,400 L240,450 L230,460 L210,430 L190,380 L170,320 L140,260 L120,200 L130,140 L150,80 Z"
                    fill="#0a1520" stroke="#1a3045" strokeWidth="2"
                  />

                  {/* Flood zone — Assam (northeast) */}
                  <ellipse cx="355" cy="110" rx="45" ry="30" fill="#06b6d4" fillOpacity="0.25" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.6">
                    <animate attributeName="fill-opacity" values="0.15;0.35;0.15" dur="3s" repeatCount="indefinite"/>
                  </ellipse>
                  <circle cx="355" cy="110" r="5" fill="#06b6d4" fillOpacity="0.9">
                    <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <text x="370" y="105" fill="#67e8f9" fontSize="9" fontFamily="monospace">FLOOD</text>
                  <text x="370" y="118" fill="#67e8f9" fontSize="8" fontFamily="monospace" opacity="0.7">Assam · 92%</text>

                  {/* Cyclone zone — Odisha (east coast) */}
                  <ellipse cx="310" cy="230" rx="40" ry="28" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.6">
                    <animate attributeName="fill-opacity" values="0.1;0.3;0.1" dur="2.5s" repeatCount="indefinite"/>
                  </ellipse>
                  <circle cx="310" cy="230" r="5" fill="#ef4444" fillOpacity="0.9">
                    <animate attributeName="r" values="4;8;4" dur="1.8s" repeatCount="indefinite"/>
                  </circle>
                  <text x="325" y="225" fill="#fca5a5" fontSize="9" fontFamily="monospace">CYCLONE</text>
                  <text x="325" y="238" fill="#fca5a5" fontSize="8" fontFamily="monospace" opacity="0.7">Odisha · 87%</text>

                  {/* Heatwave — Rajasthan (west) */}
                  <ellipse cx="165" cy="155" rx="42" ry="32" fill="#f97316" fillOpacity="0.2" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.5">
                    <animate attributeName="fill-opacity" values="0.1;0.28;0.1" dur="4s" repeatCount="indefinite"/>
                  </ellipse>
                  <circle cx="165" cy="155" r="4" fill="#f97316" fillOpacity="0.9"/>
                  <text x="142" y="148" fill="#fdba74" fontSize="9" fontFamily="monospace">HEATWAVE</text>
                  <text x="142" y="161" fill="#fdba74" fontSize="8" fontFamily="monospace" opacity="0.7">Rajasthan · 81%</text>

                  {/* Landslide — Sikkim (far northeast) */}
                  <ellipse cx="370" cy="80" rx="20" ry="16" fill="#eab308" fillOpacity="0.25" stroke="#eab308" strokeWidth="1" strokeOpacity="0.6">
                    <animate attributeName="fill-opacity" values="0.15;0.35;0.15" dur="3.5s" repeatCount="indefinite"/>
                  </ellipse>
                  <circle cx="370" cy="80" r="3" fill="#eab308" fillOpacity="0.9"/>
                  <text x="375" y="77" fill="#fde047" fontSize="8" fontFamily="monospace">LANDSLIDE</text>
                  <text x="375" y="89" fill="#fde047" fontSize="7" fontFamily="monospace" opacity="0.7">Sikkim · 78%</text>

                  {/* SOS ping — Chennai */}
                  <circle cx="260" cy="350" r="4" fill="#a855f7" fillOpacity="0.9">
                    <animate attributeName="r" values="3;9;3" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="fill-opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <text x="268" y="348" fill="#d8b4fe" fontSize="8" fontFamily="monospace">SOS · Chennai</text>

                  {/* Compass */}
                  <text x="22" y="30" fill="#1e3a4f" fontSize="10" fontFamily="monospace" fontWeight="bold">N</text>
                  <line x1="28" y1="33" x2="28" y2="48" stroke="#1e3a4f" strokeWidth="1"/>

                  {/* Scale bar */}
                  <line x1="380" y1="470" x2="460" y2="470" stroke="#1e3a4f" strokeWidth="1.5"/>
                  <text x="390" y="465" fill="#1e3a4f" fontSize="8" fontFamily="monospace">500 km</text>
                </svg>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 space-y-1.5 rounded border border-white/10 bg-[#050c14]/90 px-3 py-3 text-[10px]">
                  {[
                    { color: "bg-red-500",    label: "Critical" },
                    { color: "bg-orange-500", label: "High" },
                    { color: "bg-yellow-500", label: "Moderate" },
                    { color: "bg-emerald-500",label: "Low" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-sm ${color}`} />
                      <span className="text-slate-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input Console */}
          <Card className="border-white/[0.07] bg-[#080f17]">
            <CardContent className="p-5">
              <SectionLabel>Forecast Input Console</SectionLabel>

              <div className="space-y-3">
                {inputFields.map((field) => (
                  <div key={field.key}>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        {field.label}
                      </label>
                      <span className="text-[10px] text-slate-600">{field.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        suppressHydrationWarning
                        type="number"
                        value={inputs[field.key]}
                        onChange={(e) => setInputs((p) => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full rounded border border-white/10 bg-[#050c14] px-3 py-2 font-mono text-sm text-cyan-300 outline-none focus:border-cyan-500/50 focus:ring-0"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleRun}
                disabled={running}
                className="mt-5 w-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
              >
                {running ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Running Models…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Run Prediction
                  </span>
                )}
              </Button>

              {/* Output */}
              {ran && (
                <div className="mt-5 rounded border border-orange-500/20 bg-orange-500/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold text-orange-300">{forecastOutput.type}</p>
                    <Badge className="border-orange-500/40 bg-orange-500/10 text-orange-400 text-[10px]">
                      {forecastOutput.severity}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                      <span>Risk Score</span>
                      <span className="font-mono text-orange-300">{forecastOutput.risk}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-orange-500 transition-all duration-700" style={{ width: `${forecastOutput.risk}%` }} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="mb-1.5 text-[10px] uppercase tracking-widest text-slate-600">Affected Districts</p>
                    <div className="flex flex-wrap gap-1">
                      {forecastOutput.districts.map((d) => (
                        <span key={d} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">{d}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-1.5 text-[10px] uppercase tracking-widest text-slate-600">Recommended Actions</p>
                    <ul className="space-y-1">
                      {forecastOutput.actions.map((a) => (
                        <li key={a} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Forecast Timeline ──────────────────────────────────────────────── */}
        <Card className="border-white/[0.07] bg-[#080f17]">
          <CardContent className="p-5">
            <SectionLabel>Risk Forecast Timeline</SectionLabel>

            <div className="grid grid-cols-4 gap-4">
              {forecastTimeline.map((t) => (
                <div key={t.label} className="rounded border border-white/[0.07] bg-[#050c14] p-4">
                  <p className="mb-4 text-xs font-bold text-slate-300">{t.label}</p>
                  <div className="space-y-3">
                    {[
                      { label: "Flood",    value: t.flood,   color: "bg-cyan-500" },
                      { label: "Cyclone",  value: t.cyclone, color: "bg-red-500" },
                      { label: "Heatwave", value: t.heat,    color: "bg-orange-500" },
                      { label: "Landslide",value: t.land,    color: "bg-yellow-500" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="mb-1 flex justify-between text-[10px]">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-mono text-slate-400">{value}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${color} transition-all duration-700`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Bottom Row: State Monitor + Models + Sources ───────────────────── */}
        <div className="grid gap-6 xl:grid-cols-3">

          {/* State Risk Monitor */}
          <Card className="border-white/[0.07] bg-[#080f17]">
            <CardContent className="p-5">
              <SectionLabel>Top Risk States</SectionLabel>
              <div className="space-y-4">
                {stateRisks.map((s, i) => (
                  <div key={s.state}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-right font-mono text-[10px] text-slate-600">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-medium text-slate-200">{s.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{s.type}</span>
                        <span className="font-mono text-xs font-semibold text-white">{s.pct}%</span>
                      </div>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${s.color} transition-all duration-700`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Model Status */}
          <Card className="border-white/[0.07] bg-[#080f17]">
            <CardContent className="p-5">
              <SectionLabel>AI Model Status</SectionLabel>
              <div className="space-y-3">
                {models.map((m) => (
                  <div key={m.name} className="flex items-center justify-between rounded border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Shield className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-sm text-slate-300">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <OnlineDot />
                      <span className="text-[10px] font-bold text-emerald-400">{m.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card className="border-white/[0.07] bg-[#080f17]">
            <CardContent className="p-5">
              <SectionLabel>Connected Data Sources</SectionLabel>
              <div className="space-y-3">
                {dataSources.map((ds) => (
                  <div key={ds.name} className="flex items-center justify-between rounded border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <ds.icon className="h-3.5 w-3.5 text-cyan-500/70" />
                      <span className="text-sm text-slate-300">{ds.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-400">{ds.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Alerts ticker */}
              <div className="mt-4 flex items-center gap-2 rounded border border-red-500/20 bg-red-500/5 px-3 py-2">
                <Siren className="h-4 w-4 animate-pulse text-red-400" />
                <span className="text-xs text-red-300">
                  2 critical alerts active · Cyclone + Flood
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  );
}