import {
  Database,
  Cpu,
  Radar,
  Shield,
  Radio,
  GitBranch,
} from "lucide-react";

const layers = [
  {
    title: "Sensor Layer",
    icon: Radar,
    items: [
      "IMD",
      "ISRO",
      "River Sensors",
      "Satellite Feeds",
    ],
  },
  {
    title: "National Data Fabric",
    icon: Database,
    items: [
      "District Data",
      "Risk Models",
      "Shelter Registry",
      "SOS Records",
    ],
  },
  {
    title: "AI Decision Engine",
    icon: Cpu,
    items: [
      "Forecasting",
      "Resource Planning",
      "Threat Classification",
      "Route Optimization",
    ],
  },
  {
    title: "Command Workflows",
    icon: GitBranch,
    items: [
      "Approvals",
      "Escalations",
      "Task Assignment",
      "Operations",
    ],
  },
  {
    title: "Alert Network",
    icon: Radio,
    items: [
      "SMS",
      "Apps",
      "Authorities",
      "Emergency Teams",
    ],
  },
  {
    title: "Security",
    icon: Shield,
    items: [
      "RBAC",
      "Audit Logs",
      "Encryption",
      "Compliance",
    ],
  },
];

export function InteractiveArchitecture() {
  return (
    <section
      id="architecture"
      className="bg-[#070a0f] py-24"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12">
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">
            System Architecture
          </div>

          <h2 className="mt-4 text-4xl font-semibold text-white">
            National Emergency Operating Stack
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {layers.map((layer) => (
            <div
              key={layer.title}
              className="group border border-white/10 bg-[#08111a] p-6 transition-all hover:border-cyan-300/30"
            >
              <layer.icon className="h-8 w-8 text-cyan-300" />

              <h3 className="mt-5 text-xl font-semibold text-white">
                {layer.title}
              </h3>

              <div className="mt-5 grid gap-2">
                {layer.items.map((item) => (
                  <div
                    key={item}
                    className="border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}