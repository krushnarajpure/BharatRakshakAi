import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard requiredRole="authority">{children}</AuthGuard>;
}
