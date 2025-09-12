import { cn } from "@/lib/utils";

interface AudioRippleProps {
  isPlaying: boolean;
  className?: string;
}

const AudioRipple = ({ isPlaying, className }: AudioRippleProps) => {
  if (!isPlaying) return null;

  return (
    <div className={cn("absolute inset-0 rounded-full", className)}>
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      <div 
        className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
        style={{ animationDelay: "0.3s" }}
      />
      <div 
        className="absolute inset-0 rounded-full bg-primary/5 animate-ping"
        style={{ animationDelay: "0.6s" }}
      />
    </div>
  );
};

export default AudioRipple;