import { Home, ShoppingCart, CreditCard, Fan, Leaf, Package } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", href: ROUTES.DASHBOARD },
  { icon: ShoppingCart, label: "Shopping", href: ROUTES.SHOPPING },
  { icon: CreditCard, label: "Finances", href: ROUTES.FINANCES },
  { icon: Fan, label: "Cleaning", href: ROUTES.CLEANING },
  { icon: Leaf, label: "Plants", href: ROUTES.PLANTS },
  { icon: Package, label: "Inventory", href: ROUTES.INVENTORY },
];

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 py-3 px-2 text-center flex flex-col items-center justify-center transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
