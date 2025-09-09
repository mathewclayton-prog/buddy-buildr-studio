import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Bot, Plus, Users, Sparkles, PawPrint, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
const heroCat = "/lovable-uploads/64020e0f-9ccf-4775-a7f0-8791338dde1c.png";
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
            <div className="h-48 w-full max-w-2xl bg-card rounded-md overflow-hidden shadow-card">
              <img src={heroCat} alt="MiCatbot Hero" className="h-full w-full object-cover" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Create Your Own Catbot</h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"> Bring your own feline friend to life or build a purrfect companion.</p>

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
                    <PawPrint className="h-5 w-5" />
                    Meet the Cats
                  </Link>
                </Button>
              </> : <>
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
              </>}
          </div>
        </div>

        {/* Popular Catbots Section */}
        <section className="mt-24 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Explore Community Catbots</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing catbots created by our community and start chatting with them right away
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {/* Sample Catbot Cards */}
            {[
              {
                name: "Whiskers",
                description: "A playful orange tabby who loves to share funny stories and chase virtual mice.",
                avatar: "/lovable-uploads/53bcedde-c15b-42eb-8a6c-d3378963baa2.png"
              },
              {
                name: "Luna",
                description: "A wise midnight black cat with a passion for stargazing and moonlit adventures.",
                avatar: "/lovable-uploads/c7b70528-7764-40bc-9281-0ce068fbf6dc.png"
              },
              {
                name: "Mittens",
                description: "A fluffy white Persian who enjoys cozy conversations and sharing warm hugs.",
                avatar: "/lovable-uploads/64020e0f-9ccf-4775-a7f0-8791338dde1c.png"
              },
              {
                name: "Shadow",
                description: "A mysterious gray cat with incredible stories from their nine lives of adventure.",
                avatar: "/lovable-uploads/53bcedde-c15b-42eb-8a6c-d3378963baa2.png"
              },
              {
                name: "Ginger",
                description: "An energetic ginger cat who loves to play games and make new friends.",
                avatar: "/lovable-uploads/c7b70528-7764-40bc-9281-0ce068fbf6dc.png"
              },
              {
                name: "Smokey",
                description: "A calm and philosophical cat who enjoys deep conversations about life.",
                avatar: "/lovable-uploads/64020e0f-9ccf-4775-a7f0-8791338dde1c.png"
              },
              {
                name: "Patches",
                description: "A colorful calico with a bubbly personality and endless curiosity.",
                avatar: "/lovable-uploads/53bcedde-c15b-42eb-8a6c-d3378963baa2.png"
              },
              {
                name: "Storm",
                description: "A sleek black cat with lightning-fast wit and storm-chasing stories.",
                avatar: "/lovable-uploads/c7b70528-7764-40bc-9281-0ce068fbf6dc.png"
              }
            ].map((catbot, index) => (
              <Card key={index} className="hover-scale cursor-pointer group shadow-card hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden shadow-soft">
                    <img 
                      src={catbot.avatar} 
                      alt={`${catbot.name} avatar`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                  <CardTitle className="text-center text-lg">{catbot.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center mb-4 text-sm line-clamp-3">
                    {catbot.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    asChild
                  >
                    <Link to={`/chat/${catbot.name.toLowerCase()}`} className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Chat Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" asChild className="px-8">
              <Link to="/browse" className="flex items-center gap-2">
                View All Catbots
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

      </main>
    </div>;
};
export default Index;