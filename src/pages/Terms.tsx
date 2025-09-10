import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground text-center">Terms of Service</h1>
          
          <div className="bg-card p-8 rounded-lg shadow-lg space-y-8">
            <p className="text-sm text-muted-foreground"><strong>Last updated: 10.9.25</strong></p>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Acceptable Use</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• You must be 13+ to use this service</li>
                <li>• Create original catbots or use characters you have rights to</li>
                <li>• No harmful, illegal, or inappropriate content</li>
                <li>• No harassment of other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Content</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• You own the catbots you create</li>
                <li>• Public catbots can be used by other site users</li>
                <li>• We can remove content that violates these terms</li>
                <li>• You're responsible for your catbot's content and conversations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Service Availability</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• We provide the service "as is"</li>
                <li>• We may update or change features</li>
                <li>• We're not liable for service interruptions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Account Termination</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• You can delete your account anytime</li>
                <li>• We can suspend accounts that violate terms</li>
                <li>• Deleted accounts lose all associated data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Prohibited Content</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• No adult content involving minors</li>
                <li>• No hate speech or harassment</li>
                <li>• No impersonation of real people without permission</li>
                <li>• No spam or malicious content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact</h2>
              <p className="text-muted-foreground">
                Questions about these terms? Contact us at: mathewclayton at gmail dot com
              </p>
            </section>

            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground italic">
                By using our service, you agree to these terms.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;