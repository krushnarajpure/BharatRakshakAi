import {
  AlertTriangle,
  CloudRain,
  Thermometer,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const alerts = [
  {
    title: "Cyclone Warning",
    location: "Odisha",
    icon: AlertTriangle,
    severity: "Critical",
    color: "text-red-400",
  },
  {
    title: "Flood Alert",
    location: "Assam",
    icon: CloudRain,
    severity: "High",
    color: "text-cyan-300",
  },
  {
    title: "Heatwave",
    location: "Rajasthan",
    icon: Thermometer,
    severity: "Moderate",
    color: "text-yellow-300",
  },
];

export function LiveAlerts() {
  return (
    <Card className="border-cyan-300/10 bg-[#08111a]">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold text-white">
          Live Alerts
        </h3>

        <div className="mt-5 space-y-3">
          {alerts.map((alert) => (
            <div
              key={`${alert.title}-${alert.location}`}
              className="border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <alert.icon
                    className={`h-5 w-5 ${alert.color}`}
                  />

                  <div>
                    <div className="font-medium text-white">
                      {alert.title}
                    </div>

                    <div className="text-sm text-slate-400">
                      {alert.location}
                    </div>
                  </div>
                </div>

                <span className={alert.color}>
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}