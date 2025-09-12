import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioWaveformProps {
  isPlaying: boolean;
  isGenerating: boolean;
  className?: string;
}

const AudioWaveform = ({ isPlaying, isGenerating, className }: AudioWaveformProps) => {
  const [bars] = useState(() => 
    Array.from({ length: 5 }, () => Math.random() * 0.7 + 0.3)
  );

  return (
    <div className={cn("flex items-center gap-0.5 h-4", className)}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-0.5 bg-primary/60 rounded-full transition-all duration-150",
            isPlaying && "animate-pulse",
            isGenerating && "animate-pulse opacity-50"
          )}
          style={{
            height: isPlaying ? `${height * 100}%` : "20%",
            animationDelay: `${index * 100}ms`,
            animationDuration: `${800 + index * 200}ms`
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;