import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ResponderPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard requiredRole="responder">{children}</AuthGuard>;
}
