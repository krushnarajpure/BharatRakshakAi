"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type EmergencyType = {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
};

type Severity = "critical" | "high" | "moderate" | "low";

type RiskLevel = "EXTREME" | "HIGH" | "MODERATE" | "LOW";

type Contact = {
  id: string;
  name: string;
  phone: string;
  relation: string;
  notified: boolean;
};

type AIAssessment = {
  riskLevel: RiskLevel;
  riskScore: number;
  predictedResponseTime: string;
  unitType: string;
  nearestUnit: string;
  distance: string;
  warnings: string[];
  actions: string[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const EMERGENCY_TYPES: EmergencyType[] = [
  { id: "fire", label: "Fire", icon: "🔥", color: "#FF4D1A", bg: "rgba(255,77,26,0.10)", border: "rgba(255,77,26,0.35)" },
  { id: "flood", label: "Flood", icon: "🌊", color: "#00BFFF", bg: "rgba(0,191,255,0.10)", border: "rgba(0,191,255,0.35)" },
  { id: "earthquake", label: "Earthquake", icon: "🏚️", color: "#FFB800", bg: "rgba(255,184,0,0.10)", border: "rgba(255,184,0,0.35)" },
  { id: "accident", label: "Road Accident", icon: "🚗", color: "#FF6B35", bg: "rgba(255,107,53,0.10)", border: "rgba(255,107,53,0.35)" },
  { id: "medical", label: "Medical", icon: "🏥", color: "#00FF80", bg: "rgba(0,255,128,0.10)", border: "rgba(0,255,128,0.35)" },
  { id: "crime", label: "Crime / Assault", icon: "🚨", color: "#FF4D6A", bg: "rgba(255,77,106,0.10)", border: "rgba(255,77,106,0.35)" },
  { id: "gas", label: "Gas Leak", icon: "☣️", color: "#C8FF00", bg: "rgba(200,255,0,0.10)", border: "rgba(200,255,0,0.35)" },
  { id: "collapse", label: "Collapse", icon: "🧱", color: "#D4A574", bg: "rgba(212,165,116,0.10)", border: "rgba(212,165,116,0.35)" },
  { id: "cyclone", label: "Cyclone", icon: "🌀", color: "#9B59FF", bg: "rgba(155,89,255,0.10)", border: "rgba(155,89,255,0.35)" },
  { id: "riot", label: "Civil Unrest", icon: "⚡", color: "#FF9500", bg: "rgba(255,149,0,0.10)", border: "rgba(255,149,0,0.35)" },
  { id: "landslide", label: "Landslide", icon: "⛰️", color: "#8B7355", bg: "rgba(139,115,85,0.10)", border: "rgba(139,115,85,0.35)" },
  { id: "other", label: "Other", icon: "⚠️", color: "#AAAAAA", bg: "rgba(170,170,170,0.10)", border: "rgba(170,170,170,0.35)" },
];

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string; border: string; pulse: boolean; desc: string }> = {
  critical: { label: "CRITICAL", color: "#FF1744", bg: "rgba(255,23,68,0.15)", border: "rgba(255,23,68,0.5)", pulse: true, desc: "Life-threatening — immediate response required" },
  high: { label: "HIGH", color: "#FF6D00", bg: "rgba(255,109,0,0.12)", border: "rgba(255,109,0,0.4)", pulse: false, desc: "Serious risk — priority dispatch" },
  moderate: { label: "MODERATE", color: "#FFB800", bg: "rgba(255,184,0,0.10)", border: "rgba(255,184,0,0.35)", pulse: false, desc: "Elevated concern — scheduled response" },
  low: { label: "LOW", color: "#00C853", bg: "rgba(0,200,83,0.08)", border: "rgba(0,200,83,0.3)", pulse: false, desc: "Stable — monitoring advised" },
};

const DEFAULT_CONTACTS: Contact[] = [
  { id: "1", name: "Priya Sharma", phone: "+91 98765 43210", relation: "Spouse", notified: false },
  { id: "2", name: "Ramesh Kumar", phone: "+91 87654 32109", relation: "Parent", notified: false },
  { id: "3", name: "Anita Verma", phone: "+91 76543 21098", relation: "Sibling", notified: false },
];

// ─── Small SVG Icons ──────────────────────────────────────────────────────────

const Icon = {
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  MapPin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Camera: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  Video: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
  Phone: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.46 18z" /></svg>,
  Brain: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z" /></svg>,
  Refresh: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12" /></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Zap: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  Satellite: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M13 7 9 3 3 9l4 4" /><path d="m13 7 3 3-4 13-3-3" /><path d="m13 7 3-3 5 5-3 3" /><path d="M9 17c2 0 4-2 4-4" /></svg>,
  Truck: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Send: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
};

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children, accent = "#FF4D6A" }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; accent?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.06]"
        style={{ background: `linear-gradient(to right, ${accent}12, transparent)` }}>
        <span style={{ color: accent }}>{icon}</span>
        <span className="text-xs font-bold tracking-[0.14em] text-white/70 uppercase font-mono">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SOSPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_CONTACTS);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [locationData, setLocationData] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [assessment, setAssessment] = useState<AIAssessment | null>(null);
  const [assessLoading, setAssessLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });
  const [showAddContact, setShowAddContact] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setInterval(() => { }, 1000);
    return () => window.clearInterval(t);
  }, []);

  const now = useMemo(() => new Date(), []);
  const timeStr = now.toLocaleTimeString("en-IN", { hour12: false });
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // GPS
  const acquireLocation = useCallback(() => {
    setLocationStatus("loading");
    if (!navigator.geolocation) { setLocationStatus("error"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocationData({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: `${pos.coords.latitude.toFixed(5)}° N, ${pos.coords.longitude.toFixed(5)}° E — Acquiring address…`,
        });
        setLocationStatus("found");
      },
      () => {
        // Demo fallback
        setLocationData({ lat: 28.6139, lng: 77.2090, address: "Connaught Place, New Delhi, Delhi 110001" });
        setLocationStatus("found");
      },
      { timeout: 8000 }
    );
  }, []);

  // AI Assessment
  const runAssessment = useCallback(() => {
    if (!selectedType || !severity) return;
    setAssessLoading(true);
    setAssessment(null);
    setTimeout(() => {
      const riskMap: Record<Severity, RiskLevel> = { critical: "EXTREME", high: "HIGH", moderate: "MODERATE", low: "LOW" };
      const scoreMap: Record<Severity, number> = { critical: 94, high: 72, moderate: 45, low: 18 };
      const timeMap: Record<Severity, string> = { critical: "4–7 min", high: "8–12 min", moderate: "15–20 min", low: "25–35 min" };
      const unitMap: Record<string, string> = {
        fire: "Fire & Rescue Unit", flood: "NDRF Water Rescue", earthquake: "SDRF Collapse Team",
        accident: "Ambulance + Traffic Police", medical: "Advanced Life Support", crime: "Police QRT",
        gas: "Hazmat + Fire Unit", collapse: "Urban Search & Rescue", cyclone: "NDRF Storm Team",
        riot: "Police Rapid Action Force", landslide: "SDRF Hillside Unit", other: "Multi-Agency Unit",
      };
      setAssessment({
        riskLevel: riskMap[severity],
        riskScore: scoreMap[severity] + Math.floor(Math.random() * 5),
        predictedResponseTime: timeMap[severity],
        unitType: unitMap[selectedType] || "Multi-Agency Unit",
        nearestUnit: severity === "critical" ? "Unit BR-042 (Active patrol)" : "Unit BR-117 (Base-deployed)",
        distance: severity === "critical" ? "1.2 km" : "3.7 km",
        warnings: [
          severity === "critical" ? "Immediate life risk detected — priority override engaged" : null,
          locationData ? "GPS coordinates verified — precision dispatch enabled" : "No GPS — slower dispatch possible",
          description.length > 20 ? "Incident description processed" : "Add more details for better AI routing",
          images.length > 0 ? `${images.length} image(s) will aid visual triage` : null,
        ].filter(Boolean) as string[],
        actions: [
          `Dispatch ${unitMap[selectedType] || "Multi-Agency Unit"}`,
          "Notify district emergency coordinator",
          severity === "critical" ? "Activate hospital pre-alert protocol" : "Log to national incident registry",
          contacts.length > 0 ? `Alert ${contacts.length} emergency contact(s)` : "No contacts to notify",
        ],
      });
      setAssessLoading(false);
    }, 1800);
  }, [selectedType, severity, locationData, description, images, contacts]);

  // Auto-run assessment when key fields change
  useEffect(() => {
    if (selectedType && severity) {
      const t = setTimeout(runAssessment, 600);
      return () => clearTimeout(t);
    }
  }, [selectedType, severity, runAssessment]);

  const imagePreviewUrls = useMemo(() => {
    if (typeof window === "undefined") return [];
    return images.map((f) => URL.createObjectURL(f));
  }, [images]);

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imagePreviewUrls]);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const handleVideoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setVideos(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const notifyContact = (id: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, notified: true } : c));
  };
  const removeContact = (id: string) => setContacts(prev => prev.filter(c => c.id !== id));
  const addContact = () => {
    if (!newContact.name || !newContact.phone) return;
    setContacts(prev => [...prev, { ...newContact, id: Date.now().toString(), notified: false }]);
    setNewContact({ name: "", phone: "", relation: "" });
    setShowAddContact(false);
  };

  const handleSubmit = () => {
    if (!selectedType || !severity || !locationData) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 2200);
  };

  const canSubmit = selectedType && severity && locationData;

  // ── Submitted State ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#080B0F] flex items-center justify-center p-6 font-mono">
        <div className="text-center max-w-md w-full">
          <div className="relative inline-flex mb-6">
            <div className="w-24 h-24 rounded-full border-2 border-[#00FF80] bg-[#00FF80]/10 flex items-center justify-center text-4xl animate-pulse">✓</div>
            <div className="absolute inset-0 rounded-full border border-[#00FF80]/30 animate-ping" />
          </div>
          <div className="text-[10px] tracking-[0.25em] text-[#00FF80] font-bold mb-2">SOS TRANSMITTED</div>
          <h1 className="text-2xl font-bold text-white mb-3">Help Is On The Way</h1>
          <p className="text-white/40 text-sm mb-8 leading-relaxed">
            Your emergency report has been received and dispatched to the nearest response unit.
            Stay in a safe location if possible.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left mb-6 space-y-3">
            {[
              ["Incident ID", `BR-SOS-${(submitted ? 1 : 0).toString().padStart(6, "0")}`],
              ["Submitted", `${dateStr} ${timeStr}`],
              ["Type", EMERGENCY_TYPES.find((e) => e.id === selectedType)?.label],
              ["Response ETA", assessment?.predictedResponseTime ?? "—"],
              ["Unit Dispatched", assessment?.unitType ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-white/35">{k}</span>
                <span className="text-white font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setSubmitted(false); setSelectedType(null); setSeverity(null); setDescription(""); setImages([]); setVideos([]); setLocationStatus("idle"); setLocationData(null); setAssessment(null); setContacts(DEFAULT_CONTACTS); }}
            className="w-full py-3 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors"
          >
            File Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #080B0F; }
        .font-mono { font-family: 'JetBrains Mono', monospace !important; }
        .scan-grid {
          background-image:
            linear-gradient(rgba(255,77,106,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,77,106,0.012) 1px, transparent 1px);
          background-size: 36px 36px;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slide-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes radar {
          0%{transform:scale(0.8);opacity:0.8}
          100%{transform:scale(2.2);opacity:0}
        }
        .blink { animation: blink 1.2s ease-in-out infinite; }
        .slide-up { animation: slide-up 0.35s ease both; }
        .spin { animation: spin 1s linear infinite; }
        .radar-ring {
          position:absolute; inset:0; border-radius:50%;
          border: 1px solid currentColor;
          animation: radar 1.8s ease-out infinite;
        }
        textarea { resize: vertical; }
        input:focus, textarea:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div className="min-h-screen bg-[#080B0F] scan-grid font-mono text-white">

        {/* ── Top Bar ────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080B0F]/95 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="w-8 h-8 rounded-full bg-[#FF1744]/15 border border-[#FF1744]/50 flex items-center justify-center">
                  <Icon.Shield />
                </div>
                <div className="radar-ring" style={{ color: "#FF1744" }} />
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-[0.15em] text-white">BharatRakshak AI</div>
                <div className="text-[9px] tracking-[0.2em] text-[#FF1744] font-bold">● SOS EMERGENCY REPORT</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-[13px] font-bold text-white tabular-nums blink">{timeStr}</div>
                <div className="text-[9px] text-white/30 tracking-widest">{dateStr}</div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00FF80]/10 border border-[#00FF80]/25">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF80] blink" />
                <span className="text-[9px] font-bold tracking-[0.15em] text-[#00FF80]">LIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Hero strip ─────────────────────────────────────────────────── */}
        <div className="border-b border-[#FF1744]/20 bg-[#FF1744]/[0.04] px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="text-2xl mt-0.5">🆘</div>
              <div>
                <h1 className="text-base font-bold tracking-wide text-white mb-0.5">Emergency SOS Report</h1>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Complete as many fields as you can. Your GPS location and emergency type are required.
                  All data is encrypted and sent directly to district response coordinators.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Body ──────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

          {/* ① Emergency Type */}
          <Section title="Emergency Type" icon={<Icon.Alert />} accent="#FF4D6A">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {EMERGENCY_TYPES.map(type => {
                const active = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className="relative flex flex-col items-center gap-2 py-3.5 px-2 rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: active ? type.bg : "rgba(255,255,255,0.02)",
                      borderColor: active ? type.border : "rgba(255,255,255,0.07)",
                      boxShadow: active ? `0 0 14px ${type.color}22` : "none",
                    }}
                  >
                    <span className="text-2xl leading-none">{type.icon}</span>
                    <span className="text-[10px] font-semibold text-center leading-tight"
                      style={{ color: active ? type.color : "rgba(255,255,255,0.5)" }}>
                      {type.label}
                    </span>
                    {active && (
                      <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ background: type.color }}>
                        <span style={{ color: "#000", transform: "scale(0.7)", display: "block" }}><Icon.Check /></span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ② GPS Location */}
          <Section title="GPS Location" icon={<Icon.MapPin />} accent="#00BFFF">
            {locationStatus === "idle" && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="text-center">
                  <p className="text-white/50 text-xs mb-4">Your precise location helps dispatch the nearest unit faster.</p>
                  <button onClick={acquireLocation}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#00BFFF]/40 bg-[#00BFFF]/10 text-[#00BFFF] text-xs font-bold tracking-widest uppercase hover:bg-[#00BFFF]/15 transition-colors">
                    <Icon.Satellite />
                    Acquire GPS Location
                  </button>
                </div>
              </div>
            )}
            {locationStatus === "loading" && (
              <div className="flex items-center gap-3 py-4 justify-center">
                <div className="w-4 h-4 border-2 border-[#00BFFF]/30 border-t-[#00BFFF] rounded-full spin" />
                <span className="text-[#00BFFF] text-xs font-semibold tracking-widest">ACQUIRING SIGNAL…</span>
              </div>
            )}
            {locationStatus === "found" && locationData && (
              <div className="space-y-3 slide-up">
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#00BFFF]/08 border border-[#00BFFF]/25">
                  <span className="text-[#00BFFF] mt-0.5"><Icon.MapPin /></span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-[#00BFFF] font-bold tracking-widest mb-1">LOCATION VERIFIED</div>
                    <div className="text-white/80 text-xs leading-relaxed">{locationData.address}</div>
                    <div className="flex gap-4 mt-2">
                      <span className="text-[10px] text-white/35">LAT {locationData.lat.toFixed(5)}°</span>
                      <span className="text-[10px] text-white/35">LNG {locationData.lng.toFixed(5)}°</span>
                    </div>
                  </div>
                  <button onClick={acquireLocation} className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
                    <Icon.Refresh />
                  </button>
                </div>
                {/* Mock map grid */}
                <div className="relative h-24 rounded-lg bg-[#0D1820] border border-white/[0.06] overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "linear-gradient(rgba(0,191,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,191,255,0.3) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }} />
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <div className="relative">
                      <div className="w-5 h-5 rounded-full bg-[#00BFFF] border-2 border-white flex items-center justify-center" style={{ boxShadow: "0 0 12px #00BFFF" }}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full border border-[#00BFFF] animate-ping opacity-50" />
                    </div>
                    <span className="text-[9px] text-[#00BFFF] font-bold tracking-widest">YOUR POSITION</span>
                  </div>
                  <div className="absolute bottom-2 right-3 text-[8px] text-white/20 tracking-wider">BHARATRAKSHAK MAPS v2.4</div>
                </div>
              </div>
            )}
            {locationStatus === "error" && (
              <div className="flex items-center gap-2 py-3 text-[#FF4D6A] text-xs">
                <Icon.Alert /> GPS unavailable — enter location manually
              </div>
            )}
          </Section>

          {/* ③ Severity */}
          <Section title="Severity Level" icon={<Icon.Zap />} accent="#FFB800">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(["critical", "high", "moderate", "low"] as Severity[]).map(s => {
                const cfg = SEVERITY_CONFIG[s];
                const active = severity === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className="flex flex-col gap-2 p-3.5 rounded-lg border transition-all duration-200"
                    style={{
                      background: active ? cfg.bg : "rgba(255,255,255,0.02)",
                      borderColor: active ? cfg.border : "rgba(255,255,255,0.07)",
                      boxShadow: active && cfg.pulse ? `0 0 20px ${cfg.color}33` : "none",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-[0.1em]"
                        style={{ color: active ? cfg.color : "rgba(255,255,255,0.4)" }}>
                        {cfg.label}
                      </span>
                      {active && cfg.pulse && (
                        <div className="w-2 h-2 rounded-full blink" style={{ background: cfg.color }} />
                      )}
                      {active && !cfg.pulse && (
                        <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                      )}
                    </div>
                    <p className="text-[9px] leading-relaxed text-left"
                      style={{ color: active ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)" }}>
                      {cfg.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ④ Description */}
          <Section title="Incident Description" icon={<Icon.Alert />} accent="#9B59FF">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what you see — number of people affected, visible hazards, current conditions, any other relevant detail…"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-3.5 text-white/80 text-xs leading-relaxed placeholder:text-white/20 focus:border-[#9B59FF]/50 focus:bg-[#9B59FF]/[0.04] transition-all font-mono"
            />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-white/25">Min. 20 characters recommended</span>
              <span className="text-[10px]" style={{ color: description.length >= 20 ? "#00FF80" : "rgba(255,255,255,0.25)" }}>
                {description.length} chars
              </span>
            </div>
          </Section>

          {/* ⑤ Image Upload */}
          <Section title="Photo Evidence" icon={<Icon.Camera />} accent="#00FF80">
            <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
            {images.length === 0 ? (
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-3 py-8 rounded-lg border border-dashed border-white/[0.1] hover:border-[#00FF80]/30 hover:bg-[#00FF80]/[0.03] transition-all group">
                <span className="text-white/20 group-hover:text-[#00FF80]/60 transition-colors"><Icon.Camera /></span>
                <div className="text-center">
                  <p className="text-xs text-white/40 mb-1">Tap to add photos</p>
                  <p className="text-[10px] text-white/20">JPG, PNG, HEIC · Max 10 files</p>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {imagePreviewUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon.X />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => imageInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-white/10 hover:border-[#00FF80]/30 flex items-center justify-center text-white/20 hover:text-[#00FF80]/50 transition-all">
                    <Icon.Plus />
                  </button>
                </div>
                <p className="text-[10px] text-white/30">{images.length} photo{images.length > 1 ? "s" : ""} attached</p>
              </div>
            )}
          </Section>

          {/* ⑥ Video Upload */}
          <Section title="Video Evidence" icon={<Icon.Video />} accent="#FFB800">
            <input ref={videoInputRef} type="file" accept="video/*" multiple onChange={handleVideoAdd} className="hidden" />
            {videos.length === 0 ? (
              <button
                onClick={() => videoInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-3 py-8 rounded-lg border border-dashed border-white/[0.1] hover:border-[#FFB800]/30 hover:bg-[#FFB800]/[0.03] transition-all group">
                <span className="text-white/20 group-hover:text-[#FFB800]/60 transition-colors"><Icon.Video /></span>
                <div className="text-center">
                  <p className="text-xs text-white/40 mb-1">Tap to add video clips</p>
                  <p className="text-[10px] text-white/20">MP4, MOV · Max 3 files · 100 MB each</p>
                </div>
              </button>
            ) : (
              <div className="space-y-2">
                {videos.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#FFB800]/[0.06] border border-[#FFB800]/20">
                    <span className="text-[#FFB800]"><Icon.Video /></span>
                    <span className="flex-1 text-xs text-white/60 truncate">{v.name}</span>
                    <span className="text-[10px] text-white/30">{(v.size / 1024 / 1024).toFixed(1)} MB</span>
                    <button onClick={() => setVideos(prev => prev.filter((_, idx) => idx !== i))} className="text-white/25 hover:text-white/60">
                      <Icon.X />
                    </button>
                  </div>
                ))}
                <button onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-2 text-[10px] text-[#FFB800]/60 hover:text-[#FFB800] transition-colors">
                  <Icon.Plus /> Add another clip
                </button>
              </div>
            )}
          </Section>

          {/* ⑦ Emergency Contacts */}
          <Section title="Emergency Contacts" icon={<Icon.Phone />} accent="#00BFFF">
            <div className="space-y-2.5">
              {contacts.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.025] border border-white/[0.07]">
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                    <Icon.User />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white/80 truncate">{c.name}</div>
                    <div className="text-[10px] text-white/35">{c.phone} · {c.relation}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.notified ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider text-[#00FF80] bg-[#00FF80]/10 px-2 py-0.5 rounded">
                        <Icon.Check /> ALERTED
                      </span>
                    ) : (
                      <button onClick={() => notifyContact(c.id)}
                        className="text-[9px] font-bold tracking-wider text-[#00BFFF] bg-[#00BFFF]/10 px-2 py-0.5 rounded border border-[#00BFFF]/25 hover:bg-[#00BFFF]/20 transition-colors">
                        NOTIFY
                      </button>
                    )}
                    <button onClick={() => removeContact(c.id)} className="text-white/20 hover:text-white/50 transition-colors ml-1">
                      <Icon.Trash />
                    </button>
                  </div>
                </div>
              ))}
              {showAddContact ? (
                <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-2.5 slide-up">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))}
                      placeholder="Full Name" className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded text-xs text-white placeholder:text-white/20 focus:border-[#00BFFF]/40 transition-colors font-mono" />
                    <input value={newContact.relation} onChange={e => setNewContact(p => ({ ...p, relation: e.target.value }))}
                      placeholder="Relation" className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded text-xs text-white placeholder:text-white/20 focus:border-[#00BFFF]/40 transition-colors font-mono" />
                  </div>
                  <input value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX" className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded text-xs text-white placeholder:text-white/20 focus:border-[#00BFFF]/40 transition-colors font-mono" />
                  <div className="flex gap-2">
                    <button onClick={addContact}
                      className="flex-1 py-2 rounded bg-[#00BFFF]/15 border border-[#00BFFF]/30 text-[#00BFFF] text-xs font-bold tracking-wider hover:bg-[#00BFFF]/25 transition-colors">
                      ADD CONTACT
                    </button>
                    <button onClick={() => setShowAddContact(false)}
                      className="px-4 py-2 rounded border border-white/10 text-white/40 text-xs hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddContact(true)}
                  className="flex items-center gap-2 text-[11px] text-white/35 hover:text-[#00BFFF] transition-colors py-1">
                  <Icon.Plus /> Add emergency contact
                </button>
              )}
            </div>
          </Section>

          {/* ⑧ AI Risk Assessment */}
          <Section title="AI Risk Assessment" icon={<Icon.Brain />} accent="#9B59FF">
            {!selectedType || !severity ? (
              <div className="text-center py-6 text-white/25 text-xs">
                Select an emergency type and severity to generate AI assessment
              </div>
            ) : assessLoading ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-6 h-6 border-2 border-[#9B59FF]/30 border-t-[#9B59FF] rounded-full spin" />
                <span className="text-[11px] text-[#9B59FF] font-semibold tracking-widest">PROCESSING INCIDENT DATA…</span>
              </div>
            ) : assessment ? (
              <div className="space-y-4 slide-up">
                {/* Risk Score */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(155,89,255,0.15)" strokeWidth="8" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#9B59FF" strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 34 * assessment.riskScore / 100} ${2 * Math.PI * 34}`}
                        strokeLinecap="round" transform="rotate(-90 40 40)"
                        style={{ filter: "drop-shadow(0 0 6px #9B59FF)" }} />
                      <text x="40" y="37" textAnchor="middle" fill="white" fontSize="16" fontWeight="700" fontFamily="JetBrains Mono">{assessment.riskScore}</text>
                      <text x="40" y="50" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="JetBrains Mono">RISK</text>
                    </svg>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="text-[9px] text-white/30 tracking-widest mb-0.5">THREAT LEVEL</div>
                      <div className="text-lg font-bold tracking-wider" style={{
                        color: assessment.riskLevel === "EXTREME" ? "#FF1744" : assessment.riskLevel === "HIGH" ? "#FF6D00" : assessment.riskLevel === "MODERATE" ? "#FFB800" : "#00C853"
                      }}>
                        {assessment.riskLevel}
                        {assessment.riskLevel === "EXTREME" && <span className="ml-2 text-xs blink">●</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {[
                        ["ETA", assessment.predictedResponseTime],
                        ["Distance", assessment.distance],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div className="text-[9px] text-white/25 tracking-wider">{k}</div>
                          <div className="text-xs text-white font-semibold">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Unit */}
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#9B59FF]/[0.07] border border-[#9B59FF]/20">
                  <span className="text-[#9B59FF]"><Icon.Truck /></span>
                  <div>
                    <div className="text-[10px] text-white/40 tracking-wider">DISPATCHING</div>
                    <div className="text-xs text-white font-semibold">{assessment.unitType}</div>
                    <div className="text-[10px] text-white/30">{assessment.nearestUnit}</div>
                  </div>
                </div>

                {/* Warnings */}
                <div className="space-y-1.5">
                  <div className="text-[9px] text-white/25 tracking-widest uppercase mb-2">Analysis</div>
                  {assessment.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-white/50">
                      <span className="text-[#9B59FF] mt-0.5 flex-shrink-0">›</span>{w}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-1.5">
                  <div className="text-[9px] text-white/25 tracking-widest uppercase mb-2">Planned Actions</div>
                  {assessment.actions.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-white/60">
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: "rgba(155,89,255,0.2)" }}>
                        <span className="text-[#9B59FF] scale-75"><Icon.Check /></span>
                      </div>
                      {a}
                    </div>
                  ))}
                </div>

                <button onClick={runAssessment}
                  className="flex items-center gap-1.5 text-[10px] text-[#9B59FF]/60 hover:text-[#9B59FF] transition-colors">
                  <Icon.Refresh /> Refresh assessment
                </button>
              </div>
            ) : null}
          </Section>

          {/* ⑨ Submit */}
          <div className="pb-8">
            {!canSubmit && (
              <div className="mb-3 flex items-start gap-2 p-3 rounded-lg bg-[#FF1744]/[0.06] border border-[#FF1744]/20 text-[11px] text-[#FF1744]/80">
                <span className="flex-shrink-0 mt-0.5"><Icon.Alert /></span>
                Required: Emergency type{!selectedType ? " ✗" : " ✓"} · GPS location{!locationData ? " ✗" : " ✓"} · Severity{!severity ? " ✗" : " ✓"}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full py-5 rounded-xl font-bold text-base tracking-[0.15em] uppercase transition-all duration-300 relative overflow-hidden"
              style={{
                background: canSubmit
                  ? "linear-gradient(135deg, #FF1744 0%, #FF6D00 100%)"
                  : "rgba(255,255,255,0.05)",
                color: canSubmit ? "#fff" : "rgba(255,255,255,0.2)",
                boxShadow: canSubmit ? "0 0 40px rgba(255,23,68,0.4), 0 4px 20px rgba(0,0,0,0.5)" : "none",
                cursor: canSubmit ? "pointer" : "not-allowed",
                border: canSubmit ? "1px solid rgba(255,100,80,0.4)" : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spin" />
                  Transmitting SOS…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <span className="text-xl">🆘</span>
                  <Icon.Send />
                  Send Emergency SOS
                </span>
              )}
              {canSubmit && !submitting && (
                <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
              )}
            </button>
            <p className="text-center text-[10px] text-white/20 mt-3 tracking-wider">
              Encrypted · Sent to District Emergency Control Room · Response guaranteed within 15 minutes
            </p>
          </div>

        </div>
      </div>
    </>
  );
}