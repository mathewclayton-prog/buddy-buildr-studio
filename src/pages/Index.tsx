import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CatbotCard } from "@/components/CatbotCard";
import { PawTrail } from "@/components/PawTrail";
import { Bot, Plus, Users, Sparkles, PawPrint, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
interface Catbot {
  id: string;
  name: string;
  description: string | null;
  public_profile?: string | null;
  personality: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  like_count?: number;
  interaction_count?: number;
  tags?: string[];
}
const heroCat = "/lovable-uploads/057d2f0d-a602-456f-b685-1e284a57e2c5.png";
const Index = () => {
  const {
    user
  } = useAuth();
  const [featuredCatbots, setFeaturedCatbots] = useState<Catbot[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadFeaturedCatbots();
  }, []);
  const loadFeaturedCatbots = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('catbots').select('id, name, description, public_profile, personality, avatar_url, created_at, updated_at, is_public, like_count, interaction_count, tags').eq('is_public', true).order('created_at', {
        ascending: false
      }).limit(60);
      if (error) throw error;
      setFeaturedCatbots(data || []);
    } catch (error) {
      console.error('Error loading featured catbots:', error);
    } finally {
      setLoading(false);
    }
  };
  const getDefaultAvatar = (catbot: Catbot) => {
    const colors = ["from-red-400 to-pink-400", "from-blue-400 to-purple-400", "from-green-400 to-blue-400", "from-yellow-400 to-orange-400", "from-purple-400 to-pink-400", "from-indigo-400 to-purple-400"];
    const colorIndex = catbot.name.charCodeAt(0) % colors.length;
    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
        <PawPrint className="h-12 w-12 text-white" />
      </div>
    );
  };
  return <>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Hero Image - Full Page Width */}
        <div className="w-screen bg-card overflow-hidden shadow-card">
          <img src={heroCat} alt="MiCatbot Hero" className="w-full h-auto object-cover" />
        </div>

        {/* Hero Section */}
        <main className="container mx-auto px-4 pt-8 pb-16">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Create Your Own Catbot</h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"> Bring your own feline friend to life or build a purrfect companion.</p>

          <PawTrail className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? <>
                <Button variant="hero" size="lg" asChild className="px-8 py-4 text-lg hover-scale">
                  <Link to="/create" className="flex items-center gap-3">
                    <Plus className="h-5 w-5 animate-bounce-soft" />
                    Create Catbot
                    <Sparkles className="h-4 w-4 animate-float" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild className="px-8 py-4 text-lg hover-scale">
                  <Link to="/browse" className="flex items-center gap-3">
                    <PawPrint className="h-5 w-5 animate-wiggle" />
                    Meet the Cats
                  </Link>
                </Button>
              </> : <>
                <Button variant="hero" size="lg" asChild className="px-8 py-4 text-lg hover-scale">
                  <Link to="/auth" className="flex items-center gap-3">
                    <PawPrint className="h-5 w-5 animate-wiggle" />
                    Get Started
                    <Sparkles className="h-4 w-4 animate-float" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild className="px-8 py-4 text-lg hover-scale">
                  <Link to="/browse" className="flex items-center gap-3">
                    <PawPrint className="h-5 w-5 animate-bounce-soft" />
                    Meet the Cats
                  </Link>
                </Button>
              </>}
          </PawTrail>
        </div>

        {/* Popular Catbots Section */}
        <section className="mt-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-nav-orange">Explore Our Wonderful Cats</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start chatting now...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {loading ?
          // Loading skeleton
          [...Array(12)].map((_, index) => <Card key={index} className="animate-pulse shadow-card overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="h-32 bg-muted animate-scale-pulse" />
                  <CardContent className="p-3">
                    <div className="h-4 bg-muted rounded mb-2 animate-scale-pulse" />
                    <div className="space-y-2 mb-3">
                      <div className="h-3 bg-muted rounded animate-scale-pulse" />
                      <div className="h-3 bg-muted rounded w-3/4 animate-scale-pulse" />
                    </div>
                    <div className="h-8 bg-muted rounded animate-scale-pulse" />
                  </CardContent>
                </Card>) : featuredCatbots.length > 0 ?
          // Real catbots from database
          featuredCatbots.map((catbot, index) => (
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
          )) :
          // Empty state - show sample cards
          [{
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

          <div className="text-center">
            <Button variant="outline" size="lg" asChild className="px-8">
              <Link to="/browse" className="flex items-center gap-2">
                View All Catbots
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        </main>
        
        <Footer />
      </div>
    </>;
};
export default Index;