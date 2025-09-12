import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder } from "@/utils/audioRecorder";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceInput = ({ onTranscription, disabled = false, className }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if audio recording is supported
    if (!AudioRecorder.isSupported()) {
      setIsSupported(false);
      return;
    }

    // Initialize recorder
    recorderRef.current = new AudioRecorder({
      onDataAvailable: handleAudioData,
      onError: handleError,
      onStatusChange: (status) => {
        setIsRecording(status === 'recording');
        setIsProcessing(status === 'processing');
      }
    });

    return () => {
      recorderRef.current?.destroy();
    };
  }, []);

  const handleAudioData = async (audioData: string) => {
    try {
      console.log('🎤 Sending audio for transcription...');
      
      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { audio: audioData }
      });

      if (error) {
        throw new Error(error.message || 'Failed to transcribe audio');
      }

      if (data?.text) {
        console.log('✅ Transcription received:', data.text);
        onTranscription(data.text);
        toast({
          title: "Voice message transcribed",
          description: "Your message has been converted to text",
        });
      } else {
        throw new Error('No transcription received');
      }

    } catch (error) {
      console.error('Transcription error:', error);
      handleError(error instanceof Error ? error.message : 'Failed to transcribe audio');
    }
  };

  const handleError = (errorMessage: string) => {
    toast({
      title: "Voice Input Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const toggleRecording = async () => {
    if (!recorderRef.current || disabled) return;

    try {
      if (isRecording) {
        recorderRef.current.stopRecording();
      } else {
        await recorderRef.current.startRecording();
      }
    } catch (error) {
      console.error('Recording toggle error:', error);
    }
  };

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleRecording}
        disabled={disabled || isProcessing}
        className={cn(
          "h-8 w-8 rounded-full transition-all duration-200",
          isRecording ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "hover:bg-accent",
          isProcessing && "cursor-not-allowed opacity-50"
        )}
        title={
          isProcessing 
            ? "Processing audio..." 
            : isRecording 
              ? "Stop recording" 
              : "Start voice input"
        }
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -top-1 -right-1">
          <div className="h-3 w-3 bg-red-500 rounded-full animate-ping" />
          <div className="absolute top-0 right-0 h-3 w-3 bg-red-600 rounded-full" />
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-background border rounded-md px-2 py-1 text-xs text-muted-foreground whitespace-nowrap">
          Transcribing...
        </div>
      )}
    </div>
  );
};

export default VoiceInput;