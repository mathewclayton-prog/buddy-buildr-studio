export interface AudioRecorderConfig {
  onDataAvailable?: (audioData: string) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'idle' | 'recording' | 'processing') => void;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private config: AudioRecorderConfig;
  private status: 'idle' | 'recording' | 'processing' = 'idle';

  constructor(config: AudioRecorderConfig = {}) {
    this.config = config;
  }

  private updateStatus(newStatus: 'idle' | 'recording' | 'processing') {
    this.status = newStatus;
    this.config.onStatusChange?.(newStatus);
  }

  async startRecording(): Promise<void> {
    try {
      // Request microphone access with optimal settings for speech
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Optimal for speech recognition
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Reset chunks
      this.audioChunks = [];

      // Create MediaRecorder with webm format (widely supported)
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        this.updateStatus('processing');
        await this.processAudio();
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.config.onError?.('Recording failed. Please try again.');
        this.updateStatus('idle');
      };

      // Start recording
      this.mediaRecorder.start();
      this.updateStatus('recording');

    } catch (error) {
      console.error('Error starting recording:', error);
      let errorMessage = 'Failed to access microphone. ';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow microphone access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No microphone found. Please check your audio devices.';
        } else {
          errorMessage += error.message;
        }
      }
      
      this.config.onError?.(errorMessage);
      this.updateStatus('idle');
      throw error;
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    // Stop all tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  private async processAudio(): Promise<void> {
    try {
      if (this.audioChunks.length === 0) {
        this.config.onError?.('No audio data recorded. Please try speaking again.');
        this.updateStatus('idle');
        return;
      }

      // Create blob from chunks
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // Convert to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Remove data URL prefix
      const audioData = base64Audio.replace(/^data:audio\/webm;base64,/, '');
      
      this.config.onDataAvailable?.(audioData);
      this.updateStatus('idle');

    } catch (error) {
      console.error('Error processing audio:', error);
      this.config.onError?.('Failed to process audio. Please try again.');
      this.updateStatus('idle');
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  getStatus(): 'idle' | 'recording' | 'processing' {
    return this.status;
  }

  isRecording(): boolean {
    return this.status === 'recording';
  }

  isProcessing(): boolean {
    return this.status === 'processing';
  }

  // Check if browser supports audio recording
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
  }

  // Clean up resources
  destroy(): void {
    this.stopRecording();
    this.audioChunks = [];
    this.mediaRecorder = null;
  }
}