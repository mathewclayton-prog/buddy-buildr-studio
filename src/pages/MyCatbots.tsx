import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PawPrint, Plus, Edit, Trash2, Globe, Lock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

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

const MyCatbots = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [catbots, setCatbots] = useState<Catbot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyCatbots();
    }
  }, [user]);

  const fetchMyCatbots = async () => {
    try {
      const { data, error } = await supabase
        .from('catbots')
        .select('*')
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

  const privateCatbots = catbots.filter(catbot => !catbot.is_public);
  const publicCatbots = catbots.filter(catbot => catbot.is_public);

  const CatbotCard = ({ catbot }: { catbot: Catbot }) => (
    <Card className="hover-scale shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-soft bg-muted">
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
          {catbot.description || "No description provided"}
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
          <Button asChild>
            <Link to="/create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Catbot
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="private" className="space-y-6">
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