import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground text-center">Privacy Policy</h1>
          
          <div className="bg-card p-8 rounded-lg shadow-lg space-y-8">
            <p className="text-sm text-muted-foreground"><strong>Last updated: 10.9.25</strong></p>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Information We Collect</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Account information (username, email)</li>
                <li>• Catbot creations and chat conversations</li>
                <li>• Usage data and site analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">How We Use Your Information</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• To provide chatbot creation and chat services</li>
                <li>• To improve our platform</li>
                <li>• To communicate important updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Information Sharing</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• We do not sell your personal information</li>
                <li>• Chat conversations are private between you and the catbots</li>
                <li>• Public catbots you create are visible to other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Storage</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Your data is stored securely using industry standards</li>
                <li>• You can delete your account and data at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Cookies</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• We use cookies for login sessions and site functionality</li>
                <li>• Analytics cookies help us improve the site</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact</h2>
              <p className="text-muted-foreground">
                For privacy questions, contact us at: mathewclayton at gmail dot com
              </p>
            </section>

            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground italic">
                This policy may be updated periodically. Continued use means acceptance of changes.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;