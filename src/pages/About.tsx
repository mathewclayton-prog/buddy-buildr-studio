import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground text-center">About Buddy Builder Studio</h1>
          
          <div className="bg-card p-8 rounded-lg shadow-lg space-y-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe everyone should be able to create and chat with amazing AI characters. Our platform makes it simple to bring your creative cat characters to life and share them with a community of cat lovers.
            </p>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Mission</h2>
              <p className="text-muted-foreground">
                Making AI character creation accessible, fun, and social for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Features</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Easy catbot creation in minutes</li>
                <li>• Engaging AI conversations</li>
                <li>• Community sharing and discovery</li>
                <li>• Private and public character options</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                Have questions or feedback? We'd love to hear from you!
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Email: mathewclayton at gmail dot com</li>
                <li>• We typically respond within 24 hours</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;