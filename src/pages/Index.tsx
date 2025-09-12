import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PlatformStats } from "@/components/PlatformStats";
import { CatbotSection } from "@/components/CatbotSection";
import { RecentActivityFeed } from "@/components/RecentActivityFeed";

import { Plus, Sparkles, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  getPlatformStats, 
  getMostPopularThisWeek, 
  getRecentlyCreated, 
  getStaffPicks, 
  getQuickStartBots 
} from "@/lib/platformStats";
import { generateActivityFeed, getRandomOnlineCount } from "@/lib/activityHelpers";
import type { PublicCharacter } from "@/lib/characterQueries";

const heroCat = "/lovable-uploads/057d2f0d-a602-456f-b685-1e284a57e2c5.png";

const Index = () => {
  const { user } = useAuth();
  
  // Platform stats
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 1247,
    totalConversations: 15429,
    totalCatbots: 67,
    activeNow: 12
  });

  // Catbot sections
  const [popularCatbots, setPopularCatbots] = useState<PublicCharacter[]>([]);
  const [recentCatbots, setRecentCatbots] = useState<PublicCharacter[]>([]);
  const [staffPicksCatbots, setStaffPicksCatbots] = useState<PublicCharacter[]>([]);
  const [starterCatbots, setStarterCatbots] = useState<PublicCharacter[]>([]);
  
  // Activity feed
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState({
    popular: true,
    recent: true,
    staff: true,
    starter: true
  });

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    // Update online count and stats periodically
    const updateOnlineCount = () => setOnlineCount(getRandomOnlineCount());
    updateOnlineCount();
    
    const onlineInterval = setInterval(updateOnlineCount, 30000); // Every 30 seconds
    const statsInterval = setInterval(loadPlatformStats, 120000); // Every 2 minutes
    
    return () => {
      clearInterval(onlineInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    
    // Load platform stats first
    await loadPlatformStats();
    
    // Load all catbot sections in parallel
    await Promise.all([
      loadPopularCatbots(),
      loadRecentCatbots(),
      loadStaffPicks(),
      loadStarterCatbots()
    ]);
    
    // Load activity feed last (can use data from other sections)
    await loadActivityFeed();
    
    setLoading(false);
  };

  const loadPlatformStats = async () => {
    try {
      const stats = await getPlatformStats();
      setPlatformStats(stats);
      
    } catch (error) {
      console.error('Error loading platform stats:', error);
    }
  };

  const loadPopularCatbots = async () => {
    try {
      setSectionsLoading(prev => ({ ...prev, popular: true }));
      const data = await getMostPopularThisWeek(6);
      setPopularCatbots(data);
    } catch (error) {
      console.error('Error loading popular catbots:', error);
    } finally {
      setSectionsLoading(prev => ({ ...prev, popular: false }));
    }
  };

  const loadRecentCatbots = async () => {
    try {
      setSectionsLoading(prev => ({ ...prev, recent: true }));
      const data = await getRecentlyCreated(6);
      setRecentCatbots(data);
    } catch (error) {
      console.error('Error loading recent catbots:', error);
    } finally {
      setSectionsLoading(prev => ({ ...prev, recent: false }));
    }
  };

  const loadStaffPicks = async () => {
    try {
      setSectionsLoading(prev => ({ ...prev, staff: true }));
      const data = await getStaffPicks(6);
      setStaffPicksCatbots(data);
    } catch (error) {
      console.error('Error loading staff picks:', error);
    } finally {
      setSectionsLoading(prev => ({ ...prev, staff: false }));
    }
  };

  const loadStarterCatbots = async () => {
    try {
      setSectionsLoading(prev => ({ ...prev, starter: true }));
      const data = await getQuickStartBots(4);
      setStarterCatbots(data);
    } catch (error) {
      console.error('Error loading starter catbots:', error);
    } finally {
      setSectionsLoading(prev => ({ ...prev, starter: false }));
    }
  };

  const loadActivityFeed = async () => {
    try {
      // Combine all catbots for activity generation
      const allCatbots = [
        ...popularCatbots,
        ...recentCatbots,
        ...staffPicksCatbots,
        ...starterCatbots
      ].filter((bot, index, self) => 
        index === self.findIndex(b => b.id === bot.id) // Remove duplicates
      );
      
      const activities = await generateActivityFeed(allCatbots);
      setActivityFeed(activities);
    } catch (error) {
      console.error('Error loading activity feed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Image - Full Page Width */}
      <div className="w-screen bg-card overflow-hidden shadow-card">
        <img src={heroCat} alt="MiCatbot Hero" className="w-full h-auto object-cover" />
      </div>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Create Your Own Catbot
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Bring your own feline friend to life or build a purrfect companion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            {user ? (
              <>
                <Button variant="hero" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/create" className="flex items-center gap-3">
                    <Plus className="h-5 w-5" />
                    Create Character
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/browse" className="flex items-center gap-3">
                    <PawPrint className="h-5 w-5" />
                    Meet the Cats
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="hero" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/auth" className="flex items-center gap-3">
                    <PawPrint className="h-5 w-5" />
                    Get Started
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/browse" className="flex items-center gap-3">
                    <PawPrint className="h-5 w-5" />
                    Meet the Cats
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Platform Stats */}
        <PlatformStats {...platformStats} />

        {/* Empty State Message */}
        {platformStats.totalCatbots === 0 && !loading && (
          <div className="text-center py-16 mb-16">
            <PawPrint className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              Our cats are getting ready
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The MiCatbot community is growing! Check back soon to meet amazing AI companions created by our community.
            </p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          {/* Main Content - Left Side (3/4 width) */}
          <div className="lg:col-span-3">
            {/* Quick Start Section */}
            <CatbotSection
              title="Quick Start"
              subtitle="Perfect for first-time cat chatters - friendly and easy to talk to"
              catbots={starterCatbots}
              loading={sectionsLoading.starter}
              sectionType="starter"
              showMore={false}
            />

            {/* Most Popular This Week */}
            <CatbotSection
              title="Most Popular This Week"
              subtitle="Trending cats everyone is talking to right now"
              catbots={popularCatbots}
              loading={sectionsLoading.popular}
              sectionType="popular"
            />

            {/* Staff Picks */}
            <CatbotSection
              title="Staff Picks"
              subtitle="Handpicked by our team for exceptional quality and charm"
              catbots={staffPicksCatbots}
              loading={sectionsLoading.staff}
              sectionType="staff"
            />

            {/* Recently Created */}
            <CatbotSection
              title="Recently Created"
              subtitle="Fresh faces in our cat community - be among the first to meet them"
              catbots={recentCatbots}
              loading={sectionsLoading.recent}
              sectionType="recent"
            />
          </div>

          {/* Activity Feed - Right Side (1/4 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <RecentActivityFeed 
                activities={activityFeed} 
                onlineCount={onlineCount}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;