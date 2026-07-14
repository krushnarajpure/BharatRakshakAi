import {
  Activity,
  AlertTriangle,
  Radio,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const incidents = [
  {
    time: "09:12",
    event: "Cyclone intensity increased",
    region: "Odisha Coast",
    icon: AlertTriangle,
  },
  {
    time: "09:24",
    event: "Flood warning issued",
    region: "Assam Basin",
    icon: Radio,
  },
  {
    time: "09:41",
    event: "NDRF Team deployed",
    region: "Chennai",
    icon: Activity,
  },
  {
    time: "10:02",
    event: "Heatwave advisory broadcast",
    region: "Rajasthan",
    icon: AlertTriangle,
  },
];

export function IncidentFeed() {
  return (
    <Card className="border-cyan-300/10 bg-[#08111a]">
      <CardContent className="p-5">
        <h3 className="mb-5 text-lg font-semibold text-white">
          Incident Feed
        </h3>

        <div className="space-y-4">
          {incidents.map((incident) => (
            <div
              key={`${incident.time}-${incident.event}`}
              className="flex gap-4 border-b border-white/10 pb-4"
            >
              <incident.icon className="mt-1 h-4 w-4 text-cyan-300" />

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white">
                    {incident.event}
                  </span>

                  <span className="text-xs text-slate-500">
                    {incident.time}
                  </span>
                </div>

                <div className="mt-1 text-sm text-slate-400">
                  {incident.region}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}