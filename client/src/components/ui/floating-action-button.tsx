import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick?: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg z-40",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "transition-all duration-300 ease-in-out",
        "hover:scale-110 hover:shadow-xl",
        "focus:scale-110 focus:shadow-xl",
        className
      )}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
