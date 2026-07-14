// components/landing/response-workflow.tsx
import {
  BellRing,
  Crosshair,
  FileCheck2,
  RadioReceiver,
  Route,
} from "lucide-react";

const workflow = [
  {
    icon: RadioReceiver,
    title: "Ingest",
    text: "Live signals arrive from weather systems, satellite products, field officers, public helplines, and verified partner APIs.",
  },
  {
    icon: Crosshair,
    title: "Classify",
    text: "AI models score hazard type, severity, exposed population, infrastructure risk, and time-to-impact.",
  },
  {
    icon: Route,
    title: "Deploy",
    text: "The platform recommends routes, staging areas, relief assets, medical support, and district-level command tasks.",
  },
  {
    icon: BellRing,
    title: "Alert",
    text: "Approved advisories are issued by geography, language, urgency, and channel with clear escalation rules.",
  },
  {
    icon: FileCheck2,
    title: "Audit",
    text: "Every forecast, decision, deployment, alert, and override is preserved for review, reporting, and institutional learning.",
  },
];

export function ResponseWorkflow() {
  return (
      <section
        id="workflow"
        className="border-b border-white/10 bg-[#070a0f] px-4 py-20 sm:px-6 lg:px-8"
      >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-300">
              Disaster Response Workflow
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-5xl">
              From signal to action in minutes.
            </h2>
          </div>
          <p className="text-sm leading-7 text-slate-400">
            BharatRakshak AI turns fragmented emergency information into a
            disciplined operating cycle for commanders, analysts, and field
            units.
          </p>
        </div>

        <div className="grid gap-3">
          {workflow.map((step, index) => (
            <div
              key={step.title}
              className="grid gap-4 border border-white/10 bg-white/[0.03] p-5 md:grid-cols-[120px_72px_1fr]"
            >
              <div className="font-mono text-sm text-slate-500">
                STEP {String(index + 1).padStart(2, "0")}
              </div>
              <div className="flex h-12 w-12 items-center justify-center border border-cyan-300/20 bg-cyan-300/10">
                <step.icon className="h-6 w-6 text-cyan-200" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-400">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}