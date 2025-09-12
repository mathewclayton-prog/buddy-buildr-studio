import React, { useState, useEffect, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CharacterForChat } from '@/types/character';

interface VoiceConversationProps {
  character: CharacterForChat;
  onConversationUpdate?: (transcription: string, isUser: boolean) => void;
  className?: string;
}

const VoiceConversation: React.FC<VoiceConversationProps> = ({
  character,
  onConversationUpdate,
  className = ""
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Create character-specific prompt
  const characterPrompt = `You are ${character.name}, a virtual cat companion. ${character.trainingDescription}

Personality traits: ${character.personalityTraits.join(', ')}

Instructions:
- Respond as ${character.name} would, staying true to the personality
- Keep responses conversational and engaging
- Use the character's unique voice and mannerisms
- Be helpful while maintaining the character's personality
- Respond naturally as if you're having a real conversation`;

  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice conversation connected');
      setIsConnected(true);
      toast({
        title: "Connected",
        description: `Now talking with ${character.name}`,
      });
    },
    onDisconnect: () => {
      console.log('Voice conversation disconnected');
      setIsConnected(false);
      setConversationId(null);
      toast({
        title: "Disconnected",
        description: "Voice conversation ended",
      });
    },
    onMessage: (message: any) => {
      console.log('Conversation message:', message);
      
      // Handle different message types based on ElevenLabs Conversational AI format
      if (message && typeof message === 'object') {
        // Handle user transcription
        if (message.source === 'user' && message.message) {
          onConversationUpdate?.(message.message, true);
        }
        // Handle agent response
        else if (message.source === 'ai' && message.message) {
          onConversationUpdate?.(message.message, false);
        }
      }
    },
    onError: (error: any) => {
      console.error('Voice conversation error:', error);
      toast({
        title: "Voice Error",
        description: typeof error === 'string' ? error : (error?.message || "An error occurred during the conversation"),
        variant: "destructive",
      });
    },
    overrides: {
      agent: {
        prompt: {
          prompt: characterPrompt,
        },
        firstMessage: `Hello! I'm ${character.name}. How are you doing today?`,
        language: "en",
      },
    },
  });

  const startConversation = async () => {
    try {
      console.log('🎙️ Starting voice conversation...');
      
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted');
      
      // Create a dynamic agent for this character
      console.log('🤖 Creating ElevenLabs agent for character:', character.name);
      
      // For now, show a helpful error message since we need ElevenLabs setup
      toast({
        title: "Voice Chat Setup Required",
        description: "ElevenLabs Conversational AI setup is needed. This feature requires an ElevenLabs API key and agent configuration.",
        variant: "destructive",
      });
      
      console.log('❌ ElevenLabs setup required');
      
      // TODO: Implement actual agent creation and session start
      // const agentId = await createAgent({
      //   name: character.name,
      //   prompt: characterPrompt
      // });
      // const id = await conversation.startSession({ agentId });
      // setConversationId(id);
      // await conversation.setVolume({ volume });
      
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      toast({
        title: "Cannot Start Conversation", 
        description: error.message || "Please ensure microphone access is granted and try again.",
        variant: "destructive",
      });
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  const handleVolumeChange = useCallback(async (newVolume: number) => {
    setVolume(newVolume);
    if (isConnected) {
      await conversation.setVolume({ volume: newVolume });
    }
  }, [isConnected, conversation]);

  const toggleMute = useCallback(async () => {
    const newVolume = isMuted ? volume : 0;
    setIsMuted(!isMuted);
    if (isConnected) {
      await conversation.setVolume({ volume: newVolume });
    }
  }, [isMuted, volume, isConnected, conversation]);

  return (
    <Card className={`p-4 bg-background/50 border-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Voice Chat</span>
          </div>
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              Connected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center gap-2">
                <VolumeX className="h-3 w-3 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <Volume2 className="h-3 w-3 text-muted-foreground" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        {!isConnected ? (
          <Button
            onClick={startConversation}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <Phone className="h-4 w-4 mr-2" />
            Start Voice Chat
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {conversation.isSpeaking && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    {character.name} is speaking...
                  </span>
                </div>
              )}
              
              {isConnected && !conversation.isSpeaking && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Listening...</span>
                </div>
              )}
            </div>
            
            <Button
              onClick={endConversation}
              variant="destructive"
              size="lg"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              End Call
            </Button>
          </div>
        )}
      </div>

      {isConnected && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Having a voice conversation with {character.name}. 
            Speak naturally - no need to wait for pauses!
          </p>
        </div>
      )}
      
      {!isConnected && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
            ⚠️ Live voice chat requires ElevenLabs Conversational AI setup with API key and agent configuration.
          </p>
        </div>
      )}
    </Card>
  );
};

export default VoiceConversation;