import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Bot, Plus, Users, Sparkles, PawPrint, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
interface Catbot {
  id: string;
  name: string;
  description: string | null;
  personality: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
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
      } = await supabase.from('catbots').select('*').eq('is_public', true).order('created_at', {
        ascending: false
      }).limit(8);
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
        <PawPrint className="h-8 w-8 text-white" />
      </div>
    );
  };
  return <>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Hero Image - Full Page Width */}
        <div className="w-full h-48 bg-card overflow-hidden shadow-card" style={{width: '100vw', marginLeft: 'calc(50% - 50vw)'}}>
          <img src={heroCat} alt="MiCatbot Hero" className="h-full w-full object-cover" />
        </div>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Create Your Own Catbot</h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"> Bring your own feline friend to life or build a purrfect companion.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? <>
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
              </> : <>
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
              </>}
          </div>
        </div>

        {/* Popular Catbots Section */}
        <section className="mt-24 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Explore Our Wonderful Cats</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start chatting now...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {loading ?
          // Loading skeleton
          [...Array(8)].map((_, index) => <Card key={index} className="animate-pulse shadow-card">
                  <CardHeader className="pb-3">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted" />
                    <div className="h-4 bg-muted rounded w-20 mx-auto" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                    <div className="h-8 bg-muted rounded" />
                  </CardContent>
                </Card>) : featuredCatbots.length > 0 ?
          // Real catbots from database
          featuredCatbots.map((catbot, index) => <Card key={catbot.id} className="hover-scale cursor-pointer group shadow-card hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden shadow-soft">
                      {catbot.avatar_url ? (
                        <img 
                          src={catbot.avatar_url} 
                          alt={`${catbot.name} avatar`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                      ) : (
                        getDefaultAvatar(catbot)
                      )}
                    </div>
                    <CardTitle className="text-center text-lg">{catbot.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-center mb-4 text-sm line-clamp-3">
                      {catbot.description || "A mysterious catbot with lots to share"}
                    </CardDescription>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to={`/chat/${catbot.id}`} className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Chat Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>) :
          // Empty state - show sample cards
          [{
            name: "Be the first!",
            description: "Create the first public catbot and it will appear here for everyone to discover.",
            avatar: null
          }].map((catbot, index) => <Card key={index} className="hover-scale cursor-pointer group shadow-card hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden shadow-soft bg-muted flex items-center justify-center">
                      <PawPrint className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-center text-lg">{catbot.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-center mb-4 text-sm line-clamp-3">
                      {catbot.description}
                    </CardDescription>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/create" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create First
                      </Link>
                    </Button>
                  </CardContent>
                </Card>)}
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