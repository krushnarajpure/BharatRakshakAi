// components/landing/core-features.tsx
import {
  BrainCircuit,
  ClipboardCheck,
  Network,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Threat Fusion",
    description:
      "Correlates satellite data, IMD feeds, social signals, district reports, and historical vulnerability to detect escalation early.",
  },
  {
    icon: Network,
    title: "Inter-Agency Coordination",
    description:
      "Creates a shared operational layer for NDMA, SDMAs, NDRF, district collectors, police, health, and utility teams.",
  },
  {
    icon: ClipboardCheck,
    title: "Resource Tasking",
    description:
      "Prioritizes shelters, ambulances, rescue boats, power restoration teams, medical stock, and logistics routes by impact zone.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Public Alerts",
    description:
      "Generates multilingual, geo-targeted advisories with approval workflows, audit trails, and misinformation safeguards.",
  },
];

export function CoreFeatures() {
  return (
    <section
      id="features"
      className="border-b border-white/10 bg-[#05070a] px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-300">
            Four Core Features
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-5xl">
            Built for command decisions under pressure.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-cyan-300/30 hover:bg-cyan-300/[0.04]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center border border-cyan-300/20 bg-cyan-300/10">
                  <feature.icon className="h-6 w-6 text-cyan-200" />
                </div>
                <span className="font-mono text-xs text-slate-600">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-8 text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}