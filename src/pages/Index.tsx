import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CatbotCard } from "@/components/CatbotCard";
import { TagFilter } from "@/components/TagFilter";
import { Bot, Plus, Users, Sparkles, MessageCircle, ArrowRight, Search, TrendingUp, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
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
  const [allCatbots, setAllCatbots] = useState<Catbot[]>([]);
  const [filteredCatbots, setFilteredCatbots] = useState<Catbot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Organized sections
  const [mostPopular, setMostPopular] = useState<Catbot[]>([]);
  const [mostRecent, setMostRecent] = useState<Catbot[]>([]);
  const [trending, setTrending] = useState<Catbot[]>([]);
  
  const isSearching = searchQuery.trim() !== "" || selectedTags.length > 0;
  useEffect(() => {
    loadAllCatbots();
  }, []);

  useEffect(() => {
    if (isSearching) {
      let filtered = allCatbots;

      // Filter by search query
      if (searchQuery.trim() !== "") {
        filtered = filtered.filter(catbot => 
          catbot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (catbot.description && catbot.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (catbot.public_profile && catbot.public_profile.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Filter by selected tags
      if (selectedTags.length > 0) {
        filtered = filtered.filter(catbot => 
          catbot.tags && catbot.tags.some(tag => selectedTags.includes(tag))
        );
      }

      setFilteredCatbots(filtered);
    }
  }, [allCatbots, searchQuery, selectedTags, isSearching]);
  const loadAllCatbots = async () => {
    try {
      const { data, error } = await supabase
        .from('catbots')
        .select('id, name, description, public_profile, avatar_url, created_at, updated_at, is_public, like_count, interaction_count, tags')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const catbots = data || [];
      setAllCatbots(catbots);
      
      // Extract all available tags
      const allTags = catbots.flatMap(catbot => catbot.tags || []);
      const uniqueTags = Array.from(new Set(allTags)).sort();
      setAvailableTags(uniqueTags);
      
      // Organize into sections with no duplicates
      // Priority: Popular > Trending > Recent
      
      // 1. Most Popular (top 7 by like_count)
      const popular = [...catbots].sort((a, b) => (b.like_count || 0) - (a.like_count || 0)).slice(0, 7);
      const popularIds = new Set(popular.map(c => c.id));
      
      // 2. Trending (top 7 by interaction_count, excluding Popular)
      const remainingAfterPopular = catbots.filter(c => !popularIds.has(c.id));
      const trendingData = [...remainingAfterPopular].sort((a, b) => (b.interaction_count || 0) - (a.interaction_count || 0)).slice(0, 7);
      const trendingIds = new Set(trendingData.map(c => c.id));
      
      // 3. Recent (by created_at, excluding Popular and Trending)
      const remainingAfterTrending = remainingAfterPopular.filter(c => !trendingIds.has(c.id));
      const recent = [...remainingAfterTrending].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setMostPopular(popular);
      setTrending(trendingData);
      setMostRecent(recent);
    } catch (error) {
      console.error('Error loading catbots:', error);
    } finally {
      setLoading(false);
    }
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
        

        {/* Hero Section */}
        <main className="container mx-auto px-4 pt-4 pb-16">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
          
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-black">Create Your Own Catbot</h1>
          
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto"> Bring your own cat to life or build a purrfect companion.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? <>
                <Button variant="hero" size="lg" asChild className="px-8 py-4 text-lg hover-scale">
                  <Link to="/create" className="flex items-center gap-3">
                    <Plus className="h-5 w-5 animate-bounce-soft" />
                    Create Catbot
                    <Sparkles className="h-4 w-4 animate-float" />
                  </Link>
                </Button>
              </> : <>
                <Button variant="hero" size="lg" asChild className="px-8 py-4 text-lg hover-scale">
                  <Link to="/auth" className="flex items-center gap-3">
                    <ArrowRight className="h-5 w-5 animate-wiggle" />
                    Get Started
                    <Sparkles className="h-4 w-4 animate-float" />
                  </Link>
                </Button>
              </>}
          </div>
        </div>

        {/* Start Chatting Section */}
        <section className="mt-4 mb-4">
          <div className="text-center mb-8">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Or start chatting to one of our cats now...
            </p>
          </div>

          {/* Search and Filter Bar */}
          {allCatbots.length > 0 && (
            <div className="max-w-4xl mx-auto mb-8 animate-fade-in space-y-4">
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Search catbots by name, description, or personality..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    className="pl-10 bg-card shadow-soft" 
                  />
                </div>
              </div>
              
              {/* Tag Filter */}
              {availableTags.length > 0 && (
                <div className="flex justify-center">
                  <TagFilter
                    availableTags={availableTags}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                  />
                </div>
              )}
            </div>
          )}
        </section>

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
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setSelectedTags([]);
                }}>
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
                        setSearchQuery("");
                        setSelectedTags([]);
                        // Sort all by popularity and show in search results
                        const sorted = [...allCatbots].sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
                        setFilteredCatbots(sorted);
                        setSearchQuery("popularity");
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
                        setSearchQuery("");
                        setSelectedTags([]);
                        // Sort all by interaction count and show in search results
                        const sorted = [...allCatbots].sort((a, b) => (b.interaction_count || 0) - (a.interaction_count || 0));
                        setFilteredCatbots(sorted);
                        setSearchQuery("trending");
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
                        setSearchQuery("");
                        setSelectedTags([]);
                        // Sort all by creation date and show in search results
                        const sorted = [...allCatbots].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                        setFilteredCatbots(sorted);
                        setSearchQuery("recent");
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

        </main>
        
        <Footer />
      </div>
    </>;
};
export default Index;