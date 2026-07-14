import { AuthGuard } from "@/components/auth/AuthGuard";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
