import { Bot, Plus, PawPrint, LogOut, User, Home, Settings, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

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
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity text-black">
          <span className="text-xl font-bold text-black">MiCat.Online</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? <>
              <Link to="/" className={navLinkClass(location.pathname === "/")}>
                <Home className="h-4 w-4" />
                Home
              </Link>

              <Link to="/browse" className={navLinkClass(location.pathname === "/browse")}>
                <PawPrint className="h-4 w-4" />
                Explore Cats
              </Link>

              <Link to="/my-cats" className={navLinkClass(location.pathname === "/my-cats")}>
                <PawPrint className="h-4 w-4" />
                My Cats
              </Link>

              <Link to="/create" className={navLinkClass(location.pathname === "/create")}>
                <Plus className="h-4 w-4" />
                Create a Cat
              </Link>

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

              <Link to="/browse" className={navLinkClass(location.pathname === "/browse")}>
                <PawPrint className="h-4 w-4" />
                Explore Cats
              </Link>

              <Link to="/create" className={navLinkClass(location.pathname === "/create")}>
                <Plus className="h-4 w-4" />
                Create a Cat
              </Link>

              <Link to="/auth" className="px-3 py-2 rounded-md text-sm font-medium text-black bg-black/10 hover:bg-black/20 transition-colors flex items-center gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Link>
            </>}
        </nav>
      </div>
    </header>;
};
export default Navigation;