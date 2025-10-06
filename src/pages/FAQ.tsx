import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Bot, MessageCircle, Lock, Image, Tag, Brain, Shield, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about creating and chatting with catbots
            </p>
          </div>

          <div className="space-y-8">
            {/* Getting Started */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Bot className="text-primary" size={24} />
                <h2 className="text-2xl font-semibold text-foreground">Getting Started</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-is-catbot">
                  <AccordionTrigger>What is a Catbot?</AccordionTrigger>
                  <AccordionContent>
                    A catbot is an AI-powered chat character that you can create and customize. Each catbot has its own personality, description, and appearance. You can chat with catbots created by others or create your own to share with the community.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="first-catbot">
                  <AccordionTrigger>How do I create my first catbot?</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Sign in or create an account</li>
                      <li>Click the "Create Catbot" button in the navigation</li>
                      <li>Fill in your catbot's name and descriptions</li>
                      <li>Choose or generate an avatar</li>
                      <li>Set visibility (public or private)</li>
                      <li>Click "Create Catbot" to save</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="account-required">
                  <AccordionTrigger>Do I need an account to use the platform?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you need to create a free account to chat with catbots and create your own. This allows us to save your chat history and catbots securely.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Creating Catbots */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Settings className="text-primary" size={24} />
                <h2 className="text-2xl font-semibold text-foreground">Creating Catbots</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="creation-modes">
                  <AccordionTrigger>What's the difference between Standard and Enhanced creation modes?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>Standard Mode:</strong> Quick and simple creation with just the essential fields - name, public profile, and personality description.</p>
                      <p><strong>Enhanced Mode:</strong> Advanced options including custom greeting messages, suggested conversation starters, detailed descriptions, and advanced personality definitions for more sophisticated catbot behavior.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="public-vs-training">
                  <AccordionTrigger>What's the difference between Public Profile and Personality & History?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>Public Profile (80 chars max):</strong> This is what everyone sees when browsing catbots. It's a short, catchy description that appears on your catbot's card.</p>
                      <p><strong>Personality & History (10,000 chars max):</strong> This is private training data that shapes how your catbot responds in conversations. Only the AI uses this information - other users never see it. Include personality traits, background story, speaking style, and any details that help the AI embody your character.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="edit-catbot">
                  <AccordionTrigger>Can I edit my catbot after creating it?</AccordionTrigger>
                  <AccordionContent>
                    Yes! Go to "My Catbots" in the navigation, find your catbot, and click the edit button. You can update everything except past chat messages.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-many">
                  <AccordionTrigger>How many catbots can I create?</AccordionTrigger>
                  <AccordionContent>
                    There's no limit! You can create as many catbots as you'd like, both public and private.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Avatars */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Image className="text-primary" size={24} />
                <h2 className="text-2xl font-semibold text-foreground">Avatars & Appearance</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="avatar-options">
                  <AccordionTrigger>What avatar options are available?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-muted-foreground">
                      <p>You have three options for your catbot's avatar:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>Upload an image:</strong> Use your own image (JPG, PNG, or animated GIF)</li>
                        <li><strong>AI-generated:</strong> Let our AI create a unique avatar based on your catbot's description</li>
                        <li><strong>Color avatar:</strong> Use a simple colored icon (default option)</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ai-avatar">
                  <AccordionTrigger>How do I generate an AI avatar?</AccordionTrigger>
                  <AccordionContent>
                    Fill in your catbot's name and personality description first, then click the "Generate AI Avatar" button. The AI will create a unique image based on your character's traits and description.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="animated-avatars">
                  <AccordionTrigger>Can I use animated avatars?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can upload animated GIF files as avatars. Just make sure the file is under 5MB.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Tags */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Tag className="text-primary" size={24} />
                <h2 className="text-2xl font-semibold text-foreground">Tags & Discovery</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-are-tags">
                  <AccordionTrigger>What are tags and how do they work?</AccordionTrigger>
                  <AccordionContent>
                    Tags are keywords that help users discover your catbot. They describe your catbot's personality, themes, or characteristics. For example: "friendly", "mysterious", "storyteller", "fantasy", etc. You can add up to 8 tags per catbot.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="generate-tags">
                  <AccordionTrigger>Can tags be generated automatically?</AccordionTrigger>
                  <AccordionContent>
                    Yes! After filling in your catbot's name and description, click "Generate AI Tags" to get suggested tags. You can then choose which ones to keep, remove any you don't like, or add your own custom tags.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Chatting */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="text-primary" size={24} />
                <h2 className="text-2xl font-semibold text-foreground">Chatting with Catbots</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="how-chat-works">
                  <AccordionTrigger>How do conversations work?</AccordionTrigger>
                  <AccordionContent>
                    When you start chatting with a catbot, a private conversation session is created just for you. The AI generates responses based on the catbot's personality description and your conversation history. Your chat is saved automatically and you can continue it anytime.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="chat-privacy">
                  <AccordionTrigger>Are my chats private?</AccordionTrigger>
                  <AccordionContent>
                    Yes, your chat conversations are completely private. Only you can see your messages with a catbot. Other users cannot see your conversations, even if they chat with the same catbot.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ai-model">
                  <AccordionTrigger>What AI model generates the responses?</AccordionTrigger>
                  <AccordionContent>
                    We use advanced language models to generate catbot responses. The platform supports both cloud-based AI and local models. The AI Status indicator in the chat header shows when enhanced AI responses are available.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="conversation-memory">
                  <AccordionTrigger>Does the catbot remember our previous conversations?</AccordionTrigger>
                  <AccordionContent>
                    Yes! The AI uses your conversation history (last 20 messages) as context when generating responses. This allows for more natural, coherent conversations where the catbot can reference things you discussed earlier.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Privacy & Visibility */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-primary" size={24} />
                <h2 className="text-2xl font-semibold text-foreground">Privacy & Visibility</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="public-vs-private">
                  <AccordionTrigger>What's the difference between public and private catbots?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>Public Catbots:</strong> Appear in the browse section for all users to discover and chat with. Anyone can start a conversation with your public catbot.</p>
                      <p><strong>Private Catbots:</strong> Only visible to you. Perfect for personal characters or work-in-progress catbots. You can make them public later if you choose.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="who-sees-what">
                  <AccordionTrigger>Who can see my catbot's training description?</AccordionTrigger>
                  <AccordionContent>
                    No one can see your catbot's training description (Personality & History) - not even other users who chat with your catbot. Only the public profile is visible to others. The training description is used exclusively by the AI to generate appropriate responses.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="change-visibility">
                  <AccordionTrigger>Can I change a catbot from private to public later?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can edit your catbot at any time and toggle between public and private visibility.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Content Guidelines */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-primary" size={24} />
                <h2 className="text-2xl font-semibold text-foreground">Content & Safety</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="content-rules">
                  <AccordionTrigger>What content is not allowed?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-muted-foreground">
                      <p>We have strict content guidelines to keep the platform safe and welcoming:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>No explicit sexual content (NSFW)</li>
                        <li>No violence, gore, or harmful content</li>
                        <li>No hate speech or harassment</li>
                        <li>No copyrighted characters without permission</li>
                        <li>No illegal activities or dangerous content</li>
                      </ul>
                      <p className="mt-2">View our full <Link to="/community-guidelines" className="text-primary hover:underline">Community Guidelines</Link> for details.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="content-moderation">
                  <AccordionTrigger>How is content moderated?</AccordionTrigger>
                  <AccordionContent>
                    We use automated content filtering to check catbot descriptions and chat messages for inappropriate content. If flagged content is detected, you'll be asked to revise it before proceeding. This helps keep the community safe for everyone.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="copyright">
                  <AccordionTrigger>Can I create catbots based on existing characters?</AccordionTrigger>
                  <AccordionContent>
                    You should only create original characters or use characters you have rights to. Don't create catbots based on copyrighted characters from movies, TV shows, books, or games without permission. See our <Link to="/community-guidelines" className="text-primary hover:underline">Intellectual Property guidelines</Link> for more information.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="report">
                  <AccordionTrigger>How do I report inappropriate content?</AccordionTrigger>
                  <AccordionContent>
                    If you encounter a catbot or content that violates our guidelines, please contact us through the <Link to="/contact" className="text-primary hover:underline">Contact page</Link> with details about the issue.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Technical */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Brain className="text-primary" size={24} />
                <h2 className="text-2xl font-semibold text-foreground">Technical Details</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="data-storage">
                  <AccordionTrigger>How is my data stored?</AccordionTrigger>
                  <AccordionContent>
                    All your catbots, chat history, and account information are securely stored in our database. We use industry-standard encryption and security practices to protect your data. Read our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for complete details.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="local-llm">
                  <AccordionTrigger>What does the "AI Status" indicator mean?</AccordionTrigger>
                  <AccordionContent>
                    The AI Status indicator shows whether enhanced AI responses are currently available. When active, responses use more advanced language models for more natural and contextual conversations. The system automatically falls back to standard responses if the enhanced AI is temporarily unavailable.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="memory-indicator">
                  <AccordionTrigger>What does the Memory indicator show?</AccordionTrigger>
                  <AccordionContent>
                    The Memory indicator shows how much conversation context the AI is currently using. It displays the percentage of available context memory being used by your chat history. This helps you understand when older messages might start being forgotten.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Additional Help */}
            <div className="mt-12 p-6 bg-card rounded-lg border text-center">
              <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? We're here to help!
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/contact">
                  <Button variant="default">Contact Us</Button>
                </Link>
                <Link to="/community-guidelines">
                  <Button variant="outline">Community Guidelines</Button>
                </Link>
                <Link to="/help">
                  <Button variant="outline">Help Center</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;