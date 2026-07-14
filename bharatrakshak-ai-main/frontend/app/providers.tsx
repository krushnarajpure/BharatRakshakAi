import { AuthProvider } from "@/context/AuthContext";

export default function ProvidersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
