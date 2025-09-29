import { useState, useEffect } from "react";
import { Home, Plus, User, Search, Bot, LogOut, ChevronDown, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function AppSidebar({ searchQuery, setSearchQuery }: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // Load user's display name and avatar
  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setDisplayName("");
      setAvatarUrl("");
      setLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Set display name with fallbacks
      if (data?.display_name) {
        setDisplayName(data.display_name);
      } else if (user.email) {
        // Fallback to email username (part before @)
        setDisplayName(user.email.split('@')[0]);
      } else {
        setDisplayName("User");
      }

      // Set avatar URL
      setAvatarUrl(data?.avatar_url || "");
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to email or "User"
      if (user.email) {
        setDisplayName(user.email.split('@')[0]);
      } else {
        setDisplayName("User");
      }
      setAvatarUrl("");
    } finally {
      setLoading(false);
    }
  };

  const getTruncatedName = (name: string) => {
    if (name.length > 15) {
      return name.substring(0, 12) + "...";
    }
    return name;
  };

  const isActive = (path: string) => location.pathname === path;

  const getNavClass = (active: boolean) => 
    active ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50";

  const menuItems = [
    { title: "Create a Cat", url: "/create", icon: Plus },
    { title: "Home", url: "/", icon: Home },
    ...(user ? [{ title: "My Cats", url: "/my-cats", icon: User }] : []),
    { title: "Search", url: "/#search", icon: Search },
    ...(user ? [{ title: "Profile", url: "/profile", icon: User }] : []),
  ];

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      {/* Logo Header */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <Bot className="h-6 w-6 text-primary flex-shrink-0" />
            {!collapsed && (
              <span className="font-bold text-lg text-foreground">MiCat.Online</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={getNavClass(isActive(item.url))}
                      onClick={item.title === "Search" ? (e) => {
                        e.preventDefault();
                        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                        if (searchInput) {
                          searchInput.focus();
                        }
                      } : undefined}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Search Section */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search catbots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer - Only show for non-authenticated users */}
      {!user && (
        <SidebarFooter className="border-t p-2">
          <SidebarMenuButton asChild>
            <Link to="/auth" className="flex items-center gap-2 justify-center p-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md">
              <User className="h-4 w-4" />
              {!collapsed && <span>Sign In</span>}
            </Link>
          </SidebarMenuButton>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}