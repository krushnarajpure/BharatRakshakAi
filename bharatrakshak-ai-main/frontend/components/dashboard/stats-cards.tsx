import {
  AlertTriangle,
  Siren,
  Users,
  ShieldAlert,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    title: "Active Incidents",
    value: 47,
    icon: AlertTriangle,
    color: "text-red-400",
  },
  {
    title: "SOS Requests",
    value: 126,
    icon: Siren,
    color: "text-orange-400",
  },
  {
    title: "Teams Active",
    value: 34,
    icon: Users,
    color: "text-cyan-300",
  },
  {
    title: "High Risk Regions",
    value: 18,
    icon: ShieldAlert,
    color: "text-yellow-300",
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="border-cyan-300/10 bg-[#08111a]"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <stat.icon
                className={`h-6 w-6 ${stat.color}`}
              />

              <span className="text-xs uppercase tracking-widest text-slate-500">
                Live
              </span>
            </div>

            <div className="mt-6 text-4xl font-semibold text-white">
              {stat.value}
            </div>

            <div className="mt-2 text-sm text-slate-400">
              {stat.title}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}