// components/landing/command-cta.tsx
import { ArrowRight, CheckCircle2, Command, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CommandCta() {
  return (
    <section className="bg-[#070a0f] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl border border-cyan-300/20 bg-[#08111a]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.22em] text-cyan-200">
              <Command className="h-4 w-4" />
              Command Readiness
            </div>
            <h2 className="mt-6 max-w-3xl text-3xl font-semibold tracking-normal text-white sm:text-5xl">
              Deploy BharatRakshak AI as the operating layer for resilient
              India.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
              Give emergency leaders a single, trusted command surface for
              anticipating disasters, coordinating agencies, and protecting
              citizens at speed.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 rounded-none bg-cyan-300 px-6 font-semibold text-slate-950 hover:bg-cyan-200">
                Request Command Briefing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-none border-white/15 bg-white/5 px-6 text-slate-100 hover:bg-white/10 hover:text-white"
              >
                <Shield className="mr-2 h-4 w-4" />
                Security Overview
              </Button>
            </div>
          </div>

          <div className="border border-white/10 bg-slate-950/60 p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Deployment Checklist
            </div>
            <div className="mt-5 grid gap-4">
              {[
                "National and state command views",
                "District-level responder workflows",
                "AI-assisted alerts and SITREPs",
                "Secure audit trail for every action",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
              <div className="text-2xl font-semibold text-emerald-200">
                24/7
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-300/80">
                Emergency Operations Ready
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}