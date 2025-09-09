import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Bot, Plus, Users, Sparkles, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroCat from "@/assets/hero-cat.png";
const Index = () => {
  const {
    user
  } = useAuth();
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="mb-8 flex justify-center">
            <div className="h-32 w-32 rounded-2xl flex items-center justify-center animate-float overflow-hidden">
              <img src={heroCat} alt="MiCatbot Hero" className="h-32 w-32 object-cover" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Create your own catbot</h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">Build a purrfect companion or bring your own feline friend to life.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? <>
                <Button variant="hero" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/create" className="flex items-center gap-3">
                    <Plus className="h-5 w-5" />
                    Create Character
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/browse" className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    Meet the Cats
                  </Link>
                </Button>
              </> : <>
                <Button variant="hero" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/auth" className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    Get Started
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild className="px-8 py-4 text-lg">
                  <Link to="/browse" className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    Meet the Cats
                  </Link>
                </Button>
              </>}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl shadow-card bg-card">
            <div className="h-12 w-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Creation</h3>
            <p className="text-muted-foreground">
              Simple form to create characters with personality traits and custom avatars
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl shadow-card bg-card">
            <div className="h-12 w-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Conversations</h3>
            <p className="text-muted-foreground">
              Chat with your characters using their unique personalities and traits
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl shadow-card bg-card">
            <div className="h-12 w-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Character Gallery</h3>
            <p className="text-muted-foreground">
              Browse and interact with all your created characters in one place
            </p>
          </div>
        </div>
      </main>
    </div>;
};
export default Index;