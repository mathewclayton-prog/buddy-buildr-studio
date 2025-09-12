import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ElevenLabsAgent {
  id: string;
  name: string;
  voice_id: string;
  prompt: string;
}

interface CreateAgentRequest {
  name: string;
  prompt: string;
  voice_id?: string;
}

export const useElevenLabsAgent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createAgent = useCallback(async (agentData: CreateAgentRequest): Promise<ElevenLabsAgent | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-elevenlabs-agent', {
        body: agentData
      });

      if (error) throw error;

      toast({
        title: "Agent Created",
        description: `Successfully created ElevenLabs agent: ${agentData.name}`,
      });

      return data.agent;
    } catch (error) {
      console.error('Error creating ElevenLabs agent:', error);
      toast({
        title: "Error",
        description: "Failed to create ElevenLabs agent. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getSignedUrl = useCallback(async (agentId: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-elevenlabs-url', {
        body: { agentId }
      });

      if (error) throw error;

      return data.signed_url;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      toast({
        title: "Error",
        description: "Failed to get conversation URL. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    createAgent,
    getSignedUrl,
    isLoading
  };
};