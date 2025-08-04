import { type ReactNode } from "react";
import { Header } from "./header";
import { BottomNavigation } from "./bottom-navigation";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

interface MobileLayoutProps {
  children: ReactNode;
  onFabClick?: () => void;
}

export function MobileLayout({ children, onFabClick }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pb-20">
        {children}
      </main>
      <FloatingActionButton onClick={onFabClick} />
      <BottomNavigation />
    </div>
  );
}
