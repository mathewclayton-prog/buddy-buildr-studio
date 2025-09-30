import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus, PawPrint } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LikeButton } from "@/components/LikeButton";
import { StatsDisplay } from "@/components/StatsDisplay";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Catbot {
  id: string;
  name: string;
  description?: string | null; // legacy field for backward compatibility
  public_profile?: string | null;
  avatar_url: string | null;
  is_public?: boolean;
  created_at?: string;
  like_count?: number;
  interaction_count?: number;
  tags?: string[];
}

interface CatbotCardProps {
  catbot: Catbot;
  variant?: 'chat' | 'create';
  delay?: number;
}

export const CatbotCard = ({ catbot, variant = 'chat', delay = 0 }: CatbotCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getDefaultAvatar = () => {
    const colors = [
      "from-red-400 to-pink-400", 
      "from-blue-400 to-purple-400", 
      "from-green-400 to-blue-400", 
      "from-yellow-400 to-orange-400", 
      "from-purple-400 to-pink-400", 
      "from-indigo-400 to-purple-400"
    ];
    const colorIndex = catbot.name.charCodeAt(0) % colors.length;
    
    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
        <PawPrint className="h-16 w-16 text-white" />
      </div>
    );
  };

  const handleChatClick = (e: React.MouseEvent) => {
    if (variant === 'chat' && !user) {
      e.preventDefault();
      toast({
        title: "Authentication Required",
        description: "Please sign in to start chatting with catbots.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (variant === 'chat') {
      return (
        <div onClick={handleChatClick} className="block cursor-pointer">
          {user ? (
            <Link to={`/chat/${catbot.id}`} className="block">
              {children}
            </Link>
          ) : (
            <div className="block">
              {children}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <Link to="/create" className="block">
          {children}
        </Link>
      );
    }
  };

  return (
    <CardWrapper>
      <Card 
        className="group cursor-pointer overflow-hidden shadow-card hover:shadow-primary transition-all duration-300 hover-lift-subtle animate-fade-in bg-card border border-primary flex flex-col h-60 w-full"
        style={{ animationDelay: `${delay}ms` }}
      >
      {/* Hero Image Section - Flexible height to maintain aspect ratio */}
      <div className="relative overflow-hidden">
        {catbot.avatar_url ? (
          <img 
            src={catbot.avatar_url} 
            alt={`${catbot.name} avatar`} 
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center">
            {getDefaultAvatar()}
          </div>
        )}
        
        {/* Overlay Title */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3">
          <h3 className="text-white font-bold text-xs md:text-sm lg:text-xs xl:text-sm leading-tight">{catbot.name}</h3>
        </div>
      </div>

      {/* Content Section - Ultra-compact spacing */}
      <CardContent className="px-1 pt-1 pb-0.5 flex flex-col flex-1">
        {/* Description - minimal spacing */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
          {catbot.public_profile || catbot.description || "A mysterious catbot with lots to share"}
        </p>
        
        {/* Stats and Like Button */}
        <div className="flex items-center justify-between mt-0.5">
          <StatsDisplay 
            interactionCount={catbot.interaction_count || 0}
          />
          <LikeButton 
            catbotId={catbot.id}
            initialLikeCount={catbot.like_count || 0}
          />
        </div>
        
      </CardContent>
    </Card>
    </CardWrapper>
  );
};