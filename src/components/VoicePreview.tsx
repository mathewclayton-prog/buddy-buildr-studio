import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2 } from "lucide-react";
import { audioService } from "@/services/audioService";
import { AVAILABLE_VOICES } from "@/utils/voiceMapping";
import { useToast } from "@/hooks/use-toast";

interface VoicePreviewProps {
  personality: string;
  characterName?: string;
}

const VoicePreview = ({ personality, characterName = "Your Cat" }: VoicePreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Default to Charlotte for backwards compatibility
  const voiceInfo = Object.values(AVAILABLE_VOICES.female).find(v => v.name === 'Charlotte') || 
                   Object.values(AVAILABLE_VOICES.female)[0];
  const voiceName = voiceInfo.name;
  const voiceDescription = voiceInfo.description;
  
  const sampleText = `Hello! I'm ${characterName}. I'm excited to chat with you! This is how I'll sound when we talk together.`;

  const handlePlayPreview = async () => {
    if (isPlaying) {
      audioService.stopAudio();
      setIsPlaying(false);
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🎵 Generating voice preview for:', personality);
      const response = await audioService.generateSpeech(sampleText, personality);
      
      // Set up callback for this preview
      audioService.setPlayingChangeCallback((playing) => {
        setIsPlaying(playing);
      });
      
      await audioService.playAudio(response.audioContent, 'voice-preview');
      
    } catch (error) {
      console.error('Voice preview error:', error);
      toast({
        title: "Voice Preview Error",
        description: "Failed to generate voice preview. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          Voice Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {voiceName}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {personality} personality
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {voiceDescription}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayPreview}
            disabled={isGenerating}
            className="h-8 w-8 p-0"
          >
            {isGenerating ? (
              <div className="h-3 w-3 border border-foreground border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded border-l-2 border-primary/20">
          "Hello! I'm {characterName}. I'm excited to chat with you!"
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[...Object.entries(AVAILABLE_VOICES.female), ...Object.entries(AVAILABLE_VOICES.male)].map(([voiceId, voice]) => (
            <div key={voiceId} className="p-2 rounded border text-center bg-muted/30 border-border">
              <div className="font-medium">{voice.name}</div>
              <div className="text-muted-foreground capitalize">{voice.gender}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoicePreview;