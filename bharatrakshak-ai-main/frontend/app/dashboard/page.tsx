import {
  AlertTriangle,
  Shield,
  Users,
  Siren,
  Radio,
  Activity,
} from "lucide-react";

import { DisasterMapPreview } from "@/components/landing/disaster-map-preview";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    title: "Active Incidents",
    value: "18",
    icon: AlertTriangle,
    iconColor: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    title: "SOS Requests",
    value: "246",
    icon: Siren,
    iconColor: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    title: "Teams Active",
    value: "58",
    icon: Users,
    iconColor: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    title: "Risk Regions",
    value: "12",
    icon: Shield,
    iconColor: "text-yellow-300",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
] as const;

const alerts = [
  { text: "Cyclone Warning — Odisha Coast", severity: "critical" as const },
  { text: "Flood Alert — Assam Basin", severity: "critical" as const },
  { text: "Heatwave Advisory — Rajasthan", severity: "high" as const },
  { text: "Landslide Watch — Sikkim", severity: "moderate" as const },
];

const sosRequests = [
  {
    id: "SOS-1045",
    location: "Chennai",
    priority: "Critical" as const,
    status: "Awaiting Team",
    statusType: "awaiting" as const,
  },
  {
    id: "SOS-1046",
    location: "Assam",
    priority: "High" as const,
    status: "Assigned",
    statusType: "assigned" as const,
  },
  {
    id: "SOS-1047",
    location: "Odisha",
    priority: "Critical" as const,
    status: "En Route",
    statusType: "enroute" as const,
  },
];

const systemStatus = [
  { label: "IMD Feed", status: "Operational", type: "ok" },
  { label: "ISRO Satellite", status: "Connected", type: "ok" },
  { label: "Emergency Relay", status: "Active", type: "ok" },
  { label: "AI Engine", status: "Healthy", type: "ok" },
];

const recentEvents = [
  "NDRF Team deployed to Odisha",
  "SOS Request escalated from Chennai",
  "Heatwave advisory issued",
  "Flood watch expanded in Assam",
  "Satellite imagery processed",
];

const alertSeverityStyles: Record<"critical" | "high" | "moderate", string> = {
  critical: "border-l-4 border-red-500 bg-red-500/10 text-red-200",
  high: "border-l-4 border-orange-400 bg-orange-500/10 text-orange-200",
  moderate: "border-l-4 border-yellow-400 bg-yellow-500/10 text-yellow-200",
};

const priorityBadge: Record<"Critical" | "High", string> = {
  Critical:
    "bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full",
  High: "bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full",
};

const statusBadge: Record<"awaiting" | "assigned" | "enroute", string> = {
  awaiting: "text-red-400",
  assigned: "text-yellow-300",
  enroute: "text-cyan-300",
};

const statusDot: Record<"awaiting" | "assigned" | "enroute", string> = {
  awaiting: "bg-red-400 animate-pulse",
  assigned: "bg-yellow-400",
  enroute: "bg-cyan-400",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="border-b border-white/10 bg-[#08111a]">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            BharatRakshak · AI Operations
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            National Command Center
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* ── Stat Cards ─────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className={`border ${stat.border} ${stat.bg} bg-[#08111a]`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-slate-400">
                    {stat.title}
                  </p>
                  <stat.icon
                    className={`h-5 w-5 ${stat.iconColor} opacity-80`}
                  />
                </div>
                <p className="mt-3 text-4xl font-bold tabular-nums text-white">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Map + Right Sidebar ─────────────────────────────── */}
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          {/* Map */}
          <Card className="border-white/10 bg-[#08111a]">
            <CardContent className="p-0">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Live Coverage Map
                </p>
              </div>
              <DisasterMapPreview />
            </CardContent>
          </Card>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Live Alerts */}
            <Card className="border-white/10 bg-[#08111a]">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Radio className="h-4 w-4 text-cyan-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Live Alerts
                  </p>
                </div>

                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.text}
                      className={`rounded-sm px-3 py-2.5 text-sm font-medium leading-snug ${alertSeverityStyles[alert.severity]}`}
                    >
                      {alert.text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-white/10 bg-[#08111a]">
              <CardContent className="p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  System Status
                </p>

                <div className="space-y-3">
                  {systemStatus.map(({ label, status }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-slate-300">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">
                          {status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Bottom Row ─────────────────────────────────────── */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* SOS Requests Table */}
          <Card className="border-white/10 bg-[#08111a]">
            <CardContent className="p-5">
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Recent SOS Requests
              </p>

              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="w-[22%] pb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      ID
                    </th>
                    <th className="w-[22%] pb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Location
                    </th>
                    <th className="w-[22%] pb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Priority
                    </th>
                    <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sosRequests.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-3 font-mono text-xs text-slate-300">
                        {row.id}
                      </td>
                      <td className="py-3 font-medium text-white">
                        {row.location}
                      </td>
                      <td className="py-3">
                        <span className={priorityBadge[row.priority]}>
                          {row.priority}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 flex-shrink-0 rounded-full ${statusDot[row.statusType]}`}
                          />
                          <span
                            className={`text-sm font-medium ${statusBadge[row.statusType]}`}
                          >
                            {row.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Events Feed */}
          <Card className="border-white/10 bg-[#08111a]">
            <CardContent className="p-5">
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Recent Events Feed
              </p>

              <div className="space-y-1">
                {recentEvents.map((event, i) => (
                  <div
                    key={event}
                    className="flex items-start gap-3 rounded px-2 py-2.5 hover:bg-white/5"
                  >
                    <Activity className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {event}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {i === 0 ? "Just now" : `${(i + 1) * 3}m ago`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}