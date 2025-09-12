import { useState, useEffect } from "react";
import { Brain, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MemoryIndicatorProps {
  catbotId: string;
}

interface UserMemory {
  relationship_depth: number;
  interests: any;
  mentioned_problems: any;
  personality_traits: any;
  inside_jokes: any;
  important_events: any;
}

const MemoryIndicator = ({ catbotId }: MemoryIndicatorProps) => {
  const { user } = useAuth();
  const [memory, setMemory] = useState<UserMemory | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchMemory = async () => {
      const { data } = await supabase
        .from('user_memory_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('catbot_id', catbotId)
        .single();
      
      if (data) {
        setMemory(data);
      }
    };

    fetchMemory();
  }, [user?.id, catbotId]);

  if (!memory) return null;

  const relationshipLevel = memory.relationship_depth || 1;
  const getRelationshipLabel = (level: number) => {
    if (level <= 2) return "Getting acquainted";
    if (level <= 5) return "Becoming friends";
    if (level <= 8) return "Close friends";
    return "Very close bond";
  };

  const getHeartCount = (level: number) => {
    return Math.min(Math.ceil(level / 2), 5);
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className="h-6 px-2 gap-1"
      >
        <Brain className="h-3 w-3" />
        <span className="hidden sm:inline">Memory</span>
      </Button>
      
      <div className="flex items-center gap-1">
        {[...Array(getHeartCount(relationshipLevel))].map((_, i) => (
          <Heart key={i} className="h-3 w-3 fill-red-400 text-red-400" />
        ))}
        {[...Array(5 - getHeartCount(relationshipLevel))].map((_, i) => (
          <Heart key={i + getHeartCount(relationshipLevel)} className="h-3 w-3 text-gray-300" />
        ))}
      </div>

      {showDetails && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-card border rounded-lg shadow-lg z-10 min-w-64">
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium">Relationship:</span>
              <p className="text-xs text-muted-foreground">{getRelationshipLabel(relationshipLevel)}</p>
            </div>
            
            {Array.isArray(memory.interests) && memory.interests.length > 0 && (
              <div>
                <span className="text-xs font-medium">Your interests:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {memory.interests.slice(0, 3).map((interest, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {memory.interests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{memory.interests.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {Array.isArray(memory.personality_traits) && memory.personality_traits.length > 0 && (
              <div>
                <span className="text-xs font-medium">Noticed traits:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {memory.personality_traits.slice(0, 2).map((trait, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryIndicator;