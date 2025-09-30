import { Bot, Plus, Search, LogOut, User, Home, Settings, ChevronDown, Filter } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearch } from "@/contexts/SearchContext";
import { Input } from "@/components/ui/input";
import { TagFilter } from "@/components/TagFilter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";


const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { searchQuery, setSearchQuery, selectedTags, setSelectedTags, availableTags } = useSearch();
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
    `px-3 py-2 rounded-md text-sm font-medium text-black hover:bg-black/10 transition-colors flex items-center gap-2 ${isActive ? 'bg-black/10 font-semibold' : ''}`;

  return <header className="border-b bg-white backdrop-blur-sm sticky top-0 z-50 text-black">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity text-black">
          <span className="text-xl font-bold text-black">MiCat.Online</span>
        </Link>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search catbots..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="pl-10 bg-background"
              />
            </div>
            {availableTags.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedTags.length > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                        {selectedTags.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-white border shadow-lg z-50">
                  <TagFilter
                    availableTags={availableTags}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <nav className="flex items-center gap-4">
          {user ? <>
              <Link to="/" className={navLinkClass(location.pathname === "/")}>
                <Home className="h-4 w-4" />
                Home
              </Link>


              <Link to="/my-cats" className={navLinkClass(location.pathname === "/my-cats")}>
                <User className="h-4 w-4" />
                My Cats
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
              </button>

              <Link to="/auth" className="px-3 py-2 rounded-md text-sm font-medium text-black bg-black/10 hover:bg-black/20 transition-colors flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </>}
        </nav>
      </div>

      {/* Mobile Search Dropdown */}
      {showMobileSearch && (
        <div className="md:hidden border-t bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search catbots..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="pl-10 bg-background"
              />
            </div>
            {availableTags.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedTags.length > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                        {selectedTags.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-white border shadow-lg z-50">
                  <TagFilter
                    availableTags={availableTags}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      )}
    </header>;
};
export default Navigation;