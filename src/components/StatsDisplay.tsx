import { Eye, MessageCircle, Heart } from "lucide-react";

interface StatsDisplayProps {
  likeCount: number;
  interactionCount: number;
  className?: string;
}

export const StatsDisplay = ({ likeCount, interactionCount, className }: StatsDisplayProps) => {
  return (
    <div className={`flex items-center gap-3 text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center gap-1">
        <Heart className="h-3 w-3" />
        <span>{likeCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <MessageCircle className="h-3 w-3" />
        <span>{interactionCount}</span>
      </div>
    </div>
  );
};