import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Bot, MessageCircle, Plus, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Character } from "@/types/character";
import { storageService } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const BrowseCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = () => {
    const stored = storageService.getCharacters();
    setCharacters(stored);
  };

  const deleteCharacter = (id: string) => {
    if (confirm("Are you sure you want to delete this character?")) {
      storageService.deleteCharacter(id);
      loadCharacters();
      toast({
        title: "Character Deleted",
        description: "The character has been removed.",
      });
    }
  };

  const getDefaultAvatar = (character: Character) => {
    if (character.avatarColor) {
      return (
        <div 
          className="h-12 w-12 rounded-full flex items-center justify-center shadow-soft"
          style={{ backgroundColor: character.avatarColor }}
        >
          <Bot className="h-6 w-6 text-white" />
        </div>
      );
    }
    
    const colors = [
      "from-red-400 to-pink-400",
      "from-blue-400 to-purple-400",
      "from-green-400 to-blue-400",
      "from-yellow-400 to-orange-400",
      "from-purple-400 to-pink-400",
      "from-indigo-400 to-purple-400",
    ];
    const colorIndex = character.name.charCodeAt(0) % colors.length;
    return (
      <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
        <Bot className="h-6 w-6 text-white" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Character Gallery
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {characters.length > 0 
              ? `Discover and chat with your ${characters.length} created character${characters.length === 1 ? '' : 's'}`
              : "No characters created yet. Start by creating your first character!"
            }
          </p>
          
          {characters.length === 0 && (
            <Button variant="hero" size="lg" asChild>
              <Link to="/create" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Your First Character
              </Link>
            </Button>
          )}
        </div>

        {characters.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <Card key={character.id} className="shadow-card hover:shadow-primary transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {character.avatar ? (
                        <img
                          src={character.avatar}
                          alt={character.name}
                          className="h-12 w-12 rounded-full object-cover shadow-soft"
                        />
                      ) : (
                        getDefaultAvatar(character)
                      )}
                      <div>
                        <CardTitle className="text-lg">{character.name}</CardTitle>
                        <CardDescription className="text-sm">
                          Created {new Date(character.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCharacter(character.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {character.description}
                  </p>
                  
                  {character.personalityTraits.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Personality Traits:</p>
                      <div className="flex flex-wrap gap-1">
                        {character.personalityTraits.slice(0, 4).map((trait) => (
                          <Badge key={trait} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                        {character.personalityTraits.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{character.personalityTraits.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button 
                      variant="chat" 
                      className="w-full" 
                      asChild
                    >
                      <Link to={`/chat/${character.id}`} className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Start Chatting
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {characters.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/create" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Another Character
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowseCharacters;