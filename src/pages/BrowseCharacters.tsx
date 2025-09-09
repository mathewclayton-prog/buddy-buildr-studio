import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Bot, MessageCircle, Plus, Trash2, Users, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Character } from "@/types/character";
import { storageService } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
const BrowseCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadCharacters();
  }, []);
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCharacters(characters);
    } else {
      const filtered = characters.filter(character => character.name.toLowerCase().includes(searchQuery.toLowerCase()) || character.description.toLowerCase().includes(searchQuery.toLowerCase()) || character.personalityTraits.some(trait => trait.toLowerCase().includes(searchQuery.toLowerCase())));
      setFilteredCharacters(filtered);
    }
  }, [characters, searchQuery]);
  const loadCharacters = () => {
    const stored = storageService.getCharacters();
    setCharacters(stored);
    setFilteredCharacters(stored);
  };
  const deleteCharacter = (id: string, characterName: string) => {
    if (confirm(`Are you sure you want to delete ${characterName}?`)) {
      storageService.deleteCharacter(id);
      loadCharacters();
      toast({
        title: "Character Deleted",
        description: `${characterName} has been removed.`
      });
    }
  };
  const getDefaultAvatar = (character: Character) => {
    if (character.avatarColor) {
      return <div className="h-14 w-14 rounded-full flex items-center justify-center shadow-soft" style={{
        backgroundColor: character.avatarColor
      }}>
          <Bot className="h-7 w-7 text-white" />
        </div>;
    }
    const colors = ["from-red-400 to-pink-400", "from-blue-400 to-purple-400", "from-green-400 to-blue-400", "from-yellow-400 to-orange-400", "from-purple-400 to-pink-400", "from-indigo-400 to-purple-400"];
    const colorIndex = character.name.charCodeAt(0) % colors.length;
    return <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center shadow-soft`}>
        <Bot className="h-7 w-7 text-white" />
      </div>;
  };
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Chat to a cat</h1>
          <p className="text-lg text-muted-foreground mb-6">
            {characters.length > 0 ? `Discover and chat with your ${characters.length} created character${characters.length === 1 ? '' : 's'}` : "No characters created yet. Start by creating your first character!"}
          </p>
        </div>

        {/* Search Bar */}
        {characters.length > 0 && <div className="max-w-md mx-auto mb-8 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Search characters by name, description, or traits..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-card shadow-soft" />
            </div>
          </div>}

        {/* Empty State */}
        {characters.length === 0 && <div className="text-center animate-scale-in">
            <div className="h-24 w-24 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
              <Users className="h-12 w-12 text-white" />
            </div>
            <Button variant="hero" size="lg" asChild>
              <Link to="/create" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Your First Character
              </Link>
            </Button>
          </div>}

        {/* No Results State */}
        {characters.length > 0 && filteredCharacters.length === 0 && <div className="text-center py-12 animate-fade-in">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No characters found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or create a new character
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>}

        {/* Character Grid */}
        {filteredCharacters.length > 0 && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {filteredCharacters.map((character, index) => <Card key={character.id} className="shadow-card hover:shadow-primary transition-all duration-300 group hover-scale animate-fade-in" style={{
          animationDelay: `${index * 0.1}s`
        }}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {character.avatar ? <img src={character.avatar} alt={character.name} className="h-14 w-14 rounded-full object-cover shadow-soft" /> : getDefaultAvatar(character)}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{character.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {character.personalityTraits[0] || "Unique"} personality
                        </CardDescription>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="icon" onClick={() => deleteCharacter(character.id, character.name)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {character.description}
                  </p>
                  
                  {character.personalityTraits.length > 0 && <div className="flex flex-wrap gap-1">
                      {character.personalityTraits.slice(0, 3).map(trait => <Badge key={trait} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>)}
                      {character.personalityTraits.length > 3 && <Badge variant="outline" className="text-xs">
                          +{character.personalityTraits.length - 3}
                        </Badge>}
                    </div>}
                  
                  <div className="pt-2">
                    <Button variant="hero" className="w-full" asChild>
                      <Link to={`/chat/${character.id}`} className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Chat Now
                        <Sparkles className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>}

        {/* Create New Character Button */}
        {characters.length > 0 && <div className="text-center mt-12 animate-fade-in">
            <Button variant="outline" size="lg" asChild className="hover-scale">
              <Link to="/create" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Character
              </Link>
            </Button>
          </div>}
      </main>
    </div>;
};
export default BrowseCharacters;