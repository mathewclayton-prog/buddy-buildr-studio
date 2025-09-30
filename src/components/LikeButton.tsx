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

  const [showHearts, setShowHearts] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLiked) {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 1000);
    }
    toggleLike();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLikeClick}
        disabled={isLoading}
        className={`h-6 px-1 py-0 leading-none hover:scale-100 flex items-center gap-1 text-muted-foreground hover:text-primary hover:bg-transparent transition-all duration-300 ${className}`}
      >
        <Heart 
          className={`h-2.5 w-2.5 transition-all duration-300 ${isLiked ? 'fill-primary text-primary' : 'hover:animate-bounce-soft'}`} 
        />
        <span className="text-xs font-medium">{likeCount}</span>
      </Button>
      
      {/* Floating hearts animation */}
      {showHearts && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              className="absolute h-2.5 w-2.5 text-primary fill-primary animate-heart-float"
              style={{
                left: `${20 + i * 10}%`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};