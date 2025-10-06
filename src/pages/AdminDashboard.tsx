import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  BarChart3,
  Globe,
  Clock
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface OverviewStats {
  totalUsers: number;
  newUsersLast30Days: number;
  totalMessages: number;
  dailyActiveUsers: number;
}

interface ChartDataPoint {
  date?: string;
  count?: number;
  name?: string;
  value?: number;
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Stats
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalUsers: 0,
    newUsersLast30Days: 0,
    totalMessages: 0,
    dailyActiveUsers: 0
  });
  
  const [userGrowthData, setUserGrowthData] = useState<ChartDataPoint[]>([]);
  const [messageData, setMessageData] = useState<ChartDataPoint[]>([]);
  const [trafficSourceData, setTrafficSourceData] = useState<ChartDataPoint[]>([]);
  const [topCatbotsData, setTopCatbotsData] = useState<ChartDataPoint[]>([]);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) throw error;

        if (!data) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive"
          });
          navigate("/");
          return;
        }

        setIsAdmin(true);
        await loadAnalyticsData();
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading, navigate, toast]);

  const loadAnalyticsData = async () => {
    try {
      await Promise.all([
        loadOverviewStats(),
        loadUserGrowthData(),
        loadMessageData(),
        loadTrafficSources(),
        loadTopCatbots()
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive"
      });
    }
  };

  const loadOverviewStats = async () => {
    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // New users last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    // Total messages
    const { count: totalMessages } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'message_sent');

    // Daily active users
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: dauData } = await supabase
      .from('analytics_events')
      .select('user_id')
      .gte('created_at', oneDayAgo)
      .not('user_id', 'is', null);

    const uniqueUsers = new Set(dauData?.map(d => d.user_id) || []);

    setOverviewStats({
      totalUsers: totalUsers || 0,
      newUsersLast30Days: newUsers || 0,
      totalMessages: totalMessages || 0,
      dailyActiveUsers: uniqueUsers.size
    });
  };

  const loadUserGrowthData = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at');

    if (!data) return;

    // Group by date
    const grouped = data.reduce((acc: Record<string, number>, curr) => {
      const date = new Date(curr.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(grouped).map(([date, count]) => ({
      date,
      count
    }));

    setUserGrowthData(chartData);
  };

  const loadMessageData = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data } = await supabase
      .from('analytics_events')
      .select('created_at')
      .eq('event_type', 'message_sent')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at');

    if (!data) return;

    // Group by date
    const grouped = data.reduce((acc: Record<string, number>, curr) => {
      const date = new Date(curr.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(grouped).map(([date, count]) => ({
      date,
      count
    }));

    setMessageData(chartData);
  };

  const loadTrafficSources = async () => {
    const { data } = await supabase
      .from('page_views')
      .select('utm_source');

    if (!data) return;

    const grouped = data.reduce((acc: Record<string, number>, curr) => {
      const source = curr.utm_source || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 5);

    setTrafficSourceData(chartData);
  };

  const loadTopCatbots = async () => {
    const { data } = await supabase
      .from('analytics_events')
      .select('catbot_id, catbots(name)')
      .eq('event_type', 'message_sent')
      .not('catbot_id', 'is', null);

    if (!data) return;

    const grouped = data.reduce((acc: Record<string, { name: string; count: number }>, curr) => {
      if (curr.catbot_id && curr.catbots) {
        const catbot = curr.catbots as any;
        const id = curr.catbot_id;
        if (!acc[id]) {
          acc[id] = { name: catbot.name || 'Unknown', count: 0 };
        }
        acc[id].count += 1;
      }
      return acc;
    }, {});

    const chartData = Object.values(grouped)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setTopCatbotsData(chartData);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--muted))',
    'hsl(var(--destructive))'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Analytics and insights for your platform</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">All time registrations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewStats.newUsersLast30Days}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewStats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">All time conversations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewStats.dailyActiveUsers}</div>
              <p className="text-xs text-muted-foreground">Daily active users</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="growth" className="space-y-4">
          <TabsList>
            <TabsTrigger value="growth">User Growth</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
            <TabsTrigger value="catbots">Top Catbots</TabsTrigger>
          </TabsList>

          <TabsContent value="growth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth (Last 30 Days)</CardTitle>
                <CardDescription>New user signups over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Messages Over Time (Last 30 Days)</CardTitle>
                <CardDescription>Total messages sent per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={messageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)"
                      name="Messages"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your users are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={trafficSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {trafficSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catbots" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Most Active Catbots</CardTitle>
                <CardDescription>Catbots with the most messages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topCatbotsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="hsl(var(--foreground))" 
                      fontSize={12}
                      width={150}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))"
                      name="Messages"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
