"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginWithEmail, resetPassword } from "@/lib/auth";
import { getRoleRedirectPath } from "@/lib/firestore";
import type { UserRole } from "@/types/user";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = UserRole;

interface RoleConfig {
  label: string;
  tagline: string;
  accent: string;
  accentDim: string;
  badgeColor: string;
  icon: React.ReactNode;
  clearanceLevel: string;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const ShieldIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const PhoneIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.46 18l.46-1.08z" />
  </svg>
);

const UserIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const AlertIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
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

const KeyIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="M21 2l-9.6 9.6M15.5 7.5l3 3L21 8l-3-3" />
  </svg>
);

const ArrowLeftIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
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

// ─── Styled input field ───────────────────────────────────────────────────────

const Field = ({
  label, icon, type = "text", placeholder, value, onChange,
  accent, rightEl, autoComplete, disabled,
}: {
  label: string; icon: React.ReactNode; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; accent: string;
  rightEl?: React.ReactNode; autoComplete?: string; disabled?: boolean;
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.45)", textTransform: "uppercase",
        fontFamily: "'JetBrains Mono', monospace",
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: focused ? accent : "rgba(255,255,255,0.3)",
          transition: "color 0.2s", pointerEvents: "none",
        }}>{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          suppressHydrationWarning
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "12px 40px 12px 40px",
            background: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${focused ? accent : "rgba(255,255,255,0.1)"}`,
            borderRadius: 6, color: "#fff",
            fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
            outline: "none", transition: "all 0.2s",
            boxShadow: focused ? `0 0 0 3px ${accent}22` : "none",
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        {rightEl && (
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            color: "rgba(255,255,255,0.3)", cursor: "pointer",
          }}>{rightEl}</span>
        )}
      </div>
    </div>
  );
};

// ─── PIN input (6-digit single field) ────────────────────────────────────────

const PinField = ({ label, value, onChange, accent }: {
  label: string; value: string; onChange: (v: string) => void; accent: string;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.45)", textTransform: "uppercase",
        fontFamily: "'JetBrains Mono', monospace",
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: focused ? accent : "rgba(255,255,255,0.3)",
          transition: "color 0.2s", pointerEvents: "none",
        }}><KeyIcon /></span>
        <input
          type="password"
          inputMode="numeric"
          placeholder="••••••"
          maxLength={6}
          value={value}
          onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          suppressHydrationWarning
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "12px 40px 12px 40px",
            background: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${focused ? accent : "rgba(255,255,255,0.1)"}`,
            borderRadius: 6, color: "#fff",
            fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
            outline: "none", transition: "all 0.2s",
            letterSpacing: "0.3em",
            boxShadow: focused ? `0 0 0 3px ${accent}22` : "none",
          }}
        />
      </div>
    </div>
  );
};

// ─── OTP boxes (6 individual cells) — FIXED: constrained width, flex nowrap ──

