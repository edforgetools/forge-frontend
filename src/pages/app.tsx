import { AppShell } from "../components/AppShell";

interface AppPageProps {
  onBack: () => void;
}

export default function AppPage({ onBack }: AppPageProps) {
  return <AppShell onBack={onBack} />;
}
