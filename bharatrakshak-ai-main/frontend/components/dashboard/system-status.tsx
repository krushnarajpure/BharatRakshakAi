import {
  CheckCircle2,
  RadioTower,
  Satellite,
  Cpu,
  Wifi,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const systems = [
  {
    name: "IMD Feed",
    icon: RadioTower,
    status: "Operational",
  },
  {
    name: "Satellite Feed",
    icon: Satellite,
    status: "Connected",
  },
  {
    name: "AI Engine",
    icon: Cpu,
    status: "Healthy",
  },
  {
    name: "Communication Network",
    icon: Wifi,
    status: "Online",
  },
];

export function SystemStatus() {
  return (
    <Card className="border-cyan-300/10 bg-[#08111a]">
      <CardContent className="p-5">
        <h3 className="mb-5 text-lg font-semibold text-white">
          System Status
        </h3>

        <div className="space-y-4">
          {systems.map((system) => (
            <div
              key={system.name}
              className="flex items-center justify-between border border-white/10 bg-black/30 p-3"
            >
              <div className="flex items-center gap-3">
                <system.icon className="h-5 w-5 text-cyan-300" />

                <span className="text-white">
                  {system.name}
                </span>
              </div>

              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {system.status}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}