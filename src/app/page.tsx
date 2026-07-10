import { AuthGate } from "@/components/guardian/auth-gate";

export default function Home() {
  return <AuthGate />;
}
