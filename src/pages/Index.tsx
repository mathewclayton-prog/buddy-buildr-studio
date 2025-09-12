import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CatbotCard } from "@/components/CatbotCard";
import { RecentActivityFeed } from "@/components/RecentActivityFeed";
import { Plus, Users, Sparkles, PawPrint, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getPublicCharacters, type PublicCharacter } from "@/lib/characterQueries";
import { generateActivityFeed, getRandomOnlineCount } from "@/lib/activityHelpers";

const heroCat = "/lovable-uploads/057d2f0d-a602-456f-b685-1e284a57e2c5.png";

const Index = () => {
  const { user } = useAuth();
  const [featuredCatbots, setFeaturedCatbots] = useState<PublicCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    loadFeaturedCatbots();
  }, []);

  useEffect(() => {
    // Update online count every 30 seconds
    const updateOnlineCount = () => setOnlineCount(getRandomOnlineCount());
    updateOnlineCount();
    const interval = setInterval(updateOnlineCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadFeaturedCatbots = async () => {
    try {
      const data = await getPublicCharacters('popular');
      const featured = data.slice(0, 6); // Get top 6 most popular
      setFeaturedCatbots(featured);
      
      // Generate activity feed
      const activities = generateActivityFeed(data);
      setActivityFeed(activities);
    } catch (error) {
      console.error('Error loading featured catbots:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Image - Full Page Width */}
      <div className="w-screen bg-card overflow-hidden shadow-card">
        <img src={heroCat} alt="MiCatbot Hero" className="w-full h-auto object-cover" />
      </div>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Create Your Own Catbot
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Bring your own feline friend to life or build a purrfect companion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <>
                <Button variant="hero" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/create" className="flex items-center gap-3">
                    <Plus className="h-5 w-5" />
                    Create Character
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/browse" className="flex items-center gap-3">
                    <PawPrint className="h-5 w-5" />
                    Meet the Cats
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="hero" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/auth" className="flex items-center gap-3">
                    <PawPrint className="h-5 w-5" />
                    Get Started
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/browse" className="flex items-center gap-3">
                    <PawPrint className="h-5 w-5" />
                    Meet the Cats
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 mb-16">
          {/* Featured Catbots - Left Side (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-nav-orange">🔥 Trending Cats</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Meet our most popular catbots that everyone is talking to
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {loading ? (
                // Loading skeleton
                [...Array(6)].map((_, index) => (
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
                ))
              ) : featuredCatbots.length > 0 ? (
                // Real catbots from database
                featuredCatbots.map((catbot, index) => (
                  <CatbotCard 
                    key={catbot.id} 
                    catbot={catbot} 
                    variant="chat"
                    delay={index * 100}
                    allInteractionCounts={featuredCatbots.map(c => c.interaction_count)}
                  />
                ))
              ) : (
                // Empty state - show sample cards
                [{
                  id: "sample",
                  name: "Be the first!",
                  public_profile: "Create the first public catbot and it will appear here for everyone to discover.",
                  avatar_url: null,
                  interaction_count: 0,
                  created_at: new Date().toISOString(),
                  last_active_at: new Date().toISOString()
                } as PublicCharacter].map((catbot, index) => (
                  <CatbotCard 
                    key={catbot.id} 
                    catbot={catbot} 
                    variant="create"
                    delay={index * 100}
                  />
                ))
              )}
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg" asChild className="px-8">
                <Link to="/browse" className="flex items-center gap-2">
                  View All Catbots
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Activity Feed - Right Side (1/3 width) */}
          <div className="lg:col-span-1">
            <RecentActivityFeed 
              activities={activityFeed} 
              onlineCount={onlineCount}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;