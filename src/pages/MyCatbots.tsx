import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PawPrint, Plus, Edit, Trash2, Globe, Lock, MessageCircle, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getUserCharacters, type PublicCharacter } from "@/lib/characterQueries";

const MyCatbots = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [catbots, setCatbots] = useState<PublicCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkCreating, setBulkCreating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyCatbots();
    }
  }, [user]);

  // Poll job status when bulk creating
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentJobId && bulkCreating) {
      interval = setInterval(async () => {
        try {
          const { data: job, error } = await supabase
            .from('catbot_generation_jobs')
            .select('status, completed_count, total_count, error')
            .eq('id', currentJobId)
            .single();

          if (error) throw error;

          if (job) {
            const progress = (job.completed_count / job.total_count) * 100;
            setBulkProgress(progress);

            if (job.status === 'completed') {
              setBulkCreating(false);
              setCurrentJobId(null);
              setBulkProgress(0);
              await fetchMyCatbots();
              toast({
                title: "Success! 🎉",
                description: `Created ${job.completed_count} catbots with complex descriptions!`,
              });
            } else if (job.status === 'failed') {
              setBulkCreating(false);
              setCurrentJobId(null);
              setBulkProgress(0);
              toast({
                title: "Error",
                description: job.error || "Failed to create catbots",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentJobId, bulkCreating, toast]);

  const fetchMyCatbots = async () => {
    try {
      const { data, error } = await supabase
        .from('catbots')
        .select('id, name, description, public_profile, personality, avatar_url, created_at, updated_at, is_public, like_count, interaction_count, tags')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCatbots(data || []);
    } catch (error) {
      console.error('Error fetching catbots:', error);
      toast({
        title: "Error",
        description: "Failed to load your catbots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePublicStatus = async (catbotId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('catbots')
        .update({ is_public: isPublic })
        .eq('id', catbotId);

      if (error) throw error;

      setCatbots(prev => 
        prev.map(catbot => 
          catbot.id === catbotId 
            ? { ...catbot, is_public: isPublic }
            : catbot
        )
      );

      toast({
        title: "Success",
        description: `Catbot is now ${isPublic ? 'public' : 'private'}`,
      });
    } catch (error) {
      console.error('Error updating catbot visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update catbot visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteCatbot = async (catbotId: string) => {
    try {
      const { error } = await supabase
        .from('catbots')
        .delete()
        .eq('id', catbotId);

      if (error) throw error;

      setCatbots(prev => prev.filter(catbot => catbot.id !== catbotId));
      toast({
        title: "Success",
        description: "Catbot deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting catbot:', error);
      toast({
        title: "Error",
        description: "Failed to delete catbot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const bulkCreateCatbots = async () => {
    if (!user) return;

    setBulkCreating(true);
    setBulkProgress(0);

    try {
      toast({
        title: "Starting Catbot Generation",
        description: "Generating 63 unique catbots in the background...",
      });

      const { data, error } = await supabase.functions.invoke('bulk-create-catbots', {
        body: { userId: user.id }
      });

      if (error) throw error;

      setCurrentJobId(data.jobId);

    } catch (error) {
      console.error('Error starting bulk catbot creation:', error);
      setBulkCreating(false);
      setBulkProgress(0);
      toast({
        title: "Error",
        description: "Failed to start catbot generation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const privateCatbots = catbots.filter(catbot => !catbot.is_public);
  const publicCatbots = catbots.filter(catbot => catbot.is_public);

  const CatbotCard = ({ catbot }: { catbot: PublicCharacter }) => (
    <Card className="hover-scale shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden shadow-soft bg-muted">
              {catbot.avatar_url ? (
                <img 
                  src={catbot.avatar_url} 
                  alt={`${catbot.name} avatar`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <PawPrint className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{catbot.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {catbot.is_public ? (
                  <Globe className="h-4 w-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {catbot.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/chat/${catbot.id}`}>
                <MessageCircle className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/edit/${catbot.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Catbot</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{catbot.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteCatbot(catbot.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="mb-4 line-clamp-2">
          {catbot.public_profile || catbot.description || "No description provided"}
        </CardDescription>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id={`public-${catbot.id}`}
              checked={catbot.is_public}
              onCheckedChange={(checked) => togglePublicStatus(catbot.id, checked)}
            />
            <Label htmlFor={`public-${catbot.id}`} className="text-sm">
              Make public
            </Label>
          </div>
          <span className="text-xs text-muted-foreground">
            Created {new Date(catbot.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ isPublic }: { isPublic: boolean }) => (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <PawPrint className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        No {isPublic ? 'public' : 'private'} catbots yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {isPublic 
          ? "You haven't made any catbots public yet. Toggle the switch on your catbots to share them with the community."
          : "You haven't created any catbots yet. Create your first one to get started!"
        }
      </p>
      <Button asChild>
        <Link to="/create" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Catbot
        </Link>
      </Button>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to view your catbots</h1>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Catbots</h1>
          <div className="flex items-center gap-3">
            <Button 
              onClick={bulkCreateCatbots}
              disabled={bulkCreating}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {bulkCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate 63 Catbots
                </>
              )}
            </Button>
            <Button asChild>
              <Link to="/create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Catbot
              </Link>
            </Button>
          </div>
        </div>

        {bulkCreating && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Creating 63 Unique Catbots</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Generating diverse characters with complex backstories (32 with 2000+ word descriptions)...
                    Progress: {Math.round(bulkProgress)}% ({Math.round((bulkProgress / 100) * 63)}/63 complete)
                  </p>
                  <Progress value={bulkProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="public" className="space-y-6">
          <TabsList>
            <TabsTrigger value="private" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Private Catbots ({privateCatbots.length})
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              My Public Catbots ({publicCatbots.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="private">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full" />
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
            ) : privateCatbots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {privateCatbots.map((catbot) => (
                  <CatbotCard key={catbot.id} catbot={catbot} />
                ))}
              </div>
            ) : (
              <EmptyState isPublic={false} />
            )}
          </TabsContent>

          <TabsContent value="public">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full" />
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
            ) : publicCatbots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicCatbots.map((catbot) => (
                  <CatbotCard key={catbot.id} catbot={catbot} />
                ))}
              </div>
            ) : (
              <EmptyState isPublic={true} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyCatbots;