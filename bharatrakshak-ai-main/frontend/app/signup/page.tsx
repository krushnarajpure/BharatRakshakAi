"use client";

import { useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { registerWithEmail } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  state: string;
  district: string;
  address: string;
  password: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  state?: string;
  district?: string;
  password?: string;
  confirmPassword?: string;
}

// ─── Indian States & Districts ────────────────────────────────────────────────

const INDIA_STATES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kakinada", "Rajahmundry", "Kadapa", "Anantapur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tezpur", "Bomdila"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Arrah"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar"],
  "Himachal Pradesh": ["Shimla", "Mandi", "Solan", "Dharamshala", "Palampur", "Baddi"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Kalaburagi", "Ballari"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Senapati"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Ambassa"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Ghaziabad", "Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Rishikesh"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Kathua"],
  "Ladakh": ["Leh", "Kargil"],
};

const STATE_LIST = Object.keys(INDIA_STATES).sort();

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const ShieldIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const UserIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.46 18l.46-1.08z" />
  </svg>
);

const CalendarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const MapPinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const LockIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ size = 16, open = true }: { size?: number; open?: boolean }) => open ? (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const AlertIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const HomeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// ─── Scanline overlay ─────────────────────────────────────────────────────────

const ScanGrid = () => (
  <div aria-hidden="true" style={{
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `
      linear-gradient(rgba(0,255,128,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,128,0.015) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
  }} />
);

// ─── Corner brackets ──────────────────────────────────────────────────────────

const CornerBrackets = ({ color }: { color: string }) => (
  <>
    {[
      { top: -1, left: -1, rotate: "0deg" },
      { top: -1, right: -1, rotate: "90deg" },
      { bottom: -1, right: -1, rotate: "180deg" },
      { bottom: -1, left: -1, rotate: "270deg" },
    ].map((pos, i) => (
      <div key={i} style={{
        position: "absolute", width: 18, height: 18,
        borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}`,
        transform: `rotate(${pos.rotate})`,
        ...pos,
        opacity: 0.8,
      }} />
    ))}
  </>
);

// ─── Text input field ─────────────────────────────────────────────────────────

const Field = ({
  label, icon, type = "text", placeholder, value, onChange,
  accent, rightEl, autoComplete, error, hint,
}: {
  label: string;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  accent: string;
  rightEl?: React.ReactNode;
  autoComplete?: string;
  error?: string;
  hint?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.45)", textTransform: "uppercase",
        fontFamily: "'JetBrains Mono', monospace",
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: hasError ? "#FF4D6A" : focused ? accent : "rgba(255,255,255,0.3)",
          transition: "color 0.2s", pointerEvents: "none",
        }}>{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          suppressHydrationWarning
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "11px 40px 11px 40px",
            background: hasError
              ? "rgba(255,77,106,0.06)"
              : focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${hasError ? "rgba(255,77,106,0.5)" : focused ? accent : "rgba(255,255,255,0.1)"}`,
            borderRadius: 6, color: "#fff",
            fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
            outline: "none", transition: "all 0.2s",
            boxShadow: hasError
              ? "0 0 0 3px rgba(255,77,106,0.12)"
              : focused ? `0 0 0 3px ${accent}22` : "none",
          }}
        />
        {rightEl && (
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            color: "rgba(255,255,255,0.3)", cursor: "pointer",
          }}>{rightEl}</span>
        )}
      </div>
      {error && (
        <p style={{
          margin: 0, fontSize: 11, color: "#FF4D6A",
          fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 4,
        }}>
          <AlertIcon size={11} /> {error}
        </p>
      )}
      {hint && !error && (
        <p style={{
          margin: 0, fontSize: 11, color: "rgba(255,255,255,0.25)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>{hint}</p>
      )}
    </div>
  );
};

// ─── Select / Dropdown field ──────────────────────────────────────────────────

const SelectField = ({
  label, icon, value, onChange, options, placeholder, accent, error,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  accent: string;
  error?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.45)", textTransform: "uppercase",
        fontFamily: "'JetBrains Mono', monospace",
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: hasError ? "#FF4D6A" : focused ? accent : "rgba(255,255,255,0.3)",
          transition: "color 0.2s", pointerEvents: "none", zIndex: 1,
        }}>{icon}</span>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          suppressHydrationWarning
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "11px 40px 11px 40px",
            background: hasError
              ? "rgba(255,77,106,0.06)"
              : focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${hasError ? "rgba(255,77,106,0.5)" : focused ? accent : "rgba(255,255,255,0.1)"}`,
            borderRadius: 6, color: value ? "#fff" : "rgba(255,255,255,0.2)",
            fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
            outline: "none", transition: "all 0.2s",
            appearance: "none", cursor: "pointer",
            boxShadow: hasError
              ? "0 0 0 3px rgba(255,77,106,0.12)"
              : focused ? `0 0 0 3px ${accent}22` : "none",
          }}
        >
          <option value="" disabled style={{ background: "#0d1117", color: "rgba(255,255,255,0.4)" }}>
            {placeholder ?? `Select ${label}`}
          </option>
          {options.map(opt => (
            <option key={opt} value={opt} style={{ background: "#0d1117", color: "#fff" }}>
              {opt}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <span style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          pointerEvents: "none", color: "rgba(255,255,255,0.3)",
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {error && (
        <p style={{
          margin: 0, fontSize: 11, color: "#FF4D6A",
          fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 4,
        }}>
          <AlertIcon size={11} /> {error}
        </p>
      )}
    </div>
  );
};

// ─── Section divider ──────────────────────────────────────────────────────────

const SectionLabel = ({ label, accent }: { label: string; accent: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 2px" }}>
    <span style={{
      fontSize: 10, letterSpacing: "0.2em", color: accent,
      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${accent}30, transparent)` }} />
  </div>
);

// ─── Left Panel ───────────────────────────────────────────────────────────────

const LeftPanel = () => {
  const accent = "#00FF80";
  const features = [
    "Real-time crisis mapping across all districts",
    "Encrypted inter-agency communication",
    "AI-driven resource allocation & dispatch",
    "Predictive threat modelling & alerts",
  ];

  return (
    <div
      className="left-panel"
      style={{
        display: "none",
        flex: "0 0 420px",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px 40px",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.015)",
        overflow: "hidden",
      }}
    >
      <div>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
          <div style={{ position: "relative", animation: "float 3s ease-in-out infinite" }}>
            <div style={{
              position: "absolute", inset: -6, borderRadius: "50%",
              border: `1px solid ${accent}`,
              animation: "pulse-ring 2.5s ease-out infinite",
            }} />
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `${accent}22`, border: `2px solid ${accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ShieldIcon size={20} color={accent} />
            </div>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>
              BharatRakshak
            </p>
            <p style={{ margin: 0, fontSize: 10, color: accent, letterSpacing: "0.2em", fontWeight: 600 }}>
              AI COMMAND CENTER
            </p>
          </div>
        </div>

        {/* Citizen badge */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 4,
            background: `${accent}15`, border: `1px solid ${accent}40`,
            marginBottom: 20,
          }}>
            <span style={{ color: accent, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", fontFamily: "'JetBrains Mono', monospace" }}>
              ● PUBLIC ACCESS
            </span>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 16px", borderRadius: 8,
            background: `${accent}14`, border: `1px solid ${accent}40`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `${accent}18`, border: `1.5px solid ${accent}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ color: accent }}><PhoneIcon size={14} /></span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: accent, fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                  Citizen
                </span>
                <span style={{
                  fontSize: 9, padding: "2px 6px", borderRadius: 3,
                  background: `${accent}22`, color: accent,
                  fontWeight: 700, letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace",
                }}>
                  PUBLIC
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                Emergency access for the public
              </p>
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {features.map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: accent, fontSize: 8, marginTop: 4, flexShrink: 0 }}>●</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        padding: "16px", borderRadius: 8,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>SYSTEM STATUS</span>
          <span style={{ fontSize: 10, color: "#00FF80", letterSpacing: "0.1em", fontWeight: 700 }}>● OPERATIONAL</span>
        </div>
        {[
          ["Threat Level", "MODERATE"],
          ["Active Incidents", "247"],
          ["Responders Online", "1,832"],
        ].map(([k, v]) => (
          <div key={k} style={{
            display: "flex", justifyContent: "space-between",
            padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.04)",
          }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{k}</span>
            <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Password strength indicator ──────────────────────────────────────────────

const PasswordStrength = ({ password, accent }: { password: string; accent: string }) => {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const strength = checks.filter(c => c.pass).length;
  const colors = ["#FF4D6A", "#FFB800", accent];
  const labels = ["Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i < strength ? colors[strength - 1] : "rgba(255,255,255,0.08)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {checks.map((c, i) => (
            <span key={i} style={{
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
              color: c.pass ? accent : "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", gap: 3,
              transition: "color 0.2s",
            }}>
              {c.pass ? <CheckIcon size={10} /> : "○"} {c.label}
            </span>
          ))}
        </div>
        {strength > 0 && (
          <span style={{
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
            color: colors[strength - 1], fontWeight: 700,
          }}>
            {labels[strength - 1]}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Success screen ───────────────────────────────────────────────────────────

const SuccessScreen = () => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 20, padding: "32px 0",
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: "50%",
      background: "rgba(0,255,128,0.15)", border: "2px solid #00FF80",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 0 40px rgba(0,255,128,0.4)",
      animation: "successPulse 1s ease-out",
    }}>
      <CheckIcon size={32} />
    </div>
    <div style={{ textAlign: "center" }}>
      <p style={{
        margin: "0 0 4px", fontSize: 11, letterSpacing: "0.2em",
        color: "#00FF80", fontWeight: 700, textTransform: "uppercase",
        fontFamily: "'JetBrains Mono', monospace",
      }}>Registration Successful</p>
      <h2 style={{
        margin: 0, fontSize: 20, color: "#fff", fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
      }}>Welcome to BharatRakshak</h2>
      <p style={{
        margin: "8px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)",
        fontFamily: "'JetBrains Mono', monospace",
      }}>Redirecting to Citizen Portal…</p>
    </div>
    <div style={{
      width: "100%", height: 3, background: "rgba(255,255,255,0.06)",
      borderRadius: 99, overflow: "hidden",
    }}>
      <div style={{
        height: "100%", background: "#00FF80", borderRadius: 99,
        animation: "progress 2s linear forwards",
      }} />
    </div>
    <style>{`
      @keyframes progress { from { width: 0% } to { width: 100% } }
      @keyframes successPulse {
        0%   { transform: scale(0.8); opacity: 0; }
        60%  { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </div>
);

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateForm(fields: {
  name: string; email: string; phone: string; dob: string; gender: string;
  state: string; district: string; password: string; confirmPassword: string; agreed: boolean;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (fields.name.trim().length < 3) errors.name = "Name must be at least 3 characters";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = "Enter a valid email address";
  if (!/^[6-9]\d{9}$/.test(fields.phone.replace(/\D/g, ""))) errors.phone = "Enter a valid 10-digit Indian mobile number";
  if (!fields.dob) errors.dob = "Date of birth is required";
  if (!fields.gender) errors.gender = "Please select your gender";
  if (!fields.state) errors.state = "Please select your state";
  if (!fields.district) errors.district = "Please select your district";
  if (fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!/[A-Z]/.test(fields.password)) {
    errors.password = "Password must include at least one uppercase letter";
  } else if (!/[0-9]/.test(fields.password)) {
    errors.password = "Password must include at least one number";
  }
  if (fields.confirmPassword !== fields.password) errors.confirmPassword = "Passwords do not match";
  return errors;
}

function isFormValid(fields: {
  name: string; email: string; phone: string; dob: string; gender: string;
  state: string; district: string; password: string; confirmPassword: string; agreed: boolean;
}): boolean {
  if (!fields.agreed) return false;
  return Object.keys(validateForm(fields)).length === 0;
}

// ─── Registration Form ────────────────────────────────────────────────────────

function SignupForm() {
  const router = useRouter();
  const accent = "#00FF80";

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // UI state
  const [errors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState(false);

  const fields = { name, email, phone, dob, gender, state, district, password, confirmPassword, agreed };
  const formValid = isFormValid(fields);

  const districts = state ? (INDIA_STATES[state] ?? []) : [];

  const touch = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  const getError = (field: keyof FieldErrors): string | undefined => {
    if (!touched[field]) return undefined;
    const errs = validateForm(fields);
    return errs[field];
  };

  const handleSubmit = async () => {
    // Touch all fields to show errors
    setTouched({ name: true, email: true, phone: true, dob: true, gender: true, state: true, district: true, password: true, confirmPassword: true });
    const errs = validateForm(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !agreed) return;

    setGlobalError("");
    setLoading(true);

    const payload: RegisterPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.replace(/\D/g, "").slice(-10),
      dob,
      gender,
      state,
      district,
      address: address.trim(),
      password,
    };

    try {
      await registerWithEmail({
        ...payload,
        role: "citizen",
      });

      setSuccess(true);

      setTimeout(() => {
        router.push("/login?role=citizen");
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return <SuccessScreen />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Personal Information ── */}
      <SectionLabel label="Personal Information" accent={accent} />

      <Field
        label="Full Name *"
        icon={<UserIcon />}
        placeholder="Arjun Sharma"
        value={name}
        onChange={v => { setName(v); touch("name"); }}
        accent={accent}
        autoComplete="name"
        error={getError("name")}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field
          label="Email Address *"
          icon={<MailIcon />}
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={v => { setEmail(v); touch("email"); }}
          accent={accent}
          autoComplete="email"
          error={getError("email")}
        />
        <Field
          label="Mobile Number *"
          icon={<PhoneIcon />}
          type="tel"
          placeholder="98765 43210"
          value={phone}
          onChange={v => { setPhone(v); touch("phone"); }}
          accent={accent}
          autoComplete="tel"
          error={getError("phone")}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field
          label="Date of Birth *"
          icon={<CalendarIcon />}
          type="date"
          value={dob}
          onChange={v => { setDob(v); touch("dob"); }}
          accent={accent}
          error={getError("dob")}
        />
        <SelectField
          label="Gender *"
          icon={<UserIcon />}
          value={gender}
          onChange={v => { setGender(v); touch("gender"); }}
          options={["Male", "Female", "Other"]}
          placeholder="Select gender"
          accent={accent}
          error={getError("gender")}
        />
      </div>

      {/* ── Location Information ── */}
      <SectionLabel label="Location Information" accent={accent} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <SelectField
          label="State *"
          icon={<MapPinIcon />}
          value={state}
          onChange={v => { setState(v); setDistrict(""); touch("state"); }}
          options={STATE_LIST}
          placeholder="Select state"
          accent={accent}
          error={getError("state")}
        />
        <SelectField
          label="District *"
          icon={<MapPinIcon />}
          value={district}
          onChange={v => { setDistrict(v); touch("district"); }}
          options={districts}
          placeholder={state ? "Select district" : "Select state first"}
          accent={accent}
          error={getError("district")}
        />
      </div>

      <Field
        label="Address (Optional)"
        icon={<HomeIcon />}
        placeholder="House No., Street, Locality…"
        value={address}
        onChange={setAddress}
        accent={accent}
        autoComplete="street-address"
      />

      {/* ── Account Security ── */}
      <SectionLabel label="Account Security" accent={accent} />

      <Field
        label="Password *"
        icon={<LockIcon />}
        type={showPw ? "text" : "password"}
        placeholder="Create a strong password"
        value={password}
        onChange={v => { setPassword(v); touch("password"); }}
        accent={accent}
        autoComplete="new-password"
        error={getError("password")}
        rightEl={
          <span onClick={() => setShowPw(v => !v)} style={{ display: "flex" }}>
            <EyeIcon open={showPw} />
          </span>
        }
      />

      <PasswordStrength password={password} accent={accent} />

      <Field
        label="Confirm Password *"
        icon={<LockIcon />}
        type={showConfirmPw ? "text" : "password"}
        placeholder="Repeat your password"
        value={confirmPassword}
        onChange={v => { setConfirmPassword(v); touch("confirmPassword"); }}
        accent={accent}
        autoComplete="new-password"
        error={getError("confirmPassword")}
        rightEl={
          <span onClick={() => setShowConfirmPw(v => !v)} style={{ display: "flex" }}>
            <EyeIcon open={showConfirmPw} />
          </span>
        }
      />

      {/* ── Consent ── */}
      <label style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        cursor: "pointer", userSelect: "none",
      }}>
        <div
          onClick={() => setAgreed(v => !v)}
          style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
            border: `1.5px solid ${agreed ? accent : "rgba(255,255,255,0.2)"}`,
            background: agreed ? `${accent}22` : "rgba(255,255,255,0.03)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s", cursor: "pointer",
            boxShadow: agreed ? `0 0 8px ${accent}33` : "none",
          }}
        >
          {agreed && <CheckIcon size={11} />}
        </div>
        <span style={{
          fontSize: 12, color: "rgba(255,255,255,0.5)",
          fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5,
        }}>
          I agree to the{" "}
          <a href="/terms" style={{ color: accent, textDecoration: "underline" }}>Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" style={{ color: accent, textDecoration: "underline" }}>Privacy Policy</a>
        </span>
      </label>

      {/* ── Global error ── */}
      {globalError && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 6,
          background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.3)",
        }}>
          <span style={{ color: "#FF4D6A", flexShrink: 0 }}><AlertIcon size={14} /></span>
          <p style={{ margin: 0, fontSize: 12, color: "#FF4D6A", fontFamily: "'JetBrains Mono', monospace" }}>
            {globalError}
          </p>
        </div>
      )}

      {/* ── Submit ── */}
      <button
        onClick={handleSubmit}
        disabled={!formValid || loading}
        style={{
          padding: "14px 0", borderRadius: 6, border: "none", marginTop: 2,
          background: formValid && !loading ? accent : "rgba(255,255,255,0.06)",
          color: formValid && !loading ? "#000" : "rgba(255,255,255,0.3)",
          fontWeight: 700, fontSize: 13, letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: formValid && !loading ? "pointer" : "not-allowed",
          fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s",
          boxShadow: formValid && !loading ? `0 0 20px ${accent}44` : "none",
        }}
      >
        {loading ? "Registering…" : "Create Account"}
      </button>

      {/* ── Sign in link ── */}
      <p style={{
        textAlign: "center", margin: 0, fontSize: 12,
        color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace",
      }}>
        Already have an account?{" "}
        <Link href="/login?role=citizen" style={{ color: accent, textDecoration: "underline", fontWeight: 600 }}>
          Sign In
        </Link>
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function SignupPageInner() {
  const accent = "#00FF80";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(255,255,255,0.2) !important; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(0.5);
          cursor: pointer;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff;
          -webkit-box-shadow: 0 0 0px 1000px #0d1117 inset;
          transition: background-color 5000s ease-in-out 0s;
        }
        option { background: #0d1117 !important; }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); opacity: 1; }
          70%  { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 900px) {
          .left-panel { display: flex !important; }
        }
        html, body { overflow-x: hidden; }
      `}</style>

      <ScanGrid />

      {/* Background glow blobs */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,128,0.12) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,128,0.07) 0%, transparent 70%)",
        }} />
      </div>

      {/* Page shell */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        background: "#080B0F",
        fontFamily: "'JetBrains Mono', monospace",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}>
        {/* ── Left Panel ── */}
        <LeftPanel />

        {/* ── Right Panel ── */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "32px 16px 48px",
          minWidth: 0,
          overflow: "auto",
        }}>
          <div style={{
            width: "100%",
            maxWidth: 500,
            animation: "fadeSlideUp 0.4s ease both",
            minWidth: 0,
          }}>

            {/* Mobile logo */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 28, justifyContent: "center",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${accent}22`, border: `1.5px solid ${accent}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ShieldIcon size={16} color={accent} />
              </div>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>BharatRakshak</span>
                <span style={{ fontSize: 9, display: "block", color: accent, letterSpacing: "0.18em", fontWeight: 600 }}>
                  AI COMMAND CENTER
                </span>
              </div>
            </div>

            {/* Card */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
              width: "100%",
              minWidth: 0,
            }}>
              <CornerBrackets color={accent} />

              <div style={{ padding: "28px 24px 32px" }}>

                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{
                    fontSize: 10, letterSpacing: "0.2em", color: accent,
                    fontWeight: 700, marginBottom: 8, textTransform: "uppercase",
                  }}>
                    PUBLIC ACCESS · CITIZEN REGISTRATION
                  </div>
                  <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "0.01em" }}>
                    Create Your Account
                  </h1>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
                    Register to access emergency services & alerts
                  </p>
                </div>

                <SignupForm />
              </div>
            </div>

            <p style={{
              textAlign: "center", marginTop: 20, fontSize: 10,
              color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em",
            }}>
              BHARATRAKSHAK AI · MINISTRY OF HOME AFFAIRS · GOVERNMENT OF INDIA
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", background: "#080B0F",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.3)", fontFamily: "monospace", fontSize: 12,
        letterSpacing: "0.2em",
      }}>
        INITIALIZING REGISTRATION PORTAL…
      </div>
    }>
      <SignupPageInner />
    </Suspense>
  );
}