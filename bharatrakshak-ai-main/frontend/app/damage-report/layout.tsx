import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DamageReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
