import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";

interface Catbot {
  id: string;
  name: string;
  description: string | null;
  personality?: string | null;
  avatar_url: string | null;
  is_public?: boolean;
  created_at?: string;
}

interface CatbotCardProps {
  catbot: Catbot;
  variant?: 'chat' | 'create';
  delay?: number;
}

export const CatbotCard = ({ catbot, variant = 'chat', delay = 0 }: CatbotCardProps) => {
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
      className="group cursor-pointer overflow-hidden shadow-card hover:shadow-primary transition-all duration-300 hover-scale animate-fade-in bg-card border-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hero Image Section - Flexible height to maintain aspect ratio */}
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
        
        {/* Overlay Title */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3">
          <h3 className="text-white font-bold text-lg leading-tight">{catbot.name}</h3>
        </div>
      </div>

      {/* Content Section - Compact spacing */}
      <CardContent className="p-3 space-y-2">
        {/* Description - closer to title */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {catbot.description || "A mysterious catbot with lots to share"}
        </p>
        
        {/* Chat Button - closer to description */}
        {variant === 'chat' ? (
          <Button 
            variant="hero" 
            size="sm" 
            className="w-full mt-2" 
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
            className="w-full mt-2" 
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