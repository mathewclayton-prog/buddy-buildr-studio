import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
          <div className="bg-card p-12 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">Coming Soon</h2>
            <p className="text-muted-foreground">
              We're working on creating our Privacy Policy. Check back soon!
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;