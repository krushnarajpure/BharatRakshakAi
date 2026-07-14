"use client";

import dynamic from "next/dynamic";
import { Activity, Clock, Users, type LucideIcon } from "lucide-react";

const IndiaOperationsMap = dynamic(
  () =>
    import("@/components/maps/india-operations-map").then(
      (m) => m.IndiaOperationsMap
    ),
  { ssr: false }
);

export function DisasterMapPreview() {
  return (
    <section id="map" className="bg-[#070a0f] px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">
            Live Operations Map
          </div>
          <h2 className="mt-3 text-4xl font-semibold text-white">
            National Disaster Operating Picture
          </h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="overflow-hidden border border-white/10">
            <IndiaOperationsMap />
          </div>

          <div className="space-y-4">
            <Panel icon={Activity} title="Incident Count" value="18" />
            <Panel icon={Users} title="Active Responders" value="58" />
            <Panel icon={Clock} title="Last Update" value="12:45 IST" />

            <div className="border border-white/10 bg-[#08111a] p-5">
              <h3 className="mb-4 text-white">Severity Legend</h3>
              <div className="space-y-3 text-sm">
                <Legend color="bg-red-500" text="Critical" />
                <Legend color="bg-orange-500" text="High" />
                <Legend color="bg-yellow-500" text="Moderate" />
                <Legend color="bg-green-500" text="Operational" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({
  icon: Icon,
  title,
  value,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-[#08111a] p-5">
      <Icon className="h-5 w-5 text-cyan-300" />
      <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{title}</div>
    </div>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-3 w-3 ${color}`} />
      <span>{text}</span>
    </div>
  );
}