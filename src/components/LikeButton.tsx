import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LikeButtonProps {
  catbotId: string;
  initialLikeCount: number;
  className?: string;
}

export const LikeButton = ({ catbotId, initialLikeCount, className }: LikeButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, catbotId]);

  const checkIfLiked = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('catbot_likes')
        .select('id')
        .eq('catbot_id', catbotId)
        .eq('user_id', user.id)
        .single();
      
      setIsLiked(!!data);
    } catch (error) {
      // No like found - this is expected for unliked catbots
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like catbots",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('catbot_likes')
          .delete()
          .eq('catbot_id', catbotId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        // Add like
        const { error } = await supabase
          .from('catbot_likes')
          .insert({ catbot_id: catbotId, user_id: user.id });
        
        if (error) throw error;
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        toggleLike();
      }}
      disabled={isLoading}
      className={`flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors ${className}`}
    >
      <Heart 
        className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
      />
      <span className="text-xs">{likeCount}</span>
    </Button>
  );
};