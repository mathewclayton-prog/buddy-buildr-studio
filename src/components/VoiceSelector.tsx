import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Volume2 } from "lucide-react";
import { audioService } from "@/services/audioService";
import { getAllVoicesByGender, type VoiceId } from "@/utils/voiceMapping";

interface VoiceSelectorProps {
  selectedVoiceId?: VoiceId;
  onVoiceSelect: (voiceId: VoiceId) => void;
  characterName?: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoiceId,
  onVoiceSelect,
  characterName = "Your catbot"
}) => {
  const [playingVoice, setPlayingVoice] = useState<VoiceId | null>(null);
  const [isGenerating, setIsGenerating] = useState<VoiceId | null>(null);
  const voices = getAllVoicesByGender();

  const handlePlayPreview = async (voiceId: VoiceId, voiceName: string) => {
    if (playingVoice === voiceId) {
      audioService.stopAudio();
      setPlayingVoice(null);
      return;
    }

    try {
      setIsGenerating(voiceId);
      const sampleText = `Hello! I'm ${characterName}. This is how I sound when we chat together.`;
      
      // Generate speech with specific voice ID
      const response = await fetch('https://akbmcsjeityrozgsibng.supabase.co/functions/v1/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: sampleText,
          voiceId: voiceId
        })
      });

      if (!response.ok) throw new Error('Failed to generate speech');
      const data = await response.json();

      setPlayingVoice(voiceId);
      await audioService.playAudio(data.audioContent, `voice-preview-${voiceId}`);
      setPlayingVoice(null);
    } catch (error) {
      console.error('Error playing voice preview:', error);
    } finally {
      setIsGenerating(null);
    }
  };

  const VoiceCard = ({ voiceId, name, description, gender }: {
    voiceId: VoiceId;
    name: string; 
    description: string;
    gender: 'female' | 'male';
  }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        selectedVoiceId === voiceId 
          ? 'ring-2 ring-primary bg-primary/5' 
          : 'hover:bg-accent/50'
      }`}
      onClick={() => onVoiceSelect(voiceId)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name={`voice-${gender}`}
              checked={selectedVoiceId === voiceId}
              onChange={() => onVoiceSelect(voiceId)}
              className="w-4 h-4 text-primary"
            />
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">{name}</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPreview(voiceId, name);
            }}
            disabled={isGenerating === voiceId}
            className="h-8 w-8 p-0"
          >
            {isGenerating === voiceId ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : playingVoice === voiceId ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="female" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="female">Female Voices</TabsTrigger>
            <TabsTrigger value="male">Male Voices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="female" className="space-y-3">
            {voices.female.map((voice) => (
              <VoiceCard
                key={voice.id}
                voiceId={voice.id}
                name={voice.name}
                description={voice.description}
                gender="female"
              />
            ))}
          </TabsContent>
          
          <TabsContent value="male" className="space-y-3">
            {voices.male.map((voice) => (
              <VoiceCard
                key={voice.id}
                voiceId={voice.id}
                name={voice.name}
                description={voice.description}
                gender="male"
              />
            ))}
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 Click the play button to preview each voice saying: 
            "Hello! I'm {characterName}. This is how I sound when we chat together."
          </p>
        </div>
      </CardContent>
    </Card>
  );
};