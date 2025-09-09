import { Button } from "@/components/ui/button";
import { Bot, Plus, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 gradient-primary rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">CharacterAI</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Button
            variant={location.pathname === "/create" ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Character
            </Link>
          </Button>
          
          <Button
            variant={location.pathname === "/browse" ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/browse" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Browse Characters
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;