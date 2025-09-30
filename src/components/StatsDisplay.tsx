import { MessageCircle } from "lucide-react";

interface StatsDisplayProps {
  interactionCount: number;
  className?: string;
}

export const StatsDisplay = ({ interactionCount, className }: StatsDisplayProps) => {
  return (
    <div className={`h-6 flex items-center gap-0.5 text-xs text-white ${className}`}>
      <MessageCircle className="h-2.5 w-2.5" />
      <span>{interactionCount}</span>
    </div>
  );
};