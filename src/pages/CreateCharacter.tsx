import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import { X, Upload, PawPrint, Bot, Palette, Globe, Lock, Camera, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { uploadImage, validateImageFile } from "@/lib/imageStorage";
const PERSONALITY_OPTIONS = [{
  value: "Friendly",
  label: "Friendly",
  description: "Warm, welcoming, and approachable"
}, {
  value: "Mysterious",
  label: "Mysterious",
  description: "Enigmatic and intriguing"
}, {
  value: "Wise",
  label: "Wise",
  description: "Knowledgeable and thoughtful"
}, {
  value: "Playful",
  label: "Playful",
  description: "Fun-loving and energetic"
}, {
  value: "Serious",
  label: "Serious",
  description: "Focused and professional"
}];
const COLOR_OPTIONS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#6366F1", "#84CC16"];
const CreateCharacter = () => {
  const {
    user
  } = useAuth();
  const {
    catbotId
  } = useParams();
  const isEditMode = !!catbotId;
  const [name, setName] = useState("");
  const [publicProfile, setPublicProfile] = useState("");
  const [trainingDescription, setTrainingDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [avatarColor, setAvatarColor] = useState(COLOR_OPTIONS[0]);
  const [avatarType, setAvatarType] = useState<"upload" | "color">("color");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
      const {
        data,
        error
      } = await supabase.from('catbots').select('*').eq('id', catbotId).eq('user_id', user?.id) // Ensure user owns the catbot
      .single();
      if (error) throw error;

      // Populate form with existing data
      setName(data.name);
      setPublicProfile(data.public_profile || data.description || ""); // fallback to legacy description
      setTrainingDescription(data.training_description || data.description || ""); // fallback to legacy description
      setPersonality(data.personality || "");
      setIsPublic(data.is_public);
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
    if (!name.trim() || !publicProfile.trim() || !trainingDescription.trim() || !personality) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const catbotData = {
        name: name.trim(),
        public_profile: publicProfile.trim(),
        training_description: trainingDescription.trim(),
        personality: personality,
        avatar_url: avatarType === "upload" ? avatar : null,
        is_public: isPublic
      };
      if (isEditMode) {
        // Update existing catbot
        const {
          data,
          error
        } = await supabase.from('catbots').update(catbotData).eq('id', catbotId).eq('user_id', user.id).select().single();
        if (error) throw error;
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
        toast({
          title: "Catbot Created!",
          description: `${catbotData.name} has been created successfully.`
        });

        // Redirect to the new catbot
        navigate(`/chat/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating catbot:', error);
      toast({
        title: "Error",
        description: "Failed to create catbot. Please try again.",
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
      // Create cropped canvas
      const canvas = getCroppedCanvas(imgRef.current, completedCrop);

      // Convert canvas to blob
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(blob => {
          resolve(blob!);
        }, 'image/jpeg', 0.9);
      });

      // Create file from blob
      const croppedFile = new File([blob], `catbot-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      // Upload to Supabase Storage
      const result = await uploadImage(croppedFile, 'catbots');
      if (result.error || !result.data) {
        throw new Error(result.error);
      }

      // Set the avatar URL
      setAvatar(result.data.publicUrl);
      setAvatarType("upload");
      toast({
        title: "Success",
        description: "Image uploaded successfully"
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
  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };
  const getPreviewAvatar = () => {
    if (avatarType === "upload" && avatar) {
      return <img src={avatar} alt="Character preview" className="h-16 w-16 rounded-lg object-cover shadow-soft" />;
    }
    return <div className="h-16 w-16 rounded-lg flex items-center justify-center shadow-soft" style={{
      backgroundColor: avatarColor
    }}>
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
                <PawPrint className="h-5 w-5 text-primary" />
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
                    placeholder="Write a catchy description that will attract users to chat with your cat. This appears on your cat's card when people browse." 
                    rows={3} 
                    maxLength={250} 
                  />
                  <p className="text-sm text-muted-foreground">
                    {publicProfile.length}/250 characters - This is what people see when browsing cats
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
                    maxLength={2000} 
                  />
                  <p className="text-sm text-muted-foreground">
                    {trainingDescription.length}/2000 characters - Private training instructions
                  </p>
                </div>

                {/* Personality Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="personality">Personality Type *</Label>
                  <Select value={personality} onValueChange={setPersonality}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choose a cat personality" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      {PERSONALITY_OPTIONS.map(option => <SelectItem key={option.value} value={option.value} className="hover:bg-accent">
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Avatar Section */}
                <div className="space-y-4">
                  <Label>Character Avatar</Label>
                  
                  {/* Avatar Type Toggle */}
                  <div className="flex gap-2">
                    <Button type="button" variant={avatarType === "color" ? "default" : "outline"} size="sm" onClick={() => setAvatarType("color")}>
                      <Palette className="h-4 w-4 mr-2" />
                      Color Icon
                    </Button>
                    <Button type="button" variant={avatarType === "upload" ? "default" : "outline"} size="sm" onClick={() => setAvatarType("upload")}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>

                  {/* Color Picker */}
                  {avatarType === "color" && <div className="space-y-2">
                      <Label>Icon Color</Label>
                      <div className="flex gap-2 flex-wrap">
                        {COLOR_OPTIONS.map(color => <button key={color} type="button" className={`h-8 w-8 rounded-full border-2 hover:scale-110 transition-transform ${avatarColor === color ? "border-primary ring-2 ring-primary/20" : "border-border"}`} style={{
                      backgroundColor: color
                    }} onClick={() => setAvatarColor(color)} />)}
                      </div>
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
                  <Button type="button" variant="outline" onClick={() => navigate("/browse")} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" disabled={isLoading || !name.trim() || !publicProfile.trim() || !trainingDescription.trim() || !personality} className="flex-1">
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