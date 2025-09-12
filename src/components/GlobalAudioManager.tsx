import { useEffect } from "react";
import { audioService } from "@/services/audioService";

/**
 * Global audio manager component that handles app-wide audio cleanup
 * Should be mounted once at the app level
 */
const GlobalAudioManager = () => {
  useEffect(() => {
    // Cleanup audio when navigating away from the page
    const handleBeforeUnload = () => {
      audioService.stopAudio();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup audio when visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        audioService.stopAudio();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audioService.stopAudio();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default GlobalAudioManager;