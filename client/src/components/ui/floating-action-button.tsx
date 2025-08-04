import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick?: () => void;
  onScanClick?: () => void;
  className?: string;
  showScanOption?: boolean;
}

export function FloatingActionButton({ onClick, onScanClick, className, showScanOption = false }: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!showScanOption) {
    // Original single button behavior
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

  return (
    <div className="fixed bottom-24 right-4 z-40">
      {/* Expanded buttons */}
      {isExpanded && (
        <div className="flex flex-col gap-3 mb-3">
          <Button
            onClick={() => {
              onScanClick?.();
              setIsExpanded(false);
            }}
            size="icon"
            variant="secondary"
            className="w-12 h-12 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ScanLine className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => {
              onClick?.();
              setIsExpanded(false);
            }}
            size="icon"
            variant="secondary"
            className="w-12 h-12 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Main FAB button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        size="icon"
        className={cn(
          "w-14 h-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-300 ease-in-out",
          "hover:scale-110 hover:shadow-xl",
          "focus:scale-110 focus:shadow-xl",
          className
        )}
      >
        <Plus className={cn("h-6 w-6 transition-transform duration-300", isExpanded && "rotate-45")} />
      </Button>
    </div>
  );
}
