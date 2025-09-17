import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { CatbotCard } from "@/components/CatbotCard";
import { TagFilter } from "@/components/TagFilter";
import { Bot, MessageCircle, Plus, Users, Search, Sparkles, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getPublicCharacters, type PublicCharacter } from "@/lib/characterQueries";
const BrowseCharacters = () => {
  const [catbots, setCatbots] = useState<PublicCharacter[]>([]);
  const [filteredCatbots, setFilteredCatbots] = useState<PublicCharacter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadPublicCatbots();
  }, []);
  useEffect(() => {
    let filtered = catbots;

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(catbot => 
        catbot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (catbot.public_profile || catbot.description) && 
        (catbot.public_profile || catbot.description)!.toLowerCase().includes(searchQuery.toLowerCase()) || 
        catbot.personality && catbot.personality.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(catbot => 
        catbot.tags && catbot.tags.some(tag => selectedTags.includes(tag))
      );
    }

    setFilteredCatbots(filtered);
  }, [catbots, searchQuery, selectedTags]);
  const loadPublicCatbots = async () => {
    try {
      const data = await getPublicCharacters();
      setCatbots(data);
      setFilteredCatbots(data);
      
      // Extract all available tags
      const allTags = data.flatMap(catbot => catbot.tags || []);
      const uniqueTags = Array.from(new Set(allTags)).sort();
      setAvailableTags(uniqueTags);
    } catch (error) {
      console.error('Error loading public catbots:', error);
      toast({
        title: "Error",
        description: "Failed to load catbots. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getDefaultAvatar = (catbot: PublicCharacter) => {
    const colors = ["from-red-400 to-pink-400", "from-blue-400 to-purple-400", "from-green-400 to-blue-400", "from-yellow-400 to-orange-400", "from-purple-400 to-pink-400", "from-indigo-400 to-purple-400"];
    const colorIndex = catbot.name.charCodeAt(0) % colors.length;
    return <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center shadow-soft`}>
        <PawPrint className="h-10 w-10 text-white" />
      </div>;
  };
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Talk to our Wonderful Cats</h1>
          <p className="text-lg text-muted-foreground mb-6">
            {loading ? "Loading catbots..." : catbots.length > 0 ? `Discover and chat with ${catbots.length} amazing catbot${catbots.length === 1 ? '' : 's'} created by our community` : "No public catbots available yet. Be the first to share yours!"}
          </p>
        </div>

        {/* Search and Filter Bar */}
        {catbots.length > 0 && (
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
            <div className="flex justify-center">
              <TagFilter
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {[...Array(8)].map((_, i) => <Card key={i} className="animate-pulse shadow-card overflow-hidden">
                <div className="h-32 bg-muted" />
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="space-y-2 mb-3">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                  <div className="h-8 bg-muted rounded" />
                </CardContent>
              </Card>)}
          </div>}

        {/* Empty State */}
        {!loading && catbots.length === 0 && <div className="text-center animate-scale-in">
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
          </div>}

        {/* No Results State */}
        {!loading && catbots.length > 0 && filteredCatbots.length === 0 && <div className="text-center py-12 animate-fade-in">
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
          </div>}

        {/* Catbot Grid */}
        {!loading && filteredCatbots.length > 0 && <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7 animate-fade-in">
            {filteredCatbots.map((catbot, index) => (
              <div 
                key={catbot.id}
                className={`animate-fade-in animate-stagger-${(index % 4) + 1}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CatbotCard 
                  catbot={catbot} 
                  variant="chat"
                  delay={0}
                />
              </div>
            ))}
          </div>}

        {/* Create New Catbot Button */}
        {!loading && catbots.length > 0 && <div className="text-center mt-12 animate-fade-in">
            <Button variant="outline" size="lg" asChild className="hover-scale">
              <Link to="/create" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Catbot
              </Link>
            </Button>
          </div>}
      </main>
    </div>;
};
export default BrowseCharacters;