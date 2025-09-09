import { Button } from "@/components/ui/button";
import { Bot, Plus, PawPrint, LogOut, User, Home, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const logoCat = "/lovable-uploads/c7b70528-7764-40bc-9281-0ce068fbf6dc.png";
const Navigation = () => {
  const location = useLocation();
  const {
    user,
    signOut
  } = useAuth();
  return <header className="border-b bg-nav-orange backdrop-blur-sm sticky top-0 z-50 shadow-soft text-nav-orange-foreground">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity text-nav-orange-foreground">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src={logoCat} alt="MiCatbot Logo" className="h-8 w-8 object-cover" />
          </div>
          <span className="text-xl font-bold text-nav-orange-foreground">MiCat</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? <>
              <Button variant={location.pathname === "/" ? "default" : "ghost"} size="sm" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>

              <Button variant={location.pathname === "/browse" ? "default" : "ghost"} size="sm" asChild>
                <Link to="/browse" className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4" />
                  Explore Cats
                </Link>
              </Button>

              <Button variant={location.pathname === "/my-cats" ? "default" : "ghost"} size="sm" asChild>
                <Link to="/my-cats" className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4" />
                  My Cats
                </Link>
              </Button>

              <Button variant={location.pathname === "/create" ? "default" : "ghost"} size="sm" asChild>
                <Link to="/create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create a Cat
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={location.pathname === "/profile" ? "default" : "ghost"} size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </> : <>
              <Button variant={location.pathname === "/" ? "default" : "ghost"} size="sm" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>

              <Button variant={location.pathname === "/browse" ? "default" : "ghost"} size="sm" asChild>
                <Link to="/browse" className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4" />
                  Explore Cats
                </Link>
              </Button>

              <Button variant={location.pathname === "/create" ? "default" : "ghost"} size="sm" asChild>
                <Link to="/create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create a Cat
                </Link>
              </Button>

              <Button variant="default" size="sm" asChild>
                <Link to="/auth" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            </>}
        </nav>
      </div>
    </header>;
};
export default Navigation;