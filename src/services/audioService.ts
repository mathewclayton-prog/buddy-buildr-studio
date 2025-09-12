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

      // Normalize and validate base64 content
      const normalizedContent = this.normalizeBase64(audioContent);
      if (!this.validateBase64(normalizedContent)) {
        throw new Error('Invalid base64 audio content');
      }

      // Create audio element
      const audioBlob = this.base64ToBlob(normalizedContent, 'audio/mpeg');
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
        const audioError = e.target as HTMLAudioElement;
        const errorCode = audioError.error?.code;
        const errorMessage = this.getMediaErrorMessage(errorCode);
        console.error('Audio playback error:', {
          code: errorCode,
          message: errorMessage,
          src: audioError.src,
          readyState: audioError.readyState,
          networkState: audioError.networkState
        });
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

  private normalizeBase64(base64: string): string {
    // Remove any whitespace and newlines
    return base64.replace(/\s/g, '');
  }

  private validateBase64(base64: string): boolean {
    try {
      // Test if the base64 string is valid
      atob(base64);
      return true;
    } catch (error) {
      console.error('Invalid base64 content:', error);
      return false;
    }
  }

  private getMediaErrorMessage(errorCode?: number): string {
    switch (errorCode) {
      case 1: return 'MEDIA_ERR_ABORTED: The operation was aborted';
      case 2: return 'MEDIA_ERR_NETWORK: A network error occurred';
      case 3: return 'MEDIA_ERR_DECODE: A decoding error occurred';
      case 4: return 'MEDIA_ERR_SRC_NOT_SUPPORTED: The audio format is not supported';
      default: return 'Unknown media error';
    }
  }
}

// Export singleton instance
export const audioService = new AudioService();
