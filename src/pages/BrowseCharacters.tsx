import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Bot, MessageCircle, Plus, Users, Search, Sparkles, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Catbot {
  id: string;
  name: string;
  description: string | null;
  personality: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
const BrowseCharacters = () => {
  const [catbots, setCatbots] = useState<Catbot[]>([]);
  const [filteredCatbots, setFilteredCatbots] = useState<Catbot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPublicCatbots();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCatbots(catbots);
    } else {
      const filtered = catbots.filter(catbot => 
        catbot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (catbot.description && catbot.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (catbot.personality && catbot.personality.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCatbots(filtered);
    }
  }, [catbots, searchQuery]);

  const loadPublicCatbots = async () => {
    try {
      const { data, error } = await supabase
        .from('catbots')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCatbots(data || []);
      setFilteredCatbots(data || []);
    } catch (error) {
      console.error('Error loading public catbots:', error);
      toast({
        title: "Error",
        description: "Failed to load catbots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAvatar = (catbot: Catbot) => {
    const colors = ["from-red-400 to-pink-400", "from-blue-400 to-purple-400", "from-green-400 to-blue-400", "from-yellow-400 to-orange-400", "from-purple-400 to-pink-400", "from-indigo-400 to-purple-400"];
    const colorIndex = catbot.name.charCodeAt(0) % colors.length;
    return (
      <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center shadow-soft`}>
        <PawPrint className="h-7 w-7 text-white" />
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Explore Community Cats</h1>
          <p className="text-lg text-muted-foreground mb-6">
            {loading ? "Loading catbots..." : catbots.length > 0 ? `Discover and chat with ${catbots.length} amazing catbot${catbots.length === 1 ? '' : 's'} created by our community` : "No public catbots available yet. Be the first to share yours!"}
          </p>
        </div>

        {/* Search Bar */}
        {catbots.length > 0 && (
          <div className="max-w-md mx-auto mb-8 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search catbots by name, description, or personality..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10 bg-card shadow-soft" 
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-muted rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-20" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && catbots.length === 0 && (
          <div className="text-center animate-scale-in">
            <div className="h-24 w-24 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
              <Users className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No public catbots yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to create and share a catbot with the community!</p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/create" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create First Public Catbot
              </Link>
            </Button>
          </div>
        )}

        {/* No Results State */}
        {!loading && catbots.length > 0 && filteredCatbots.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No catbots found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or browse all available catbots
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Catbot Grid */}
        {!loading && filteredCatbots.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {filteredCatbots.map((catbot, index) => (
              <Card 
                key={catbot.id} 
                className="shadow-card hover:shadow-primary transition-all duration-300 group hover-scale animate-fade-in" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {catbot.avatar_url ? (
                        <img 
                          src={catbot.avatar_url} 
                          alt={catbot.name} 
                          className="h-14 w-14 rounded-full object-cover shadow-soft" 
                        />
                      ) : (
                        getDefaultAvatar(catbot)
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{catbot.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {catbot.personality ? `${catbot.personality} personality` : "Unique personality"}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {catbot.description || "A mysterious catbot with lots to share"}
                  </p>
                  
                  {catbot.personality && (
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {catbot.personality}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button variant="hero" className="w-full" asChild>
                      <Link to={`/chat/${catbot.id}`} className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Chat Now
                        <Sparkles className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create New Catbot Button */}
        {!loading && catbots.length > 0 && (
          <div className="text-center mt-12 animate-fade-in">
            <Button variant="outline" size="lg" asChild className="hover-scale">
              <Link to="/create" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Catbot
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
export default BrowseCharacters;