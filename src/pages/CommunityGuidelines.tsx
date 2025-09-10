import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Check, X, AlertTriangle, Shield, Users } from "lucide-react";

const CommunityGuidelines = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-foreground text-center">Community Guidelines</h1>
          <p className="text-xl text-muted-foreground text-center mb-12">Creating a Safe and Fun Space for Everyone</p>
          
          <div className="bg-card p-8 rounded-lg shadow-lg space-y-8">
            
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-primary" size={28} />
                <h2 className="text-2xl font-semibold text-foreground">Creating Great Catbots</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-medium text-green-600 mb-4">
                    <Check size={20} />
                    Do:
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                      Create original, creative characters
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                      Write clear, engaging descriptions
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                      Make catbots that are fun to chat with
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                      Use appropriate images and content
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-medium text-red-600 mb-4">
                    <X size={20} />
                    Don't:
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <X size={16} className="text-red-600 mt-1 flex-shrink-0" />
                      Copy other people's exact catbot designs
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={16} className="text-red-600 mt-1 flex-shrink-0" />
                      Create catbots with harmful or offensive content
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={16} className="text-red-600 mt-1 flex-shrink-0" />
                      Use copyrighted characters without permission
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={16} className="text-red-600 mt-1 flex-shrink-0" />
                      Make catbots designed to harass or upset users
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <Shield className="text-primary" size={28} />
                <h2 className="text-2xl font-semibold text-foreground">Chatting Respectfully</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-medium text-green-600 mb-4">
                    <Check size={20} />
                    Do:
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                      Be respectful in conversations
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                      Report inappropriate catbots or behavior
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                      Enjoy creative conversations
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                      Respect that conversations are meant to be fun
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-medium text-red-600 mb-4">
                    <X size={20} />
                    Don't:
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <X size={16} className="text-red-600 mt-1 flex-shrink-0" />
                      Use catbots to harass other users
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={16} className="text-red-600 mt-1 flex-shrink-0" />
                      Share personal information in chats
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={16} className="text-red-600 mt-1 flex-shrink-0" />
                      Try to break or exploit the chat system
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={16} className="text-red-600 mt-1 flex-shrink-0" />
                      Create multiple accounts to evade restrictions
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-primary" size={28} />
                <h2 className="text-2xl font-semibold text-foreground">Reporting Issues</h2>
              </div>
              <p className="text-muted-foreground mb-4">If you encounter inappropriate content or behavior:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Use the report feature on catbots or chats</li>
                <li>• Contact our support team</li>
                <li>• We review all reports promptly</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Consequences</h2>
              <p className="text-muted-foreground mb-4">Violations may result in:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Content removal</li>
                <li>• Account warnings</li>
                <li>• Account suspension</li>
                <li>• Permanent ban for serious violations</li>
              </ul>
            </section>

            <div className="pt-6 border-t border-border text-center">
              <p className="text-lg text-foreground font-medium">
                Let's build an awesome community together! 🐱
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CommunityGuidelines;