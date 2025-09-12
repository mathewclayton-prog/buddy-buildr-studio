import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus, PawPrint, TrendingUp, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { getActivityStatus, isTrending, isNew } from "@/lib/activityHelpers";

// Helper function to get category tags from personality
const getCategoryTags = (personality: string | null): string[] => {
  if (!personality) return [];
  
  const categoryMap: { [key: string]: string[] } = {
    "Playful and energetic": ["Playful", "Fun"],
    "Wise and contemplative": ["Wise", "Philosophical"],
    "Mysterious and enigmatic": ["Mysterious", "Enigmatic"],
    "Friendly and outgoing": ["Friendly", "Social"],
    "Shy and thoughtful": ["Gentle", "Thoughtful"],
    "Bold and adventurous": ["Bold", "Adventure"],
    "Gentle and nurturing": ["Gentle", "Caring"],
    "Witty and sarcastic": ["Witty", "Humor"],
    "Curious and inquisitive": ["Curious", "Smart"],
    "Calm and peaceful": ["Calm", "Peaceful"]
  };
  
  return categoryMap[personality] || ["Unique"];
};

// Helper function to get star rating based on interaction count
const getStarRating = (interactionCount: number): number => {
  if (interactionCount >= 1000) return 5;
  if (interactionCount >= 500) return 4;
  if (interactionCount >= 200) return 3;
  if (interactionCount >= 50) return 2;
  return 1;
};

// Helper function to render stars
const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, index) => (
    <Star 
      key={index}
      className={`h-3 w-3 ${
        index < rating 
          ? 'text-yellow-400 fill-yellow-400' 
          : 'text-gray-300'
      }`}
    />
  ));
};

interface Catbot {
  id: string;
  name: string;
  description?: string | null; // legacy field for backward compatibility
  public_profile?: string | null;
  personality?: string | null;
  avatar_url: string | null;
  is_public?: boolean;
  interaction_count?: number;
  last_active_at?: string;
  created_at?: string;
}

interface CatbotCardProps {
  catbot: Catbot;
  variant?: 'chat' | 'create';
  delay?: number;
  allInteractionCounts?: number[]; // For trending calculation
}

export const CatbotCard = ({ catbot, variant = 'chat', delay = 0, allInteractionCounts = [] }: CatbotCardProps) => {
  const categoryTags = getCategoryTags(catbot.personality);
  const starRating = getStarRating(catbot.interaction_count || 0);
  const trending = catbot.interaction_count !== undefined && isTrending(catbot.interaction_count, allInteractionCounts);
  const isNewBot = catbot.created_at && isNew(catbot.created_at);

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

  return (
    <Card 
      className="group cursor-pointer overflow-hidden shadow-card hover:shadow-primary transition-all duration-300 hover-scale animate-fade-in bg-card border-0 flex flex-col h-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hero Image Section with Enhanced Overlay */}
      <div className="relative overflow-hidden">
        {catbot.avatar_url ? (
          <img 
            src={catbot.avatar_url} 
            alt={`${catbot.name} avatar`} 
            className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full aspect-[4/3] flex items-center justify-center">
            {getDefaultAvatar()}
          </div>
        )}
        
        {/* Enhanced Overlay with Badges and Activity */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {trending && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs px-2 py-0.5">
                🔥 Trending
              </Badge>
            )}
            {isNewBot && (
              <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0 text-xs px-2 py-0.5">
                ✨ New
              </Badge>
            )}
          </div>

          {/* Activity status - top right */}
          {catbot.last_active_at && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1 text-xs text-white">
                <div className={`w-2 h-2 rounded-full ${
                  getActivityStatus(catbot.last_active_at).includes('Active now') || getActivityStatus(catbot.last_active_at).includes('min ago')
                    ? 'bg-green-400 animate-pulse' 
                    : 'bg-yellow-400'
                }`}></div>
                {getActivityStatus(catbot.last_active_at)}
              </div>
            </div>
          )}

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-bold text-lg leading-tight mb-2">{catbot.name}</h3>
            
            {/* Stats row */}
            <div className="flex items-center justify-between text-white/90 text-xs mb-2">
              {/* Interaction count */}
              {catbot.interaction_count !== undefined && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  💬 {catbot.interaction_count.toLocaleString()} chats
                </div>
              )}
              
              {/* Star rating */}
              <div className="flex items-center gap-1">
                {renderStars(starRating)}
              </div>
            </div>

            {/* Category tags */}
            {categoryTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {categoryTags.slice(0, 2).map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="text-xs px-2 py-0 bg-white/20 text-white border-white/30"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section - Compact but informative */}
      <CardContent className="p-3 flex flex-col flex-1">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1 mb-3">
          {catbot.public_profile || catbot.description || "A mysterious catbot with lots to share"}
        </p>
        
        {/* Chat Button */}
        {variant === 'chat' ? (
          <Button 
            variant="hero" 
            size="sm" 
            className="w-full mt-auto" 
            asChild
          >
            <Link to={`/chat/${catbot.id}`} className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat Now
            </Link>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-auto" 
            asChild
          >
            <Link to="/create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create First
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};