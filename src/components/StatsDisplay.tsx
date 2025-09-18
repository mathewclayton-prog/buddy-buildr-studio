import { MessageCircle } from "lucide-react";

interface StatsDisplayProps {
  interactionCount: number;
  className?: string;
}

export const StatsDisplay = ({ interactionCount, className }: StatsDisplayProps) => {
  return (
    <div className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      <MessageCircle className="h-2.5 w-2.5" />
      <span>{interactionCount}</span>
    </div>
  );
};