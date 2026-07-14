import {
  Activity,
  AlertTriangle,
  Radio,
  Shield,
} from "lucide-react";

const events = [
  {
    time: "09:15",
    icon: AlertTriangle,
    event: "Cyclone risk elevated",
  },
  {
    time: "09:26",
    icon: Radio,
    event: "Authority notified",
  },
  {
    time: "09:41",
    icon: Activity,
    event: "SOS reports received",
  },
  {
    time: "10:02",
    icon: Shield,
    event: "NDRF deployment approved",
  },
];

export function CommandTimeline() {
  return (
    <div className="border border-white/10 bg-[#08111a] p-5">
      <h3 className="mb-5 text-lg text-white">
        Operations Timeline
      </h3>

      <div className="space-y-5">
        {events.map((event) => (
          <div
            key={event.time}
            className="flex gap-4"
          >
            <div className="text-sm text-cyan-300">
              {event.time}
            </div>

            <event.icon className="h-4 w-4 text-cyan-300" />

            <div className="text-sm text-slate-300">
              {event.event}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}