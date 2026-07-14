import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Building2,
  ArrowRight,
} from "lucide-react";

const roles = [
  {
    title: "Citizen",
    href: "/login?role=citizen",
    icon: Users,
    items: [
      "Report emergencies",
      "Receive alerts",
      "Request rescue",
    ],
  },
  {
    title: "Responder",
    href: "/login?role=responder",
    icon: ShieldCheck,
    items: [
      "View SOS requests",
      "Manage rescue operations",
      "Update mission status",
    ],
  },
  {
    title: "Authority",
    href: "/login?role=authority",
    icon: Building2,
    items: [
      "Monitor disasters",
      "Issue alerts",
      "Allocate resources",
    ],
  },
];

export function RoleSelection() {
  return (
    <section className="bg-[#05070a] py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">
            Access Control
          </div>

          <h2 className="mt-4 text-4xl font-semibold text-white">
            Choose Your Role
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <Link
                key={role.title}
                href={role.href}
                className="group border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-cyan-300/30 hover:bg-cyan-300/[0.04]"
              >
                <Icon className="h-10 w-10 text-cyan-300" />

                <h3 className="mt-6 text-2xl font-semibold text-white">
                  {role.title}
                </h3>

                <ul className="mt-5 space-y-3 text-sm text-slate-400">
                  {role.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>

                <div className="mt-8 flex items-center text-cyan-300">
                  Open Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}