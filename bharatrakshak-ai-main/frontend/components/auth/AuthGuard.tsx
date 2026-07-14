"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getRoleRedirectPath } from "@/lib/firestore";
import type { UserRole } from "@/types/user";

interface AuthGuardProps {
  children: React.ReactNode;
  /** If set, only users with this role can access */
  requiredRole?: UserRole;
  /** Redirect authenticated users away (for login/signup) */
  guestOnly?: boolean;
}

export function AuthGuard({
  children,
  requiredRole,
  guestOnly = false,
}: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (guestOnly) {
      if (user && profile) {
        router.replace(getRoleRedirectPath(profile.role));
      }
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requiredRole && profile && profile.role !== requiredRole) {
      router.replace(getRoleRedirectPath(profile.role));
    }
  }, [user, profile, loading, requiredRole, guestOnly, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080B0F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.3)",
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: "0.2em",
        }}
      >
        VERIFYING CREDENTIALS…
      </div>
    );
  }

  if (guestOnly && user && profile) return null;
  if (!guestOnly && !user) return null;
  if (!guestOnly && requiredRole && profile && profile.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
