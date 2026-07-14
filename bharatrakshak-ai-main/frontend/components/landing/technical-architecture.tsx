// components/landing/technical-architecture.tsx
import {
  Cpu,
  Database,
  GitBranch,
  LockKeyhole,
  Radar,
  ServerCog,
} from "lucide-react";

const layers = [
  {
    icon: Radar,
    title: "Sensor & Signal Layer",
    items: ["IMD feeds", "Satellite products", "Field reports", "Helpline data"],
  },
  {
    icon: Database,
    title: "National Data Fabric",
    items: ["District graph", "Asset registry", "Risk history", "Relief inventory"],
  },
  {
    icon: Cpu,
    title: "AI Decision Engine",
    items: ["Severity scoring", "Impact forecast", "Route priority", "Alert drafting"],
  },
  {
    icon: GitBranch,
    title: "Command Workflows",
    items: ["Approvals", "Tasking", "Escalation", "Situation reports"],
  },
  {
    icon: ServerCog,
    title: "Deployment Plane",
    items: ["Cloud-ready", "Offline mode", "API gateway", "Observability"],
  },
  {
    icon: LockKeyhole,
    title: "Governance & Security",
    items: ["RBAC", "Audit logs", "Data lineage", "Policy controls"],
  },
];

export function TechnicalArchitecture() {
  return (
    <section className="border-b border-white/10 bg-[#05070a] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-300">
            Technical Architecture
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-5xl">
            Secure infrastructure for national emergency operations.
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {layers.map((layer) => (
            <div
              key={layer.title}
              className="border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-cyan-300/20 bg-cyan-300/10">
                  <layer.icon className="h-5 w-5 text-cyan-200" />
                </div>
                <h3 className="font-semibold text-white">{layer.title}</h3>
              </div>

              <div className="mt-6 grid gap-2">
                {layer.items.map((item) => (
                  <div
                    key={item}
                    className="border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border border-cyan-300/20 bg-cyan-300/[0.04] p-5">
          <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-3">
            <div>
              <span className="text-cyan-200">Latency Target:</span> Sub-minute
              operational refresh
            </div>
            <div>
              <span className="text-cyan-200">Security Model:</span> Role-based
              access with full auditability
            </div>
            <div>
              <span className="text-cyan-200">Deployment:</span> National,
              state, and district command tiers
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}