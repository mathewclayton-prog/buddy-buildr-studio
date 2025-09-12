import { supabase } from "@/integrations/supabase/client";

export interface AudioResponse {
  audioContent: string;
  voiceUsed: string;
  personality: string;
}

class AudioService {
  private audioCache = new Map<string, string>();
  private currentAudio: HTMLAudioElement | null = null;
  private onPlayingChange?: (isPlaying: boolean, messageId?: string) => void;
  private currentMessageId?: string;

  setPlayingChangeCallback(callback: (isPlaying: boolean, messageId?: string) => void) {
    this.onPlayingChange = callback;
  }

  async generateSpeech(text: string, personality: string = 'friendly'): Promise<AudioResponse> {
    const cacheKey = `${text}-${personality}`;
    
    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      const audioContent = this.audioCache.get(cacheKey)!;
      return { audioContent, voiceUsed: 'cached', personality };
    }

    try {
      console.log('🎵 Generating speech for:', text.substring(0, 50) + '...');
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, personality }
      });

      if (error) {
        console.error('Audio generation error:', error);
        throw new Error(error.message || 'Failed to generate speech');
      }

      if (data?.audioContent) {
        // Cache the audio
        this.audioCache.set(cacheKey, data.audioContent);
        
        // Clean cache if it gets too large (keep last 50 items)
        if (this.audioCache.size > 50) {
          const firstKey = this.audioCache.keys().next().value;
          this.audioCache.delete(firstKey);
        }
        
        return data as AudioResponse;
      } else {
        throw new Error('No audio content received');
      }
    } catch (error) {
      console.error('Failed to generate speech:', error);
      throw error;
    }
  }

  async playAudio(audioContent: string, messageId: string): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stopAudio();

      // Create audio element
      const audioBlob = this.base64ToBlob(audioContent, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      this.currentAudio = new Audio(audioUrl);
      this.currentMessageId = messageId;
      
      // Set up event listeners
      this.currentAudio.addEventListener('play', () => {
        this.onPlayingChange?.(true, messageId);
      });
      
      this.currentAudio.addEventListener('ended', () => {
        this.stopAudio();
      });
      
      this.currentAudio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        this.stopAudio();
      });

      // Play the audio
      await this.currentAudio.play();
      
    } catch (error) {
      console.error('Failed to play audio:', error);
      this.onPlayingChange?.(false, messageId);
      throw error;
    }
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      
      // Clean up
      const audioUrl = this.currentAudio.src;
      if (audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      
      this.currentAudio = null;
      this.onPlayingChange?.(false, this.currentMessageId);
      this.currentMessageId = undefined;
    }
  }

  isPlaying(messageId?: string): boolean {
    if (!messageId) {
      return this.currentAudio !== null && !this.currentAudio.paused;
    }
    return this.currentMessageId === messageId && this.currentAudio !== null && !this.currentAudio.paused;
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  clearCache(): void {
    this.audioCache.clear();
  }
}

// Export singleton instance
export const audioService = new AudioService();
