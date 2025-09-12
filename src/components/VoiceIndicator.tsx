import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX } from "lucide-react";
import { audioService } from "@/services/audioService";

const VoiceIndicator = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handlePlayingChange = (playing: boolean) => {
      setIsPlaying(playing);
    };

    audioService.setPlayingChangeCallback(handlePlayingChange);
    
    // Check initial state
    setIsPlaying(audioService.isPlaying());

    return () => {
      // Cleanup is handled by the service
    };
  }, []);

  if (!isPlaying) {
    return null;
  }

  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 animate-pulse">
      <Volume2 className="h-3 w-3 mr-1" />
      Speaking
    </Badge>
  );
};

export default VoiceIndicator;