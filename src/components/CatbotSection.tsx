import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CatbotCard } from "@/components/CatbotCard";
import { ArrowRight, Star, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { PublicCharacter } from "@/lib/characterQueries";

interface CatbotSectionProps {
  title: string;
  subtitle: string;
  catbots: PublicCharacter[];
  loading: boolean;
  sectionType: 'popular' | 'recent' | 'staff' | 'starter';
  showMore?: boolean;
}

const getSectionIcon = (type: string) => {
  switch (type) {
    case 'popular':
      return <TrendingUp className="h-5 w-5 text-orange-500" />;
    case 'recent':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'staff':
      return <Star className="h-5 w-5 text-yellow-500" />;
    case 'starter':
      return <Sparkles className="h-5 w-5 text-green-500" />;
    default:
      return <TrendingUp className="h-5 w-5" />;
  }
};

const getSectionBadge = (type: string) => {
  switch (type) {
    case 'popular':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-700">🔥 Hot</Badge>;
    case 'recent':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">✨ New</Badge>;
    case 'staff':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">⭐ Curated</Badge>;
    case 'starter':
      return <Badge variant="secondary" className="bg-green-100 text-green-700">🚀 Beginner</Badge>;
    default:
      return null;
  }
};

export const CatbotSection = ({ 
  title, 
  subtitle, 
  catbots, 
  loading, 
  sectionType, 
  showMore = true 
}: CatbotSectionProps) => {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getSectionIcon(sectionType)}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
              {getSectionBadge(sectionType)}
            </div>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        
        {showMore && !loading && catbots.length > 0 && (
          <Button variant="outline" asChild>
            <Link to="/browse" className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(sectionType === 'starter' ? 4 : 6)].map((_, index) => (
            <Card key={index} className="animate-pulse shadow-card overflow-hidden">
              <div className="h-32 bg-muted" />
              <CardContent className="p-3">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : catbots.length > 0 ? (
        <div className={`grid gap-4 ${
          sectionType === 'starter' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {catbots.map((catbot, index) => (
            <CatbotCard 
              key={catbot.id} 
              catbot={catbot} 
              variant="chat"
              delay={index * 100}
              allInteractionCounts={catbots.map(c => c.interaction_count)}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground mb-4">
              No catbots available in this category yet.
            </div>
            <Button asChild>
              <Link to="/create">Create the First One!</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
};