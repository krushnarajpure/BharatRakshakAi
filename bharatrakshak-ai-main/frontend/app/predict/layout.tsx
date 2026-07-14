import { AuthGuard } from "@/components/auth/AuthGuard";

export default function PredictLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
