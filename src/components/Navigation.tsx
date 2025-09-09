import { Button } from "@/components/ui/button";
import { Bot, Plus, PawPrint, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
              <Button variant={location.pathname === "/create" ? "default" : "ghost"} size="sm" asChild>
                <Link to="/create" className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4" />
                  Create a Cat
                </Link>
              </Button>
              
              <Button variant={location.pathname === "/browse" ? "default" : "ghost"} size="sm" asChild>
                <Link to="/browse" className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4" />
                  Meet the Cats
                </Link>
              </Button>

              <Button variant="ghost" size="sm" onClick={signOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </> : <Button variant="default" size="sm" asChild>
              <Link to="/auth" className="flex items-center gap-2">
                <PawPrint className="h-4 w-4" />
                Sign In
              </Link>
            </Button>}
        </nav>
      </div>
    </header>;
};
export default Navigation;