import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Edit, Trash, Eye, EyeOff, Sparkles, Users, BarChart3, Shield, Database, UserCheck, Plus, Globe, Lock, Bot, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { getUserCharacters, type PublicCharacter } from "@/lib/characterQueries";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const MyCatbots = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const [catbots, setCatbots] = useState<PublicCharacter[]>([]);
  const [allCatbots, setAllCatbots] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalCatbots: 0,
    publicCatbots: 0,
    privateCatbots: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchMyCatbots();
      if (isAdmin) {
        fetchAdminData();
      }
    }
  }, [user, isAdmin]);

  const fetchMyCatbots = async () => {
    try {
      const data = await getUserCharacters(user?.id || '');
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

  const fetchAdminData = async () => {
    if (!user || !isAdmin) return;

    try {
      // Fetch all catbots for admin view
      const { data: allCatbotsData, error: catbotsError } = await supabase
        .from('catbots')
        .select(`
          *,
          profiles!catbots_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (catbotsError) {
        console.error('Error fetching all catbots:', catbotsError);
      } else {
        setAllCatbots(allCatbotsData || []);
      }

      // Fetch all users with their catbot counts
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          *,
          catbots(count)
        `);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else {
        setAllUsers(usersData || []);
      }

      // Calculate admin stats
      if (allCatbotsData) {
        const totalCatbots = allCatbotsData.length;
        const publicCount = allCatbotsData.filter(c => c.is_public).length;
        const privateCount = totalCatbots - publicCount;

        setAdminStats({
          totalUsers: usersData?.length || 0,
          totalCatbots,
          publicCatbots: publicCount,
          privateCatbots: privateCount
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
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

  const CatbotCard = ({ 
    catbot, 
    showCreator = false, 
    creatorName 
  }: { 
    catbot: PublicCharacter; 
    showCreator?: boolean;
    creatorName?: string;
  }) => (
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
                  <Bot className="h-6 w-6 text-primary" />
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
              {showCreator && creatorName && (
                <div className="text-xs text-muted-foreground mt-1">
                  by {creatorName}
                </div>
              )}
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

  const EmptyState = ({ 
    title, 
    description, 
    showCreateButton = true 
  }: { 
    title: string; 
    description: string; 
    showCreateButton?: boolean;
  }) => (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <Bot className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {showCreateButton && (
        <Button asChild>
          <Link to="/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Catbot
          </Link>
        </Button>
      )}
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
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              My Catbots
              {isAdmin && <Badge variant="destructive" className="text-xs"><Shield className="w-3 h-3 mr-1" />Admin</Badge>}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin ? "Manage your AI companions and oversee the platform" : "Manage your AI companions and see how they're performing"}
            </p>
          </div>
          <Button asChild>
            <Link to="/create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Catbot
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="private" className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-2'}`}>
            <TabsTrigger value="private" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Private ({privateCatbots.length})
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Public ({publicCatbots.length})
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="admin-dashboard" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="admin-manage" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  All Catbots ({allCatbots.length})
                </TabsTrigger>
              </>
            )}
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
              <EmptyState 
                title="No private catbots yet"
                description="You haven't created any catbots yet. Create your first one to get started!"
              />
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
              <EmptyState 
                title="No public catbots yet"
                description="You haven't made any catbots public yet. Toggle the switch on your catbots to share them with the community."
              />
            )}
          </TabsContent>

          {/* Admin Dashboard Tab */}
          {isAdmin && (
            <TabsContent value="admin-dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Catbots</CardTitle>
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminStats.totalCatbots}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Public Catbots</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminStats.publicCatbots}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Private Catbots</CardTitle>
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminStats.privateCatbots}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Users by Catbots</CardTitle>
                    <CardDescription>Users with the most created catbots</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {allUsers
                      .sort((a, b) => (b.catbots?.[0]?.count || 0) - (a.catbots?.[0]?.count || 0))
                      .slice(0, 5)
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{user.display_name || 'Anonymous'}</span>
                          </div>
                          <Badge variant="secondary">{user.catbots?.[0]?.count || 0} catbots</Badge>
                        </div>
                      ))}
                  </CardContent>
                </Card>

              </div>
            </TabsContent>
          )}

          {/* Admin All Catbots Tab */}
          {isAdmin && (
            <TabsContent value="admin-manage" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">All Platform Catbots</h2>
                <Badge variant="secondary">{allCatbots.length} total</Badge>
              </div>
              
              {allCatbots.length === 0 ? (
                <EmptyState 
                  title="No catbots found" 
                  description="No catbots have been created on the platform yet." 
                  showCreateButton={false}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {allCatbots.map((catbot) => (
                    <CatbotCard 
                      key={catbot.id} 
                      catbot={catbot} 
                      showCreator={true}
                      creatorName={(catbot as any).profiles?.display_name}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default MyCatbots;