const OtpInput = ({ value, onChange, accent }: {
  value: string; onChange: (v: string) => void; accent: string;
}) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        onChange(next.join("").trimEnd());
      } else if (i > 0) {
        const next = [...digits];
        next[i - 1] = "";
        onChange(next.join("").trimEnd());
        refs.current[i - 1]?.focus();
      }
    }
  };

  const handleChange = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "");
    if (!clean) return;
    const next = [...digits];
    for (let j = 0; j < clean.length && i + j < 6; j++) {
      next[i + j] = clean[j];
    }
    onChange(next.join(""));
    const focusIdx = Math.min(i + clean.length, 5);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div style={{
      display: "flex",
      flexWrap: "nowrap",
      gap: 6,
      width: "100%",
      boxSizing: "border-box",
    }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={digits[i] || ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onFocus={e => e.target.select()}
          suppressHydrationWarning
          style={{
            flex: "1 1 0",
            minWidth: 0,
            aspectRatio: "1 / 1.1",
            maxHeight: 52,
            textAlign: "center",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 0,
            fontFamily: "'JetBrains Mono', monospace",
            background: digits[i] ? `${accent}18` : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${digits[i] ? accent : "rgba(255,255,255,0.12)"}`,
            borderRadius: 8,
            color: "#fff",
            outline: "none",
            transition: "all 0.15s",
            boxShadow: digits[i] ? `0 0 8px ${accent}33` : "none",
            boxSizing: "border-box",
          }}
        />
      ))}
    </div>
  );
};

// ─── Error banner ─────────────────────────────────────────────────────────────

const ErrorBanner = ({ message }: { message: string }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 14px", borderRadius: 6,
    background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.3)",
  }}>
    <span style={{ color: "#FF4D6A", flexShrink: 0 }}><AlertIcon size={14} /></span>
    <p style={{ margin: 0, fontSize: 12, color: "#FF4D6A", fontFamily: "'JetBrains Mono', monospace" }}>
      {message}
    </p>
  </div>
);

// ─── Role configs ─────────────────────────────────────────────────────────────

const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  citizen: {
    label: "Citizen",
    tagline: "Emergency access for the public",
    accent: "#00FF80",
    accentDim: "rgba(0,255,128,0.12)",
    badgeColor: "#00FF80",
    clearanceLevel: "PUBLIC",
    icon: <PhoneIcon size={14} />,
  },
  responder: {
    label: "First Responder",
    tagline: "Operational field access",
    accent: "#FFB800",
    accentDim: "rgba(255,184,0,0.12)",
    badgeColor: "#FFB800",
    clearanceLevel: "FIELD-OPS",
    icon: <UserIcon size={14} />,
  },
  authority: {
    label: "Authority",
    tagline: "Command-level secure access",
    accent: "#FF4D6A",
    accentDim: "rgba(255,77,106,0.12)",
    badgeColor: "#FF4D6A",
    clearanceLevel: "RESTRICTED",
    icon: <ShieldIcon size={14} />,
  },
};

const MailIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

// ─── Email + Password Login (Firebase) ───────────────────────────────────────

const EmailPasswordLogin = ({
  accent,
  role,
  emailLabel = "Email Address",
  emailPlaceholder = "name@example.com",
  submitLabel = "Sign In",
  onSuccess,
  showSignupLink = false,
  showForgotPassword = true,
}: {
  accent: string;
  role: Role;
  emailLabel?: string;
  emailPlaceholder?: string;
  submitLabel?: string;
  onSuccess: (redirectPath: string) => void;
  showSignupLink?: boolean;
  showForgotPassword?: boolean;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const ready = !!(email.trim() && password.trim());

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const { profile } = await loginWithEmail(email, password);
      if (profile.role !== role) {
        throw new Error(
          `This account is registered as ${profile.role}. Please select the correct role.`
        );
      }
      onSuccess(getRoleRedirectPath(profile.role));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email address first, then click Forgot Password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Field
        label={emailLabel}
        icon={<MailIcon />}
        type="email"
        placeholder={emailPlaceholder}
        value={email}
        onChange={setEmail}
        accent={accent}
        autoComplete="email"
      />
      <Field
        label="Password"
        icon={<LockIcon />}
        type={showPw ? "text" : "password"}
        placeholder="••••••••••"
        value={password}
        onChange={setPassword}
        accent={accent}
        autoComplete="current-password"
        rightEl={
          <span onClick={() => setShowPw((v) => !v)}>
            <EyeIcon open={showPw} />
          </span>
        }
      />

      {showForgotPassword && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: accent,
              fontSize: 12,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              textDecoration: "underline",
            }}
          >
            Forgot Password?
          </button>
        </div>
      )}

      {resetSent && (
        <div style={{
          padding: "10px 14px", borderRadius: 6,
          background: "rgba(0,255,128,0.08)", border: "1px solid rgba(0,255,128,0.25)",
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "#00FF80", fontFamily: "'JetBrains Mono', monospace" }}>
            Password reset email sent. Check your inbox.
          </p>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      <button
        onClick={handleLogin}
        disabled={!ready || loading}
        style={{
          padding: "13px 0", borderRadius: 6, border: "none",
          background: ready && !loading ? accent : "rgba(255,255,255,0.06)",
          color: ready && !loading ? "#000" : "rgba(255,255,255,0.3)",
          fontWeight: 700, fontSize: 13, letterSpacing: "0.08em",
          textTransform: "uppercase", cursor: ready && !loading ? "pointer" : "not-allowed",
          fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s",
          boxShadow: ready && !loading ? `0 0 16px ${accent}44` : "none",
        }}
      >
        {loading ? "Authenticating…" : submitLabel}
      </button>

      {role === "citizen" && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 14px", borderRadius: 6,
          background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.2)",
        }}>
          <span style={{ color: "#FF4D6A", flexShrink: 0 }}><AlertIcon /></span>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "#FF4D6A", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              Emergency Registration
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
              For immediate distress situations — no account required
            </p>
          </div>
          <Link href="/sos" style={{ marginLeft: "auto" }}>
            <button style={{
              marginLeft: "auto", background: "#FF4D6A", border: "none",
              color: "#fff", fontSize: 11, fontWeight: 700, padding: "6px 12px",
              borderRadius: 4, cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              SOS
            </button>
          </Link>
        </div>
      )}

      {showSignupLink && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "14px 0 2px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{
            fontSize: 12, color: "rgba(255,255,255,0.35)",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Don&apos;t have an account?
          </span>
          <Link href="/signup" style={{ textDecoration: "none" }}>
            <button style={{
              background: "rgba(0,255,128,0.08)",
              border: "1px solid rgba(0,255,128,0.35)",
              color: "#00FF80",
              fontSize: 12, fontWeight: 700,
              padding: "6px 16px", borderRadius: 5,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.06em",
            }}>
              Sign Up
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

// ─── Responder Login ──────────────────────────────────────────────────────────

const ResponderLogin = ({
  accent,
  onSuccess,
}: {
  accent: string;
  onSuccess: (redirectPath: string) => void;
}) => (
  <EmailPasswordLogin
    accent={accent}
    role="responder"
    emailLabel="Official Email"
    emailPlaceholder="responder@ndrf.gov.in"
    submitLabel="Access Field Operations"
    onSuccess={onSuccess}
    showForgotPassword
  />
);

// ─── Authority Login ──────────────────────────────────────────────────────────

const AuthorityLogin = ({
  accent,
  onSuccess,
}: {
  accent: string;
  onSuccess: (redirectPath: string) => void;
}) => (
  <>
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
      background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.2)", borderRadius: 6,
      marginBottom: 18,
    }}>
      <span style={{ color: "#FF4D6A" }}><ShieldIcon size={14} /></span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>
        CLASSIFICATION: <strong style={{ color: "#FF4D6A" }}>RESTRICTED</strong> — Authorised access only
      </span>
    </div>
    <EmailPasswordLogin
      accent={accent}
      role="authority"
      emailLabel="Officer Email"
      emailPlaceholder="officer@mha.gov.in"
      submitLabel="Authenticate & Enter Command"
      onSuccess={onSuccess}
      showForgotPassword
    />
  </>
);

// ─── Success screen ───────────────────────────────────────────────────────────

const SuccessScreen = ({ config }: { role: Role; config: RoleConfig }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 20, padding: "32px 0",
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: "50%",
      background: `${config.accent}22`, border: `2px solid ${config.accent}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 0 32px ${config.accent}55`,
    }}>
      <ShieldIcon size={32} color={config.accent} />
    </div>
    <div style={{ textAlign: "center" }}>
      <p style={{
        margin: "0 0 4px", fontSize: 11, letterSpacing: "0.2em",
        color: config.accent, fontWeight: 700, textTransform: "uppercase",
        fontFamily: "'JetBrains Mono', monospace",
      }}>Access Granted</p>
      <h2 style={{
        margin: 0, fontSize: 22, color: "#fff", fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
      }}>Welcome, {config.label}</h2>
      <p style={{
        margin: "8px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)",
        fontFamily: "'JetBrains Mono', monospace",
      }}>Redirecting to BharatRakshak Dashboard…</p>
    </div>
    <div style={{
      width: "100%", height: 3, background: "rgba(255,255,255,0.06)",
      borderRadius: 99, overflow: "hidden",
    }}>
      <div style={{
        height: "100%", background: config.accent, borderRadius: 99,
        animation: "progress 1.2s linear forwards",
      }} />
    </div>
    <style>{`@keyframes progress { from { width: 0%; } to { width: 100%; } }`}</style>
  </div>
);

// ─── Role Selection Screen ────────────────────────────────────────────────────

const RoleSelectionScreen = ({ onSelect }: { onSelect: (role: Role) => void }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <style>{`
      .role-btn { transition: background 0.2s, border-color 0.2s; }
      .role-btn-citizen:hover  { background: rgba(0,255,128,0.08)   !important; border-color: rgba(0,255,128,0.35)   !important; }
      .role-btn-responder:hover{ background: rgba(255,184,0,0.08)  !important; border-color: rgba(255,184,0,0.35)  !important; }
      .role-btn-authority:hover{ background: rgba(255,77,106,0.08) !important; border-color: rgba(255,77,106,0.35) !important; }
    `}</style>
    <div style={{ marginBottom: 8 }}>
      <p style={{
        margin: "0 0 4px", fontSize: 10, letterSpacing: "0.2em",
        color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        Select Access Level
      </p>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff" }}>
        Identify Your Role
      </h1>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
        Choose the access level that matches your credentials
      </p>
    </div>

    {(Object.entries(ROLE_CONFIGS) as [Role, RoleConfig][]).map(([role, cfg]) => (
      <button
        key={role}
        onClick={() => onSelect(role)}
        className={`role-btn role-btn-${role}`}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "16px 16px", borderRadius: 8, cursor: "pointer",
          background: "rgba(255,255,255,0.03)",
          border: `1px solid rgba(255,255,255,0.09)`,
          textAlign: "left", width: "100%",
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: `${cfg.accent}18`, border: `1.5px solid ${cfg.accent}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: cfg.accent }}>{cfg.icon}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>
              {cfg.label}
            </span>
            <span style={{
              fontSize: 9, padding: "2px 6px", borderRadius: 3,
              background: `${cfg.accent}22`, color: cfg.accent,
              fontWeight: 700, letterSpacing: "0.12em",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {cfg.clearanceLevel}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
            {cfg.tagline}
          </p>
        </div>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={cfg.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    ))}
  </div>
);

// ─── Left panel — role-specific after selection ───────────────────────────────

const LeftPanel = ({
  selectedRole,
  config,
  onChangeRole,
}: {
  selectedRole: Role | null;
  config: RoleConfig | null;
  onChangeRole: () => void;
}) => {
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
              border: `1px solid ${config?.accent ?? "#00FF80"}`,
              animation: "pulse-ring 2.5s ease-out infinite",
              transition: "border-color 0.4s",
            }} />
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `${config?.accent ?? "#00FF80"}22`,
              border: `2px solid ${config?.accent ?? "#00FF80"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.4s",
            }}>
              <ShieldIcon size={20} color={config?.accent ?? "#00FF80"} />
            </div>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>
              BharatRakshak
            </p>
            <p style={{ margin: 0, fontSize: 10, color: config?.accent ?? "#00FF80", letterSpacing: "0.2em", fontWeight: 600 }}>
              AI COMMAND CENTER
            </p>
          </div>
        </div>

        {/* Role section: show all roles OR selected role only */}
        {!selectedRole ? (
          // No role selected yet — show all three
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 48 }}>
            {(Object.entries(ROLE_CONFIGS) as [Role, RoleConfig][]).map(([role, cfg]) => (
              <div key={role} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 6,
                background: "transparent",
                border: "1px solid transparent",
              }}>
                <span style={{ color: cfg.accent }}>{cfg.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>
                    {cfg.label}
                  </p>
                  <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                    {cfg.tagline}
                  </p>
                </div>
                <span style={{
                  fontSize: 9, padding: "2px 6px", borderRadius: 3,
                  background: `${cfg.accent}22`, color: cfg.accent,
                  fontWeight: 700, letterSpacing: "0.12em",
                }}>
                  {cfg.clearanceLevel}
                </span>
              </div>
            ))}
          </div>
        ) : (
          // Role selected — show ONLY this role + change button
          <div style={{ marginBottom: 48 }}>
            <button
              onClick={onChangeRole}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "none", border: "none", padding: "0 0 16px 0",
                color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em",
                transition: "color 0.2s",
              }}
            >
              <ArrowLeftIcon size={12} /> Change Role
            </button>

            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 16px", borderRadius: 8,
              background: `${config!.accent}14`,
              border: `1px solid ${config!.accent}40`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${config!.accent}18`, border: `1.5px solid ${config!.accent}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ color: config!.accent }}>{config!.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: config!.accent, fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                    {config!.label}
                  </span>
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 3,
                    background: `${config!.accent}22`, color: config!.accent,
                    fontWeight: 700, letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {config!.clearanceLevel}
                  </span>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {config!.tagline}
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {features.map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: config?.accent ?? "#00FF80", fontSize: 8, marginTop: 4, flexShrink: 0 }}>●</span>
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

// ─── Main login page ──────────────────────────────────────────────────────────

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // selectedRole drives the entire flow. null = role selection screen.
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync from URL on mount only (allow deep-linking like ?role=citizen)
  const didSyncRef = useRef(false);
  useEffect(() => {
    const rawRole = searchParams.get("role") as Role | null;
    if (!didSyncRef.current && rawRole && ROLE_CONFIGS[rawRole]) {
      didSyncRef.current = true;
      setSelectedRole(rawRole);
    }
  }, [searchParams]);

  const config = selectedRole ? ROLE_CONFIGS[selectedRole] : null;
  const accentForGlow = config?.accent ?? "#00FF80";

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    // Update URL without navigation
    window.history.replaceState(null, "", `?role=${role}`);
  };

  const handleChangeRole = () => {
    setSelectedRole(null);
    setSuccess(false);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const handleLoginSuccess = (redirectPath: string) => {
    setSuccess(true);
    setTimeout(() => router.push(redirectPath), 1200);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(255,255,255,0.2) !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff;
          -webkit-box-shadow: 0 0 0px 1000px #0d1117 inset;
          transition: background-color 5000s ease-in-out 0s;
        }
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
        .grecaptcha-badge { visibility: hidden !important; }
        @media (min-width: 900px) {
          .left-panel { display: flex !important; }
        }
        /* Prevent any horizontal overflow globally */
        html, body { overflow-x: hidden; }
      `}</style>

      <ScanGrid />

      {/* Background glow blobs */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: 600, height: 600, borderRadius: "50%",
          background: `radial-gradient(circle, ${accentForGlow}18 0%, transparent 70%)`,
          transition: "background 0.6s ease",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, ${accentForGlow}10 0%, transparent 70%)`,
          transition: "background 0.6s ease",
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

        {/* ── Left Panel ────────────────────────────────────────────────────── */}
        <LeftPanel
          selectedRole={selectedRole}
          config={config}
          onChangeRole={handleChangeRole}
        />

        {/* ── Right Panel ───────────────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          minWidth: 0,
          overflow: "hidden",
        }}>
          <div style={{
            width: "100%",
            maxWidth: 440,
            animation: "fadeSlideUp 0.4s ease both",
            minWidth: 0,
          }}>

            {/* Mobile logo (hidden on desktop via left panel) */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 36, justifyContent: "center",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${accentForGlow}22`, border: `1.5px solid ${accentForGlow}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.4s",
              }}>
                <ShieldIcon size={16} color={accentForGlow} />
              </div>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>BharatRakshak</span>
                <span style={{ fontSize: 9, display: "block", color: accentForGlow, letterSpacing: "0.18em", fontWeight: 600 }}>
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
              <CornerBrackets color={accentForGlow} />

              <div style={{ padding: "28px 24px 32px" }}>

                {/* ── No role selected: show selection screen ── */}
                {!selectedRole && (
                  <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>
                    <RoleSelectionScreen onSelect={handleSelectRole} />
                  </div>
                )}

                {/* ── Role selected: show login form ── */}
                {selectedRole && (
                  <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>

                    {/* Change Role button (mobile — left panel is hidden) */}
                    <button
                      onClick={handleChangeRole}
                      className="mobile-change-role change-role-btn"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "none", border: "none", padding: "0 0 20px 0",
                        color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer",
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em",
                        transition: "color 0.2s",
                      }}
                    >
                      <ArrowLeftIcon size={12} /> Change Role
                    </button>

                    {success ? (
                      <SuccessScreen role={selectedRole} config={config!} />
                    ) : (
                      <>
                        {/* Header */}
                        <div style={{ marginBottom: 28 }}>
                          <div style={{
                            fontSize: 10, letterSpacing: "0.2em", color: config!.accent,
                            fontWeight: 700, marginBottom: 8, textTransform: "uppercase",
                            transition: "color 0.4s",
                          }}>
                            {config!.clearanceLevel} ACCESS
                          </div>
                          <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "0.01em" }}>
                            {selectedRole === "citizen" ? "Citizen Portal" :
                              selectedRole === "responder" ? "Field Operations" : "Command Access"}
                          </h1>
                          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
                            {config!.tagline}
                          </p>
                        </div>

                        {selectedRole === "citizen" && (
                          <EmailPasswordLogin
                            accent={config!.accent}
                            role="citizen"
                            submitLabel="Verify & Access"
                            onSuccess={handleLoginSuccess}
                            showSignupLink
                          />
                        )}
                        {selectedRole === "responder" && (
                          <ResponderLogin accent={config!.accent} onSuccess={handleLoginSuccess} />
                        )}
                        {selectedRole === "authority" && (
                          <AuthorityLogin accent={config!.accent} onSuccess={handleLoginSuccess} />
                        )}
                      </>
                    )}
                  </div>
                )}
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

      <style>{`
        /* On desktop the left panel Change Role btn is handled inside LeftPanel.
           On mobile (<900px) we show the in-card button instead. */
        @media (min-width: 900px) {
          .mobile-change-role { display: none !important; }
        }
        .change-role-btn:hover { color: rgba(255,255,255,0.85) !important; }
      `}</style>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", background: "#080B0F",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.3)", fontFamily: "monospace", fontSize: 12,
        letterSpacing: "0.2em",
      }}>
        INITIALIZING SECURE SESSION…
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}