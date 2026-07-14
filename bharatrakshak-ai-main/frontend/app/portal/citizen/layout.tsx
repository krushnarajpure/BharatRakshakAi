import { AuthGuard } from "@/components/auth/AuthGuard";

export default function CitizenPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard requiredRole="citizen">{children}</AuthGuard>;
}
