import { Bot, Plus, Search, LogOut, User, Home, Settings, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearch } from "@/contexts/SearchContext";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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

  // Truncate username if too long
  const getTruncatedName = (name: string) => {
    if (name.length > 15) {
      return name.substring(0, 12) + "...";
    }
    return name;
  };
  const navLinkClass = (isActive: boolean) => 
    `px-3 py-2 rounded-md text-sm font-medium text-black hover:bg-black/10 transition-colors flex items-center gap-2 ${isActive ? 'font-semibold' : ''}`;

  return <header className="border-b bg-white backdrop-blur-sm sticky top-0 z-50 text-black">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity text-black">
          <span className="text-xl font-bold text-black">MiCat.Online</span>
        </Link>

        <nav className="flex items-center gap-4">
          {/* Desktop Search Bar */}
          <div className="hidden md:flex w-48">
            <div className="relative w-full px-3 py-2 rounded-md hover:bg-black/10 transition-colors">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search catbots..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="pl-7 pr-3 py-0 h-auto bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
          {user ? <>
              <Link to="/" className={navLinkClass(location.pathname === "/")}>
                <Home className="h-4 w-4" />
                Home
              </Link>


              <Link to="/my-cats" className={navLinkClass(location.pathname === "/my-cats")}>
                <User className="h-4 w-4" />
                My Cats
              </Link>

              <Link to="/create" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create a Cat</span>
                <span className="sm:hidden">Create</span>
              </Link>

              {/* Mobile Search Toggle */}
              <button 
                className="md:hidden px-3 py-2 rounded-md text-sm font-medium text-black hover:bg-black/10 transition-colors flex items-center gap-2"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="h-4 w-4" />
                Search
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`${navLinkClass(location.pathname === "/profile")} max-w-[200px]`}>
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profile" 
                        className="h-5 w-5 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <User className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {loading ? "..." : getTruncatedName(displayName)}
                    </span>
                    <ChevronDown className="h-3 w-3 flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg z-50">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer text-black">
                      <User className="h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 cursor-pointer text-black">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </> : <>
              <Link to="/" className={navLinkClass(location.pathname === "/")}>
                <Home className="h-4 w-4" />
                Home
              </Link>


              <Link to="/create" className={navLinkClass(location.pathname === "/create")}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create a Cat</span>
                <span className="sm:hidden">Create</span>
              </Link>

              {/* Mobile Search Toggle */}
              <button 
                className="md:hidden px-3 py-2 rounded-md text-sm font-medium text-black hover:bg-black/10 transition-colors flex items-center gap-2"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="h-4 w-4" />
                Search
              </button>

              <Link to="/auth" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </>}
        </nav>
      </div>

      {/* Mobile Search Dropdown */}
      {showMobileSearch && (
        <div className="md:hidden border-t bg-white px-4 py-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search catbots..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 bg-background"
            />
          </div>
        </div>
      )}
    </header>;
};
export default Navigation;