import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { X, Upload, Bot, Palette, Globe, Lock, Camera, Loader2, Plus, Sparkles, Tag } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { uploadImage, validateImageFile } from "@/lib/imageStorage";
import { getCharacterForEdit, upsertCharacterTrainingData } from "@/lib/characterQueries";
import { validateCharacterContent } from "@/utils/contentModeration";
import { useAnalytics } from "@/hooks/useAnalytics";
import { PREDEFINED_TAGS } from "@/constants/tags";
// Constants removed - personality dropdown and color options no longer needed
const CreateCharacter = () => {
  const { user } = useAuth();
  const { catbotId } = useParams();
  const isEditMode = !!catbotId;
  const { trackEvent } = useAnalytics();
  const [name, setName] = useState("");
  const [publicProfile, setPublicProfile] = useState("");
  const [trainingDescription, setTrainingDescription] = useState("");
  const [greeting, setGreeting] = useState("");
  const [advancedDefinition, setAdvancedDefinition] = useState("");
  const [creationMode, setCreationMode] = useState<"standard" | "enhanced">("standard");
  const [suggestedStarters, setSuggestedStarters] = useState<string[]>(["", "", ""]);
  const [avatar, setAvatar] = useState<string>("");
  const [avatarType, setAvatarType] = useState<"upload" | "color" | "ai">("color");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Tag management state
  const [tags, setTags] = useState<string[]>([]);
  

  // Image upload states
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Load existing catbot data if in edit mode
  useEffect(() => {
    if (isEditMode && catbotId && user) {
      loadCatbotData();
    }
  }, [isEditMode, catbotId, user]);
  const loadCatbotData = async () => {
    try {
      const data = await getCharacterForEdit(catbotId, user.id);
      
      if (!data) {
        throw new Error('Catbot not found or access denied');
      }

      // Populate form with existing data, handling backward compatibility
      setName(data.name);
      setPublicProfile(data.public_profile || (data.description ? data.description.substring(0, 40) : "")); // Use legacy description if no public_profile
      setTrainingDescription(data.training_description || data.description || ""); // Use legacy description if no training_description
      setGreeting((data as any).greeting || "");
      setAdvancedDefinition((data as any).advanced_definition || "");
      setCreationMode((data as any).creation_mode || "standard");
      setSuggestedStarters((data as any).suggested_starters || ["", "", ""]);
      setIsPublic(data.is_public);
      setTags(data.tags || []);
      
      if (data.avatar_url) {
        setAvatar(data.avatar_url);
        setAvatarType("upload");
      }
    } catch (error) {
      console.error('Error loading catbot:', error);
      toast({
        title: "Error",
        description: "Failed to load catbot data. Redirecting to create mode.",
        variant: "destructive"
      });
      navigate('/create');
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a catbot.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    if (!name.trim() || !publicProfile.trim() || !trainingDescription.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (publicProfile.length > 80) {
      toast({
        title: "Validation Error",
        description: "Public Profile must be 80 characters or less.",
        variant: "destructive"
      });
      return;
    }

    if (trainingDescription.length > 10000) {
      toast({
        title: "Validation Error",
        description: "Personality & History must be 10000 characters or less.",
        variant: "destructive"
      });
      return;
    }

    // Content moderation check
    const contentValidation = validateCharacterContent({
      name,
      publicProfile,
      trainingDescription,
      greeting,
      advancedDefinition
    });

    if (!contentValidation.isValid) {
      toast({
        title: "Content Policy Violation",
        description: contentValidation.message || "Your content violates our community guidelines. Please review and revise.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Debug avatar state before saving
      console.debug('Saving catbot - mode:', isEditMode ? 'edit' : 'create', {
        avatarType,
        avatar
      });
      // Separate catbot data (for main table) from training data (for separate table)
      const catbotData = {
        name: name.trim(),
        public_profile: publicProfile.trim(),
        tags: tags.length > 0 ? tags : null,
        avatar_url: avatar || null,
        is_public: isPublic,
        greeting: greeting.trim() || null,
        advanced_definition: advancedDefinition.trim() || null,
        creation_mode: creationMode,
        suggested_starters: suggestedStarters.filter(s => s.trim())
      };

      const trainingData = {
        training_description: trainingDescription.trim()
      };

      if (isEditMode) {
        // Update existing catbot
        const {
          data,
          error
        } = await supabase.from('catbots').update(catbotData).eq('id', catbotId).eq('user_id', user.id).select().single();
        if (error) throw error;

        // Update training data
        await upsertCharacterTrainingData(catbotId, trainingData);

        toast({
          title: "Catbot Updated!",
          description: `${catbotData.name} has been updated successfully.`
        });

        // Redirect to the updated catbot
        navigate(`/chat/${data.id}`);
      } else {
        // Create new catbot
        const newCatbotData = {
          user_id: user.id,
          ...catbotData
        };
        const {
          data,
          error
        } = await supabase.from('catbots').insert([newCatbotData]).select().single();
        if (error) throw error;

        // Insert training data for the new catbot
        await upsertCharacterTrainingData(data.id, trainingData);

        // Track catbot created event
        trackEvent('catbot_created', {
          creation_mode: creationMode,
          is_public: isPublic,
          has_avatar: !!avatar,
          tag_count: tags.length
        });

        toast({
          title: "Catbot Created!",
          description: `${catbotData.name} has been created successfully.`
        });

        // Redirect to the new catbot
        navigate(`/chat/${data.id}`);
      }
    } catch (error: any) {
      console.error('Error saving catbot:', error);
      toast({
        title: "Error",
        description: error?.message ? `Failed to save catbot: ${error.message}` : "Failed to save catbot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Image upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }
    setSelectedFile(file);

    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowImageDialog(true);
    };
    reader.readAsDataURL(file);
  };
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const {
      width,
      height
    } = e.currentTarget;
    const size = Math.min(width, height);
    const x = (width - size) / 2;
    const y = (height - size) / 2;
    setCrop({
      unit: 'px',
      width: size,
      height: size,
      x: x,
      y: y
    });
  }, []);
  const getCroppedCanvas = (image: HTMLImageElement, crop: PixelCrop): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Set canvas to 300x300px for catbot images
    canvas.width = 300;
    canvas.height = 300;

    // Calculate the scale
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, 300, 300);
    return canvas;
  };
  const handleUploadImage = async () => {
    if (!selectedFile || !completedCrop || !imgRef.current) return;
    setIsUploading(true);
    try {
      let fileToUpload: File;
      
      // Check if the file is a GIF
      if (selectedFile.type === 'image/gif') {
        // For GIFs, preserve the original file to maintain animation
        // Apply basic size limit if needed but don't crop to avoid breaking animation
        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit for GIFs
          throw new Error('GIF file is too large. Please use a file smaller than 5MB.');
        }
        
        const timestamp = Date.now();
        fileToUpload = new File([selectedFile], `catbot-${timestamp}.gif`, {
          type: 'image/gif'
        });
      } else {
        // For static images, use the existing cropping logic
        const canvas = getCroppedCanvas(imgRef.current, completedCrop);

        // Convert canvas to blob
        const blob = await new Promise<Blob>(resolve => {
          canvas.toBlob(blob => {
            resolve(blob!);
          }, 'image/jpeg', 0.9);
        });

        // Create file from blob
        fileToUpload = new File([blob], `catbot-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
      }

      // Upload to Supabase Storage
      const result = await uploadImage(fileToUpload, 'catbots');
      if (result.error || !result.data) {
        throw new Error(result.error);
      }

      // Set the avatar URL
      setAvatar(result.data.publicUrl);
      setAvatarType("upload");
      console.debug('Image uploaded, avatar URL:', result.data.publicUrl);
      toast({
        title: "Success",
        description: `${selectedFile.type === 'image/gif' ? 'Animated GIF' : 'Image'} uploaded successfully`
      });

      // Close dialog and reset states
      handleCancelUpload();
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  const handleCancelUpload = () => {
    setShowImageDialog(false);
    setSelectedFile(null);
    setImageSrc("");
    setCrop({
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0
    });
    setCompletedCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleRemoveImage = () => {
    setAvatar("");
    setAvatarType("color");
  };

  // Generate AI avatar
  const handleGenerateAvatar = async () => {
    if (!user?.id || !name.trim() || !trainingDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in name and description before generating an avatar.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingAvatar(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-avatar', {
        body: {
          name: name.trim(),
          description: trainingDescription.trim(),
          personality: "friendly", // Default value for avatar generation
          userId: user.id
        }
      });

      if (error) {
        throw error;
      }

      if (data.success && data.avatarUrl) {
        setAvatar(data.avatarUrl);
        setAvatarType("upload");
        toast({
          title: "Avatar Generated!",
          description: "Your AI-generated avatar has been created successfully.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate avatar');
      }
    } catch (error: any) {
      console.error('Avatar generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  // Tag management functions
  const addTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 4) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };
  const getPreviewAvatar = () => {
    if (avatarType === "upload" && avatar) {
      return <img src={avatar} alt="Character preview" className="h-16 w-16 rounded-lg object-cover shadow-soft" />;
    }
    return <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-soft">
        <Bot className="h-8 w-8 text-white" />
      </div>;
  };
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {isEditMode ? 'Edit Your Cat' : 'Create Your Cat'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isEditMode ? 'Update the details of your cat' : 'Tell us all about the cat you have in mind.'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto animate-fade-in">
          {/* Form Section */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Cat Details
              </CardTitle>
              
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Character Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Cat Name *</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Luna the Wise" maxLength={50} />
                </div>

                {/* Public Profile */}
                <div className="space-y-2">
                  <Label htmlFor="publicProfile">Public Profile *</Label>
                  <Textarea 
                    id="publicProfile" 
                    value={publicProfile} 
                    onChange={e => setPublicProfile(e.target.value)} 
                     placeholder="Write a punchy, engaging description in 40 characters or less. This appears on your cat's card when people browse." 
                    rows={2} 
                    maxLength={40}
                  />
                  <p className="text-sm text-muted-foreground">
                    <span className={publicProfile.length > 40 ? "text-destructive font-medium" : ""}>
                      {publicProfile.length}/40 characters
                    </span>
                    {" - Keep it brief and catchy for cards"}
                  </p>
                </div>

                {/* Personality & History */}
                <div className="space-y-2">
                  <Label htmlFor="trainingDescription">Personality & History *</Label>
                  <Textarea 
                    id="trainingDescription" 
                    value={trainingDescription} 
                    onChange={e => setTrainingDescription(e.target.value)} 
                    placeholder="Let us know as much as possible about your cat! Their personality and traits, likes and dislikes, favourite toys and places to sleep. Whether they live with any other pets etc. Also (if you want) mention other members of your family the cat interacts with, how old it is etc. This is private and used to train your cat." 
                    rows={8} 
                    maxLength={10000} 
                  />
                  <p className="text-sm text-muted-foreground">
                    <span className={trainingDescription.length > 10000 ? "text-destructive font-medium" : ""}>
                      {trainingDescription.length}/10000 characters
                    </span>
                    {" - Private training instructions"}
                  </p>
                </div>

                {/* Creation Mode Toggle */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Creation Mode</Label>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="creation-mode" className="text-sm font-normal">
                        {creationMode === "standard" ? "Standard" : "Enhanced"}
                      </Label>
                      <Switch
                        id="creation-mode"
                        checked={creationMode === "enhanced"}
                        onCheckedChange={(checked) => setCreationMode(checked ? "enhanced" : "standard")}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {creationMode === "standard" 
                      ? "Standard mode provides essential fields for creating your cat." 
                      : "Enhanced mode includes advanced features like dialog examples and conversation starters."}
                  </p>
                </div>

                {/* Greeting Field */}
                <div className="space-y-2">
                  <Label htmlFor="greeting">Opening Message</Label>
                  <Textarea 
                    id="greeting" 
                    value={greeting} 
                    onChange={e => setGreeting(e.target.value)} 
                    placeholder="How should your cat greet users when they start a conversation? This sets the scene and tone." 
                    rows={3} 
                    maxLength={4000}
                  />
                  <p className="text-sm text-muted-foreground">
                    <span className={greeting.length > 4000 ? "text-destructive font-medium" : ""}>
                      {greeting.length}/4000 characters
                    </span>
                    {" - Sets the opening scene for conversations"}
                  </p>
                </div>

                {/* Enhanced Mode Fields */}
                {creationMode === "enhanced" && (
                  <>
                    {/* Advanced Definition */}
                    <div className="space-y-2">
                      <Label htmlFor="advancedDefinition">Advanced Definition</Label>
                      <Textarea 
                        id="advancedDefinition" 
                        value={advancedDefinition} 
                        onChange={e => setAdvancedDefinition(e.target.value)} 
                        placeholder="Use dialog examples to show your cat's speaking style. Use {{char}} for your cat's name and {{user}} for the user. Example:&#10;{{user}}: Hello!&#10;{{char}}: *purrs softly* Well hello there! I was just lounging in the sunbeam by the window." 
                        rows={8} 
                        maxLength={32000}
                      />
                      <p className="text-sm text-muted-foreground">
                        <span className={advancedDefinition.length > 32000 ? "text-destructive font-medium" : ""}>
                          {advancedDefinition.length}/32000 characters
                        </span>
                        {" - Dialog examples with variables like {{char}} and {{user}}"}
                      </p>
                    </div>

                    {/* Conversation Starters */}
                    <div className="space-y-4">
                      <Label>Conversation Starters</Label>
                      {suggestedStarters.map((starter, index) => (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={`starter-${index}`} className="text-sm">Starter {index + 1}</Label>
                          <Input
                            id={`starter-${index}`}
                            value={starter}
                            onChange={e => {
                              const newStarters = [...suggestedStarters];
                              newStarters[index] = e.target.value;
                              setSuggestedStarters(newStarters);
                            }}
                            placeholder="Example conversation starter..."
                            maxLength={200}
                          />
                          <p className="text-xs text-muted-foreground">
                            {starter.length}/200 characters
                          </p>
                        </div>
                      ))}
                    </div>

                  </>
                )}

                {/* Tags Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags ({tags.length}/4)
                    </Label>
                  </div>

                  {/* Selected Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="default" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Available Tags Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {PREDEFINED_TAGS.map((tag) => {
                      const isSelected = tags.includes(tag);
                      const isDisabled = !isSelected && tags.length >= 4;
                      
                      return (
                        <Badge
                          key={tag}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-colors text-center justify-center py-2 ${
                            isDisabled 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-primary hover:text-primary-foreground'
                          }`}
                          onClick={() => {
                            if (isDisabled) return;
                            if (isSelected) {
                              removeTag(tag);
                            } else {
                              addTag(tag);
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Select up to 4 tags to help users discover your catbot
                  </p>
                </div>


                {/* Avatar Section */}
                <div className="space-y-4">
                  <Label>Cat Avatar</Label>
                  
                  {/* Avatar Type Toggle */}
                  <div className="flex gap-2">
                    <Button type="button" variant={avatarType === "color" ? "default" : "outline"} size="sm" onClick={() => setAvatarType("color")}>
                      <Palette className="h-4 w-4 mr-2" />
                      Default Icon
                    </Button>
                    <Button type="button" variant={avatarType === "upload" ? "default" : "outline"} size="sm" onClick={() => setAvatarType("upload")}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <Button type="button" variant={avatarType === "ai" ? "default" : "outline"} size="sm" onClick={() => setAvatarType("ai")}>
                      <div className="h-4 w-4 mr-2">✨</div>
                      Generate Image
                    </Button>
                  </div>

                  {/* Default Icon - Always Orange */}
                  {avatarType === "color" && <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Default icons use a consistent orange gradient design.</p>
                    </div>}

                  {/* Image Upload */}
                  {avatarType === "upload" && <div className="space-y-2">
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleFileSelect} className="hidden" />
                      <div className="flex items-center gap-4">
                        {avatar ? <div className="relative">
                            <img src={avatar} alt="Catbot image" className="h-20 w-20 rounded-lg object-cover shadow-soft" />
                            <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={handleRemoveImage}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div> : <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                            <Camera className="h-8 w-8 text-muted-foreground" />
                          </div>}
                        
                        <div className="flex-1">
                          <Button type="button" variant="outline" onClick={handleAvatarUpload} className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            {avatar ? "Change Image" : "Upload Image"}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG, GIF, WebP (max 5MB). Will be resized to 300x300px.
                          </p>
                        </div>
                      </div>
                    </div>}

                  {/* AI Generation */}
                  {avatarType === "ai" && <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        {avatar ? <div className="relative">
                            <img src={avatar} alt="Generated catbot image" className="h-20 w-20 rounded-lg object-cover shadow-soft" />
                            <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={handleRemoveImage}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div> : <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                            <div className="text-2xl">✨</div>
                          </div>}
                        
                        <div className="flex-1">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleGenerateAvatar}
                            disabled={isGeneratingAvatar || !name.trim() || !trainingDescription.trim()}
                            className="w-full"
                          >
                            {isGeneratingAvatar ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <div className="h-4 w-4 mr-2">✨</div>
                                {avatar ? "Regenerate Avatar" : "Generate AI Avatar"}
                              </>
                            )}
                          </Button>
                          {!name.trim() || !trainingDescription.trim() ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              Fill in name and description first
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                              AI will create a unique avatar based on your cat's details
                            </p>
                          )}
                        </div>
                      </div>
                    </div>}
                </div>

                {/* Privacy Setting */}
                <div className="space-y-4">
                  <Label>Privacy Settings</Label>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {isPublic ? <Globe className="h-5 w-5 text-green-500" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <div className="font-medium">
                          {isPublic ? "Public Catbot" : "Private Catbot"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isPublic ? "Visible to everyone in the Explore Cats page and homepage" : "Only visible to you in your My Cats page"}
                        </div>
                      </div>
                    </div>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" disabled={isLoading || !name.trim() || !publicProfile.trim() || !trainingDescription.trim() || publicProfile.length > 40 || trainingDescription.length > 10000} className="flex-1">
                    {isLoading ? isEditMode ? "Updating..." : "Creating..." : isEditMode ? "Update Catbot" : "Create Catbot"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={handleCancelUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Catbot Image</DialogTitle>
            <DialogDescription>
              Adjust the crop area for your catbot's image. It will be resized to 300x300px.
            </DialogDescription>
          </DialogHeader>
          
          {imageSrc && <div className="max-h-96 overflow-hidden">
              <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={1}>
                <img ref={imgRef} src={imageSrc} alt="Crop preview" onLoad={onImageLoad} className="max-w-full max-h-80 object-contain" />
              </ReactCrop>
            </div>}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelUpload} disabled={isUploading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUploadImage} disabled={isUploading || !completedCrop}>
              {isUploading ? <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </> : <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default CreateCharacter;