import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CatbotCard } from "@/components/CatbotCard";
import { Bot, Plus, Users, Sparkles, MessageCircle, ArrowRight, Search, TrendingUp, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "@/contexts/SearchContext";
import { useState, useEffect } from "react";
import heroGrassImage from "@/assets/hero-cat-grass-new.png";
interface Catbot {
  id: string;
  name: string;
  description: string | null;
  public_profile?: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  like_count?: number;
  interaction_count?: number;
  tags?: string[];
}

const Index = () => {
  const { user } = useAuth();
  const { allCatbots, filteredCatbots, isSearching, loading, clearSearch } = useSearch();
  
  // Organized sections
  const [mostPopular, setMostPopular] = useState<Catbot[]>([]);
  const [mostRecent, setMostRecent] = useState<Catbot[]>([]);
  const [trending, setTrending] = useState<Catbot[]>([]);
  // Organize catbots when data changes
  useEffect(() => {
    if (allCatbots.length > 0) {
      organizeCatbotSections();
    }
  }, [allCatbots]);

  const organizeCatbotSections = () => {
    // Organize into sections with no duplicates
    // Priority: Popular > Trending > Recent
    
    // 1. Most Popular (top 7 by like_count)
    const popular = [...allCatbots].sort((a, b) => (b.like_count || 0) - (a.like_count || 0)).slice(0, 7);
    const popularIds = new Set(popular.map(c => c.id));
    
    // 2. Trending (top 7 by interaction_count, excluding Popular)
    const remainingAfterPopular = allCatbots.filter(c => !popularIds.has(c.id));
    const trendingData = [...remainingAfterPopular].sort((a, b) => (b.interaction_count || 0) - (a.interaction_count || 0)).slice(0, 7);
    const trendingIds = new Set(trendingData.map(c => c.id));
    
    // 3. Recent (by created_at, excluding Popular and Trending)
    const remainingAfterTrending = remainingAfterPopular.filter(c => !trendingIds.has(c.id));
    const recent = [...remainingAfterTrending].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setMostPopular(popular);
    setTrending(trendingData);
    setMostRecent(recent);
  };
  const getDefaultAvatar = (catbot: Catbot) => {
    const colors = ["from-red-400 to-pink-400", "from-blue-400 to-purple-400", "from-green-400 to-blue-400", "from-yellow-400 to-orange-400", "from-purple-400 to-pink-400", "from-indigo-400 to-purple-400"];
    const colorIndex = catbot.name.charCodeAt(0) % colors.length;
    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
        <Bot className="h-12 w-12 text-white" />
      </div>
    );
  };
  return <>
      <div className="min-h-screen bg-background">
        <Navigation />
        

        {/* Hero Section with Background Image */}
        <main className="w-full aspect-[9/2] relative overflow-hidden" style={{backgroundImage: `url(${heroGrassImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className="absolute inset-0 flex items-start pt-8">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg text-left" style={{fontSize: '25px'}}>
                Chat to a catbot or create your own.
              </h1>
            </div>
          </div>
        </main>

        {/* Content Container */}
        <div className="container mx-auto px-4 py-4">{/* Reduced padding */}

        {/* Search Results */}
        {isSearching && (
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Search Results</h2>
              <p className="text-muted-foreground">
                {filteredCatbots.length} catbot{filteredCatbots.length === 1 ? '' : 's'} found
              </p>
            </div>

            {filteredCatbots.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {filteredCatbots.map((catbot, index) => (
                  <div 
                    key={catbot.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CatbotCard 
                      catbot={catbot} 
                      variant="chat"
                      delay={0}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No catbots found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or browse all available catbots
                </p>
                <Button variant="outline" onClick={clearSearch}>
                  Clear Search
                </Button>
              </div>
            )}
          </section>
        )}

        {/* Organized Sections - Only show when not searching */}
        {!isSearching && (
          <>
            {loading ? (
              // Loading skeleton
              <section className="mb-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[...Array(12)].map((_, index) => (
                    <Card key={index} className="animate-pulse shadow-card overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="h-32 bg-muted animate-scale-pulse" />
                      <CardContent className="p-3">
                        <div className="h-4 bg-muted rounded mb-2 animate-scale-pulse" />
                        <div className="space-y-2 mb-3">
                          <div className="h-3 bg-muted rounded animate-scale-pulse" />
                          <div className="h-3 bg-muted rounded w-3/4 animate-scale-pulse" />
                        </div>
                        <div className="h-8 bg-muted rounded animate-scale-pulse" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ) : allCatbots.length > 0 ? (
              <>
                {/* Most Popular Section */}
                {mostPopular.length > 0 && (
        <section className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold">Most Popular</h2>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        clearSearch();
                        // This will be handled by the search context
                      }}>
                        View All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {mostPopular.slice(0, window.innerWidth >= 1024 ? 7 : 4).map((catbot, index) => (
                        <div 
                          key={catbot.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <CatbotCard 
                            catbot={catbot} 
                            variant="chat"
                            delay={0}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Trending Section */}
                {trending.length > 0 && (
        <section className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold">Trending</h2>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        clearSearch();
                        // This will be handled by the search context
                      }}>
                        View All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {trending.slice(0, window.innerWidth >= 1024 ? 7 : 4).map((catbot, index) => (
                        <div 
                          key={catbot.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <CatbotCard 
                            catbot={catbot} 
                            variant="chat"
                            delay={0}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Most Recent Section */}
                {mostRecent.length > 0 && (
                  <section className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold">Most Recent</h2>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        clearSearch();
                        // This will be handled by the search context
                      }}>
                        View All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {mostRecent.map((catbot, index) => (
                        <div 
                          key={catbot.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <CatbotCard 
                            catbot={catbot} 
                            variant="chat"
                            delay={0}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              // Empty state - show sample cards
              <section className="mb-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[{
                    id: "sample",
                    name: "Be the first!",
                    description: "Create the first public catbot and it will appear here for everyone to discover.",
                    avatar_url: null
                  }].map((catbot, index) => (
                    <div 
                      key={catbot.id}
                      className="animate-fade-in animate-bounce-soft"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CatbotCard 
                        catbot={catbot} 
                        variant="create"
                        delay={0}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        </div>
        
        <Footer />
      </div>
    </>;
};
export default Index;