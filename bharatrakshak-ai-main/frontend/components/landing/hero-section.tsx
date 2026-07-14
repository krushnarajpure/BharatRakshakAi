// components/landing/hero-section.tsx
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Command,
  Radio,
  Satellite,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const telemetry = [
  { label: "Active Incidents", value: "47", tone: "text-red-300" },
  { label: "Districts Monitored", value: "742", tone: "text-cyan-200" },
  { label: "Response Windows", value: "08m", tone: "text-emerald-300" },
];

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#05070a]">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#05070a] to-transparent" />

      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100">
            <Satellite className="h-4 w-4" />
            BharatRakshak AI Command Grid
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-white sm:text-6xl lg:text-7xl">
            India&apos;s AI disaster command center for coordinated response.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Fuse satellite intelligence, district-level alerts, responder
            logistics, and field reports into one operational picture built for
            national-scale crisis response.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 rounded-none bg-cyan-300 px-6 font-semibold text-slate-950 hover:bg-cyan-200"
            >
              <Link href="/dashboard">
                National Command Center
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-none border-white/15 bg-white/5 px-6 text-slate-100 hover:bg-white/10 hover:text-white"
            >
              <Radio className="mr-2 h-4 w-4" />
              View Live Protocol
            </Button>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 border border-white/10 sm:grid-cols-3">
            {telemetry.map((item) => (
              <div
                key={item.label}
                className="border-b border-white/10 bg-white/[0.03] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <div className={`text-3xl font-semibold ${item.tone}`}>
                  {item.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="border border-cyan-300/20 bg-slate-950/70 shadow-2xl shadow-cyan-950/40 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <Command className="h-4 w-4 text-cyan-300" />
                National Operations Feed
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                Live
              </div>
            </div>

            <div className="grid gap-3 p-4">
              <CommandFeedItem
                icon={ShieldAlert}
                label="Cyclone Escalation"
                location="Odisha Coast"
                time="T+03:14"
                severity="Critical"
              />
              <CommandFeedItem
                icon={AlertTriangle}
                label="Urban Flooding"
                location="Chennai Zone-IV"
                time="T+07:42"
                severity="High"
              />
              <CommandFeedItem
                icon={Activity}
                label="Landslide Probability"
                location="Sikkim Corridor"
                time="T+11:09"
                severity="Watch"
              />
            </div>

            <div className="grid grid-cols-3 border-t border-white/10 text-center">
              {["IMD", "ISRO", "NDRF"].map((agency) => (
                <div
                  key={agency}
                  className="border-r border-white/10 px-3 py-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-300 last:border-r-0"
                >
                  {agency}
                  <div className="mt-1 text-[10px] text-emerald-300">
                    Synced
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -right-4 -top-4 hidden border border-red-300/30 bg-red-950/40 px-4 py-3 text-xs uppercase tracking-[0.2em] text-red-100 lg:block">
            Severity Index 8.7
          </div>
        </div>
      </div>
    </section>
  );
}

type CommandFeedItemProps = {
  icon: React.ElementType;
  label: string;
  location: string;
  time: string;
  severity: string;
};

function CommandFeedItem({
  icon: Icon,
  label,
  location,
  time,
  severity,
}: CommandFeedItemProps) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-3 border border-white/10 bg-white/[0.03] p-4">
      <div className="flex h-10 w-10 items-center justify-center border border-cyan-300/20 bg-cyan-300/10">
        <Icon className="h-5 w-5 text-cyan-200" />
      </div>
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="mt-1 text-sm text-slate-400">{location}</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-500">{time}</div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-red-300">
          {severity}
        </div>
      </div>
    </div>
  );
}