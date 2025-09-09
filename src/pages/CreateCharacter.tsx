import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Character } from "@/types/character";
import { storageService } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const CreateCharacter = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [newTrait, setNewTrait] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const addTrait = () => {
    if (newTrait.trim() && !personalityTraits.includes(newTrait.trim())) {
      setPersonalityTraits([...personalityTraits, newTrait.trim()]);
      setNewTrait("");
    }
  };

  const removeTrait = (trait: string) => {
    setPersonalityTraits(personalityTraits.filter(t => t !== trait));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const character: Character = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim(),
        personalityTraits,
        avatar: avatar || undefined,
        createdAt: new Date(),
      };

      storageService.saveCharacter(character);
      
      toast({
        title: "Character Created!",
        description: `${character.name} has been created successfully.`,
      });

      navigate("/browse");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create character. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Create Your Character
            </h1>
            <p className="text-lg text-muted-foreground">
              Bring your imagination to life with a unique AI personality
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Character Details
              </CardTitle>
              <CardDescription>
                Fill in the details to create your AI character
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar (Optional)</Label>
                  <div className="flex items-center gap-4">
                    {avatar ? (
                      <div className="relative">
                        <img
                          src={avatar}
                          alt="Character avatar"
                          className="h-20 w-20 rounded-full object-cover shadow-soft"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => setAvatar("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div>
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("avatar")?.click()}
                      >
                        Upload Image
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Character Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Luna the Wise"
                    maxLength={50}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your character's background, role, and general characteristics..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-sm text-muted-foreground">
                    {description.length}/500 characters
                  </p>
                </div>

                {/* Personality Traits */}
                <div className="space-y-2">
                  <Label>Personality Traits</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTrait}
                      onChange={(e) => setNewTrait(e.target.value)}
                      placeholder="Add a personality trait..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTrait())}
                      maxLength={30}
                    />
                    <Button type="button" onClick={addTrait} size="icon" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {personalityTraits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {personalityTraits.map((trait) => (
                        <Badge key={trait} variant="secondary" className="gap-1">
                          {trait}
                          <button
                            type="button"
                            onClick={() => removeTrait(trait)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/browse")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="hero"
                    disabled={isLoading || !name.trim() || !description.trim()}
                    className="flex-1"
                  >
                    {isLoading ? "Creating..." : "Create Character"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateCharacter;