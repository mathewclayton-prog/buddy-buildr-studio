import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { X, Upload, Sparkles, Bot, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Character } from "@/types/character";
import { storageService } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const PERSONALITY_OPTIONS = [
  { value: "Friendly", label: "Friendly", description: "Warm, welcoming, and approachable" },
  { value: "Mysterious", label: "Mysterious", description: "Enigmatic and intriguing" },
  { value: "Wise", label: "Wise", description: "Knowledgeable and thoughtful" },
  { value: "Playful", label: "Playful", description: "Fun-loving and energetic" },
  { value: "Serious", label: "Serious", description: "Focused and professional" },
];

const COLOR_OPTIONS = [
  "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", 
  "#EF4444", "#EC4899", "#6366F1", "#84CC16"
];

const CreateCharacter = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [avatarColor, setAvatarColor] = useState(COLOR_OPTIONS[0]);
  const [avatarType, setAvatarType] = useState<"upload" | "color">("color");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim() || !personality) {
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
        personalityTraits: [personality],
        avatar: avatarType === "upload" ? avatar : undefined,
        avatarColor: avatarType === "color" ? avatarColor : undefined,
        createdAt: new Date(),
      };

      storageService.saveCharacter(character);
      
      toast({
        title: "Character Created!",
        description: `${character.name} has been created successfully.`,
      });

      // Redirect to chat with the new character
      navigate(`/chat/${character.id}`);
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
        setAvatarType("upload");
      };
      reader.readAsDataURL(file);
    }
  };

  const getPreviewAvatar = () => {
    if (avatarType === "upload" && avatar) {
      return (
        <img
          src={avatar}
          alt="Character preview"
          className="h-16 w-16 rounded-full object-cover shadow-soft"
        />
      );
    }
    
    return (
      <div
        className="h-16 w-16 rounded-full flex items-center justify-center shadow-soft"
        style={{ backgroundColor: avatarColor }}
      >
        <Bot className="h-8 w-8 text-white" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Create Your Character
          </h1>
          <p className="text-lg text-muted-foreground">
            Design a unique AI personality and start chatting immediately
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto animate-fade-in">
          {/* Form Section */}
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
                {/* Character Name */}
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

                {/* Character Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your character's background, role, and general characteristics..."
                    rows={4}
                    maxLength={200}
                  />
                  <p className="text-sm text-muted-foreground">
                    {description.length}/200 characters
                  </p>
                </div>

                {/* Personality Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="personality">Personality *</Label>
                  <Select value={personality} onValueChange={setPersonality}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choose a personality type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      {PERSONALITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="hover:bg-accent">
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Avatar Section */}
                <div className="space-y-4">
                  <Label>Character Avatar</Label>
                  
                  {/* Avatar Type Toggle */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={avatarType === "color" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAvatarType("color")}
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Color Icon
                    </Button>
                    <Button
                      type="button"
                      variant={avatarType === "upload" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAvatarType("upload")}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>

                  {/* Color Picker */}
                  {avatarType === "color" && (
                    <div className="space-y-2">
                      <Label>Icon Color</Label>
                      <div className="flex gap-2 flex-wrap">
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`h-8 w-8 rounded-full border-2 hover:scale-110 transition-transform ${
                              avatarColor === color ? "border-primary ring-2 ring-primary/20" : "border-border"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setAvatarColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Upload */}
                  {avatarType === "upload" && (
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-4">
                        {avatar ? (
                          <div className="relative">
                            <img
                              src={avatar}
                              alt="Character avatar"
                              className="h-16 w-16 rounded-full object-cover shadow-soft"
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
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("avatar")?.click()}
                        >
                          {avatar ? "Change Image" : "Upload Image"}
                        </Button>
                      </div>
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
                    disabled={isLoading || !name.trim() || !description.trim() || !personality}
                    className="flex-1"
                  >
                    {isLoading ? "Creating..." : "Create Character"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your character will appear
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Character Card Preview */}
              <div className="p-6 bg-gradient-secondary rounded-xl border">
                <div className="flex items-center gap-4 mb-4">
                  {getPreviewAvatar()}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {name || "Character Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {personality ? `${personality} personality` : "Select a personality"}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {description || "Character description will appear here..."}
                </p>
                
                <Button variant="chat" size="sm" disabled>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Chatting
                </Button>
              </div>

              {/* Chat Preview */}
              <div className="space-y-4">
                <h4 className="font-medium">Chat Preview</h4>
                <div className="bg-card border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {getPreviewAvatar()}
                    <div className="bg-muted rounded-2xl px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        {name ? `Hello! I'm ${name}.` : "Hello! I'm your character."} {
                          personality === "Friendly" ? "I'm excited to chat with you!" :
                          personality === "Mysterious" ? "There are many secrets to uncover..." :
                          personality === "Wise" ? "I'm here to share knowledge and wisdom." :
                          personality === "Playful" ? "Let's have some fun together!" :
                          personality === "Serious" ? "I'm ready for our conversation." :
                          "How can I help you today?"
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2 max-w-xs">
                      <p className="text-sm">Hi there! Nice to meet you.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateCharacter;