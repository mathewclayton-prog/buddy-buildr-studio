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
            <p className="text-sm text-muted-foreground"><strong>Last updated: {new Date().toLocaleDateString('en-GB')}</strong></p>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Data Controller</h2>
              <p className="text-muted-foreground mb-2">
                MiCat.Online is operated by Mathew Clayton. For data protection matters, you can contact us at:
              </p>
              <p className="text-muted-foreground">
                Email: mathewclayton@gmail.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Account Information (Legal Basis: Contract)</h3>
                  <ul className="space-y-1 ml-4">
                    <li>• Email address and username</li>
                    <li>• Display name and avatar (optional)</li>
                    <li>• Authentication data (encrypted passwords or OAuth tokens)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">User-Generated Content (Legal Basis: Contract)</h3>
                  <ul className="space-y-1 ml-4">
                    <li>• Catbot characters you create (name, description, personality traits)</li>
                    <li>• Chat conversations with catbots</li>
                    <li>• Images uploaded for avatars</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Usage Data (Legal Basis: Legitimate Interest)</h3>
                  <ul className="space-y-1 ml-4">
                    <li>• Pages visited, features used, interaction timestamps</li>
                    <li>• Device type, browser type, IP address</li>
                    <li>• Session duration and activity patterns</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. How We Use Your Information</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Service Delivery:</strong> To provide chatbot creation and conversation services</li>
                <li>• <strong>Account Management:</strong> To manage your account and authenticate access</li>
                <li>• <strong>Platform Improvement:</strong> To analyze usage patterns and improve features</li>
                <li>• <strong>Communication:</strong> To send important service updates (we do not send marketing emails)</li>
                <li>• <strong>AI Processing:</strong> Your chat messages are processed by AI services (OpenAI) to generate responses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Data Sharing and Third Parties</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>We do not sell your personal data. We share data only as follows:</p>
                <ul className="space-y-2 ml-4">
                  <li>• <strong>Supabase:</strong> Database and authentication provider (data stored in EU/US depending on configuration)</li>
                  <li>• <strong>OpenAI:</strong> AI language model provider for generating chatbot responses</li>
                  <li>• <strong>ElevenLabs:</strong> Voice synthesis provider (if voice features are used)</li>
                  <li>• <strong>Public Visibility:</strong> Catbots you mark as "public" are visible to all users along with your display name</li>
                </ul>
                <p className="mt-2">All third-party processors are bound by data protection agreements and GDPR compliance requirements.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your data may be processed outside the UK/EEA by our service providers (OpenAI in the US). These transfers are protected by appropriate safeguards including Standard Contractual Clauses approved by the EU Commission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Data Retention</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Account Data:</strong> Retained until you delete your account</li>
                <li>• <strong>Chat Messages:</strong> Retained indefinitely unless you delete your account</li>
                <li>• <strong>Analytics Data:</strong> Retained for up to 2 years for service improvement</li>
                <li>• <strong>Deleted Accounts:</strong> All personal data is permanently deleted within 30 days of account deletion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Your Rights Under UK GDPR</h2>
              <p className="text-muted-foreground mb-3">You have the following rights regarding your personal data:</p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• <strong>Right of Access:</strong> Request a copy of all data we hold about you</li>
                <li>• <strong>Right to Rectification:</strong> Correct inaccurate or incomplete data (via Profile settings)</li>
                <li>• <strong>Right to Erasure:</strong> Delete your account and all associated data (via Profile settings)</li>
                <li>• <strong>Right to Restrict Processing:</strong> Request temporary suspension of data processing</li>
                <li>• <strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li>• <strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li>• <strong>Right to Withdraw Consent:</strong> Where processing is based on consent</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                To exercise these rights, contact us at mathewclayton@gmail.com. We will respond within one month.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Cookies and Tracking</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Essential Cookies (Required):</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Authentication tokens to keep you logged in</li>
                  <li>• Session identifiers for security</li>
                </ul>
                <p className="mt-3"><strong>Analytics Cookies (Performance):</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Anonymous usage tracking to improve the service</li>
                  <li>• Session duration and page view tracking</li>
                </ul>
                <p className="mt-2">You can disable non-essential cookies through your browser settings, though this may affect functionality.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not directed to individuals under 16. We do not knowingly collect data from children under 16. If you believe we have collected data from a child under 16, please contact us immediately and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Data Security</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• All data is encrypted in transit using TLS/HTTPS</li>
                <li>• Passwords are hashed using industry-standard algorithms</li>
                <li>• Database access is restricted and authenticated</li>
                <li>• Regular security updates and monitoring</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Data Breach Notification</h2>
              <p className="text-muted-foreground">
                In the event of a data breach affecting your personal data, we will notify you and the Information Commissioner's Office (ICO) within 72 hours of becoming aware of the breach, as required by UK GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. Material changes will be notified via email or a prominent notice on the website. Continued use of the service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Complaints</h2>
              <p className="text-muted-foreground">
                If you believe we have not handled your personal data properly, you have the right to lodge a complaint with the Information Commissioner's Office (ICO):<br />
                Website: <a href="https://ico.org.uk" className="text-primary hover:underline">https://ico.org.uk</a><br />
                Phone: 0303 123 1113
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Contact Us</h2>
              <p className="text-muted-foreground">
                For any privacy-related questions, data access requests, or to exercise your rights under GDPR, contact us at:<br />
                Email: mathewclayton@gmail.com
              </p>
            </section>

            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground italic">
                This Privacy Policy complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
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