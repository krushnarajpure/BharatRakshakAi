import {
  Play,
  Radio,
} from "lucide-react";

export function DemoVideoSection() {
  return (
    <section className="border-y border-white/10 bg-[#05070a] py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12">
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">
            Mission Demonstration
          </div>

          <h2 className="mt-4 text-4xl font-semibold text-white">
            Disaster Response Simulation
          </h2>

          <p className="mt-4 max-w-2xl text-slate-400">
            Observe how alerts, responder deployments,
            evacuation recommendations, and SOS
            coordination are managed from a single
            national command center.
          </p>
        </div>

        <div className="overflow-hidden border border-cyan-300/20 bg-[#08111a]">
          <div className="aspect-video relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_70%)]" />

            <div className="absolute inset-0 flex items-center justify-center">
              <button className="flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 backdrop-blur">
                <Play className="h-10 w-10 text-cyan-300" />
              </button>
            </div>

            <div className="absolute left-6 top-6 flex items-center gap-2 border border-cyan-300/20 bg-black/50 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200">
              <Radio className="h-4 w-4" />
              Live Scenario Playback
            </div>

            <div className="absolute bottom-6 left-6 flex gap-4">
              <Status text="SOS Intake" />
              <Status text="Responder Routing" />
              <Status text="Alert Broadcast" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Status({
  text,
}: {
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-300">
      {text}
    </div>
  );
}