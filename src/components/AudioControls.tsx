import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { audioService } from "@/services/audioService";
import { useToast } from "@/hooks/use-toast";
import AudioWaveform from "./AudioWaveform";
import AudioRipple from "./AudioRipple";

interface AudioControlsProps {
  text: string;
  messageId: string;
  personality?: string;
  className?: string;
}

const AudioControls = ({ text, messageId, personality = 'friendly', className }: AudioControlsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up audio service callback
    const handlePlayingChange = (playing: boolean, playingMessageId?: string) => {
      if (playingMessageId === messageId) {
        setIsPlaying(playing);
      } else if (playing && playingMessageId !== messageId) {
        // Another message is playing, this one is not
        setIsPlaying(false);
      }
    };

    audioService.setPlayingChangeCallback(handlePlayingChange);
    
    // Check if already playing
    setIsPlaying(audioService.isPlaying(messageId));

    return () => {
      // Cleanup is handled by the service
    };
  }, [messageId]);

  const generateAndCacheAudio = async () => {
    if (isGenerating || hasAudio) return;
    
    setIsGenerating(true);
    try {
      console.log('🎵 Generating audio for message:', messageId);
      const response = await audioService.generateSpeech(text, personality);
      setAudioData(response.audioContent);
      setHasAudio(true);
      console.log('✅ Audio generated and cached');
    } catch (error) {
      console.error('Failed to generate audio:', error);
      toast({
        title: "Audio Error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        audioService.stopAudio();
      } else {
        // Generate audio if not already done
        if (!audioData) {
          await generateAndCacheAudio();
          return; // Audio will auto-play after generation
        }
        
        if (audioData) {
          await audioService.playAudio(audioData, messageId);
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      toast({
        title: "Playback Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Auto-play after generation if user clicked play during generation
  useEffect(() => {
    if (hasAudio && audioData && isGenerating === false) {
      // Don't auto-play, let user click play button
    }
  }, [hasAudio, audioData, isGenerating]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlayPause}
          disabled={isGenerating}
          className="h-6 w-6 p-0 hover:bg-accent/50 rounded-full relative z-10"
          title={isPlaying ? "Pause" : "Play audio"}
        >
          {isGenerating ? (
            <div className="h-3 w-3 border border-muted-foreground border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
        <AudioRipple isPlaying={isPlaying} />
      </div>
      
      {(hasAudio || isGenerating) && (
        <>
          <AudioWaveform 
            isPlaying={isPlaying} 
            isGenerating={isGenerating}
            className="w-8"
          />
          {hasAudio && !isGenerating && (
            <Volume2 className="h-3 w-3 text-muted-foreground/60" />
          )}
        </>
      )}
    </div>
  );
};

export default AudioControls;