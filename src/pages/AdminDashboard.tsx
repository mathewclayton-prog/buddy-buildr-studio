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
  bucket?: string;
  session_count?: number;
  bounce_rate?: number;
  total_sessions?: number;
}

interface SessionStats {
  avgDuration: number;
  medianDuration: number;
  totalSessions: number;
  bounceRate: number;
  bouncedSessions: number;
}

interface StickinessStats {
  dau: number;
  mau: number;
  stickinessRatio: number;
}

interface CohortData {
  cohort_week: string;
  cohort_size: number;
  week_0: number;
  week_1: number;
  week_2: number;
  week_3: number;
  week_4: number;
}

interface FunnelStep {
  step: string;
  user_count: number;
  conversion_rate: number;
  drop_off_rate: number;
}

interface ActivationStats {
  avgHours: number;
  medianHours: number;
  totalUsers: number;
}

interface MessagesPerSessionStats {
  avgMessages: number;
  medianMessages: number;
  totalSessions: number;
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
  
  // Session analytics
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    avgDuration: 0,
    medianDuration: 0,
    totalSessions: 0,
    bounceRate: 0,
    bouncedSessions: 0
  });
  const [sessionDistribution, setSessionDistribution] = useState<ChartDataPoint[]>([]);
  const [bounceRateTrend, setBounceRateTrend] = useState<ChartDataPoint[]>([]);
  
  // Retention analytics
  const [stickinessStats, setStickinessStats] = useState<StickinessStats>({
    dau: 0,
    mau: 0,
    stickinessRatio: 0
  });
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  
  // Funnel analytics
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [activationStats, setActivationStats] = useState<ActivationStats>({
    avgHours: 0,
    medianHours: 0,
    totalUsers: 0
  });
  const [messagesPerSession, setMessagesPerSession] = useState<MessagesPerSessionStats>({
    avgMessages: 0,
    medianMessages: 0,
    totalSessions: 0
  });

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
        loadTopCatbots(),
        loadSessionAnalytics(),
        loadRetentionAnalytics(),
        loadFunnelAnalytics()
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

  const loadSessionAnalytics = async () => {
    try {
      // Load session duration stats
      const { data: durationData, error: durationError } = await supabase.rpc('calculate_session_duration');
      
      if (durationError) throw durationError;
      
      // Load bounce rate
      const { data: bounceData, error: bounceError } = await supabase.rpc('calculate_bounce_rate');
      
      if (bounceError) throw bounceError;
      
      // Load session distribution
      const { data: distributionData, error: distributionError } = await supabase.rpc('get_session_duration_distribution');
      
      if (distributionError) throw distributionError;
      
      // Load bounce rate trend
      const { data: trendData, error: trendError } = await supabase.rpc('get_bounce_rate_trend');
      
      if (trendError) throw trendError;

      if (durationData && durationData[0] && bounceData && bounceData[0]) {
        setSessionStats({
          avgDuration: durationData[0].avg_duration_minutes || 0,
          medianDuration: durationData[0].median_duration_minutes || 0,
          totalSessions: durationData[0].total_sessions || 0,
          bounceRate: bounceData[0].bounce_rate || 0,
          bouncedSessions: bounceData[0].bounced_sessions || 0
        });
      }

      if (distributionData) {
        setSessionDistribution(distributionData.map((d: any) => ({
          bucket: d.duration_bucket,
          session_count: d.session_count
        })));
      }

      if (trendData) {
        setBounceRateTrend(trendData.map((d: any) => ({
          date: new Date(d.date).toLocaleDateString(),
          bounce_rate: d.bounce_rate,
          total_sessions: d.total_sessions
        })));
      }
    } catch (error) {
      console.error('Error loading session analytics:', error);
    }
  };

  const loadRetentionAnalytics = async () => {
    try {
      // Load stickiness (DAU/MAU ratio)
      const { data: stickinessData, error: stickinessError } = await supabase.rpc('calculate_stickiness');
      
      if (stickinessError) throw stickinessError;
      
      // Load cohort retention
      const { data: cohortRetentionData, error: cohortError } = await supabase.rpc('get_cohort_retention', {
        p_weeks_back: 12
      });
      
      if (cohortError) throw cohortError;

      if (stickinessData && stickinessData[0]) {
        setStickinessStats({
          dau: stickinessData[0].dau || 0,
          mau: stickinessData[0].mau || 0,
          stickinessRatio: stickinessData[0].stickiness_ratio || 0
        });
      }

      if (cohortRetentionData) {
        setCohortData(cohortRetentionData.map((d: any) => ({
          cohort_week: new Date(d.cohort_week).toLocaleDateString(),
          cohort_size: d.cohort_size,
          week_0: d.week_0,
          week_1: d.week_1,
          week_2: d.week_2,
          week_3: d.week_3,
          week_4: d.week_4
        })));
      }
    } catch (error) {
      console.error('Error loading retention analytics:', error);
    }
  };

  const loadFunnelAnalytics = async () => {
    try {
      // Load onboarding funnel
      const { data: funnelAnalysisData, error: funnelError } = await supabase.rpc('analyze_onboarding_funnel');
      
      if (funnelError) throw funnelError;
      
      // Load time to first message
      const { data: activationData, error: activationError } = await supabase.rpc('get_time_to_first_message');
      
      if (activationError) throw activationError;
      
      // Load messages per session
      const { data: messagesData, error: messagesError } = await supabase.rpc('get_messages_per_session_stats');
      
      if (messagesError) throw messagesError;

      if (funnelAnalysisData) {
        setFunnelData(funnelAnalysisData);
      }

      if (activationData && activationData[0]) {
        setActivationStats({
          avgHours: activationData[0].avg_hours || 0,
          medianHours: activationData[0].median_hours || 0,
          totalUsers: activationData[0].total_users || 0
        });
      }

      if (messagesData && messagesData[0]) {
        setMessagesPerSession({
          avgMessages: messagesData[0].avg_messages || 0,
          medianMessages: messagesData[0].median_messages || 0,
          totalSessions: messagesData[0].total_sessions_with_messages || 0
        });
      }
    } catch (error) {
      console.error('Error loading funnel analytics:', error);
    }
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
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="funnels">Funnels</TabsTrigger>
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

          <TabsContent value="sessions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessionStats.avgDuration.toFixed(1)} min</div>
                  <p className="text-xs text-muted-foreground">Average session length</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Median Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessionStats.medianDuration.toFixed(1)} min</div>
                  <p className="text-xs text-muted-foreground">Typical session length</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessionStats.bounceRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">{sessionStats.bouncedSessions} of {sessionStats.totalSessions} sessions</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Session Duration Distribution</CardTitle>
                <CardDescription>How long users spend in sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={sessionDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="bucket" 
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
                    <Bar 
                      dataKey="session_count" 
                      fill="hsl(var(--primary))"
                      name="Sessions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bounce Rate Trend (Last 30 Days)</CardTitle>
                <CardDescription>Daily bounce rate percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={bounceRateTrend}>
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
                      dataKey="bounce_rate" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      name="Bounce Rate %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Stickiness (DAU/MAU Ratio)</CardTitle>
                <CardDescription>How frequently active users return to your platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Daily Active Users</p>
                    <p className="text-3xl font-bold">{stickinessStats.dau}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Monthly Active Users</p>
                    <p className="text-3xl font-bold">{stickinessStats.mau}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Stickiness Ratio</p>
                    <p className="text-3xl font-bold">{stickinessStats.stickinessRatio.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">
                      {stickinessStats.stickinessRatio >= 20 ? '✅ Good stickiness' : '⚠️ Room for improvement'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cohort Retention Analysis (Last 12 Weeks)</CardTitle>
                <CardDescription>Percentage of users who return each week after signup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Cohort Week</th>
                        <th className="text-left p-2 font-medium">Size</th>
                        <th className="text-center p-2 font-medium">Week 0</th>
                        <th className="text-center p-2 font-medium">Week 1</th>
                        <th className="text-center p-2 font-medium">Week 2</th>
                        <th className="text-center p-2 font-medium">Week 3</th>
                        <th className="text-center p-2 font-medium">Week 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohortData.map((cohort, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{cohort.cohort_week}</td>
                          <td className="p-2">{cohort.cohort_size}</td>
                          <td className="text-center p-2">
                            <span className="inline-block px-2 py-1 rounded" style={{
                              backgroundColor: 'hsl(var(--primary) / 0.2)',
                              color: 'hsl(var(--primary))'
                            }}>
                              {cohort.week_0.toFixed(0)}%
                            </span>
                          </td>
                          <td className="text-center p-2">
                            {cohort.week_1 !== null && (
                              <span className="inline-block px-2 py-1 rounded" style={{
                                backgroundColor: cohort.week_1 >= 40 ? 'hsl(142, 76%, 36% / 0.2)' : 
                                                 cohort.week_1 >= 20 ? 'hsl(48, 96%, 53% / 0.2)' : 
                                                 'hsl(0, 84%, 60% / 0.2)',
                                color: cohort.week_1 >= 40 ? 'hsl(142, 76%, 36%)' : 
                                       cohort.week_1 >= 20 ? 'hsl(48, 96%, 53%)' : 
                                       'hsl(0, 84%, 60%)'
                              }}>
                                {cohort.week_1.toFixed(0)}%
                              </span>
                            )}
                          </td>
                          <td className="text-center p-2">
                            {cohort.week_2 !== null && (
                              <span className="inline-block px-2 py-1 rounded" style={{
                                backgroundColor: cohort.week_2 >= 40 ? 'hsl(142, 76%, 36% / 0.2)' : 
                                                 cohort.week_2 >= 20 ? 'hsl(48, 96%, 53% / 0.2)' : 
                                                 'hsl(0, 84%, 60% / 0.2)',
                                color: cohort.week_2 >= 40 ? 'hsl(142, 76%, 36%)' : 
                                       cohort.week_2 >= 20 ? 'hsl(48, 96%, 53%)' : 
                                       'hsl(0, 84%, 60%)'
                              }}>
                                {cohort.week_2.toFixed(0)}%
                              </span>
                            )}
                          </td>
                          <td className="text-center p-2">
                            {cohort.week_3 !== null && (
                              <span className="inline-block px-2 py-1 rounded" style={{
                                backgroundColor: cohort.week_3 >= 40 ? 'hsl(142, 76%, 36% / 0.2)' : 
                                                 cohort.week_3 >= 20 ? 'hsl(48, 96%, 53% / 0.2)' : 
                                                 'hsl(0, 84%, 60% / 0.2)',
                                color: cohort.week_3 >= 40 ? 'hsl(142, 76%, 36%)' : 
                                       cohort.week_3 >= 20 ? 'hsl(48, 96%, 53%)' : 
                                       'hsl(0, 84%, 60%)'
                              }}>
                                {cohort.week_3.toFixed(0)}%
                              </span>
                            )}
                          </td>
                          <td className="text-center p-2">
                            {cohort.week_4 !== null && (
                              <span className="inline-block px-2 py-1 rounded" style={{
                                backgroundColor: cohort.week_4 >= 40 ? 'hsl(142, 76%, 36% / 0.2)' : 
                                                 cohort.week_4 >= 20 ? 'hsl(48, 96%, 53% / 0.2)' : 
                                                 'hsl(0, 84%, 60% / 0.2)',
                                color: cohort.week_4 >= 40 ? 'hsl(142, 76%, 36%)' : 
                                       cohort.week_4 >= 20 ? 'hsl(48, 96%, 53%)' : 
                                       'hsl(0, 84%, 60%)'
                              }}>
                                {cohort.week_4.toFixed(0)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {cohortData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No cohort data available yet. Data will appear as users sign up and return.
                    </div>
                  )}
                </div>
                <div className="mt-4 text-xs text-muted-foreground space-y-1">
                  <p>📊 <strong>How to read:</strong> Each row shows a signup week. Percentages show how many users returned in subsequent weeks.</p>
                  <p>🟢 Green (≥40%): Excellent retention | 🟡 Yellow (20-40%): Good retention | 🔴 Red (&lt;20%): Needs improvement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnels" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time to First Message</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activationStats.medianHours.toFixed(1)}h</div>
                  <p className="text-xs text-muted-foreground">
                    Median activation time ({activationStats.totalUsers} users)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activationStats.medianHours < 5 ? '✅ Fast activation' : '⚠️ Could be faster'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Messages/Session</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{messagesPerSession.avgMessages.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {messagesPerSession.totalSessions} sessions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Median Messages/Session</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{messagesPerSession.medianMessages.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">Typical session depth</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Onboarding Funnel (Last 30 Days)</CardTitle>
                <CardDescription>User progression through key activation steps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData.map((step, idx) => {
                    const maxWidth = funnelData[0]?.user_count || 1;
                    const widthPercent = (step.user_count / maxWidth) * 100;
                    
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{step.step}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">{step.user_count} users</span>
                            <span className="font-bold text-primary">{step.conversion_rate.toFixed(1)}%</span>
                            {step.drop_off_rate > 0 && (
                              <span className="text-destructive text-xs">↓ {step.drop_off_rate.toFixed(1)}% drop</span>
                            )}
                          </div>
                        </div>
                        <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 flex items-center justify-center text-white font-medium text-sm transition-all duration-500"
                            style={{
                              width: `${widthPercent}%`,
                              backgroundColor: `hsl(var(--primary) / ${0.5 + (step.conversion_rate / 200)})`
                            }}
                          >
                            {widthPercent > 20 && `${step.conversion_rate.toFixed(0)}%`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {funnelData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No funnel data available yet. Data will appear as users progress through onboarding.
                  </div>
                )}

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">📊 Funnel Insights</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Look for the biggest drop-off between steps to identify friction points</li>
                    <li>• Ideal conversion from signup to first message: &gt;60%</li>
                    <li>• Test improvements at high drop-off points to boost overall conversion</li>
                  </ul>
                </div>
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
