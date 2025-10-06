import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Sparkles,
  MessageSquare,
  User,
  Bot,
  MessageCircle,
  Compass,
  Shield,
  Wrench,
  Lightbulb,
  HelpCircle,
  Mail,
  FileText,
  AlertCircle,
  Settings,
  Image,
  Tag,
  Lock,
  Globe,
  Eye,
  Zap,
  Heart,
  Filter,
  Trash2,
  Key,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

const Help = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            How can we help you?
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find answers, learn best practices, and get the most out of your Catbot experience
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="search"
              placeholder="Search help articles..."
              className="pl-10 py-6 text-base"
            />
          </div>
        </div>

        {/* Quick Start Guide */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Quick Start Guide</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Create your account and set up your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Learn the basics of creating an account, customizing your profile, and navigating the platform.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Create Your First Catbot</CardTitle>
                <CardDescription>
                  Bring your AI character to life
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Step-by-step guide to creating your first catbot with personality, avatar, and tags.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Start Chatting</CardTitle>
                <CardDescription>
                  Begin conversations with catbots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Discover how to chat with catbots, understand responses, and make the most of conversations.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Help Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Help Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Account & Profile */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <User className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Account & Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Creating and managing your account
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Profile settings and customization
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Password reset and security
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Account deletion
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Creating Catbots */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Bot className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Creating Catbots</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Standard vs Enhanced creation modes
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Writing effective personality descriptions
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Training conversation feature
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    AI avatar generation and uploads
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Tagging and visibility settings
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Chatting */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Chatting</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    How conversations work
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    AI response quality tips
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Memory and context understanding
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Local LLM option explained
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Chat privacy and data storage
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Discovery & Browsing */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Compass className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Discovery & Browsing</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Finding catbots that interest you
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Using tag filters and search
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Liking and bookmarking favorites
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Understanding catbot statistics
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Content & Safety */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Content & Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Community guidelines overview
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Content moderation system
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Copyright and intellectual property
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Reporting issues and concerns
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Technical Help */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Wrench className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Technical Help</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Browser compatibility
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Performance optimization tips
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    Common error messages explained
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    AI model information
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-3">
              <CardHeader>
                <Lightbulb className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                      Creating engaging and memorable catbots
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                      Writing better prompts for quality responses
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                      Privacy tips for safe chatbot interactions
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                      Making your catbots discoverable
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground">Common Issues & Solutions</h2>
            <p className="text-muted-foreground mt-2">Quick fixes for frequently encountered problems</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span>My catbot isn't responding or responses are slow</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Possible solutions:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Check your internet connection</li>
                    <li>Try refreshing the page</li>
                    <li>If using Local LLM, ensure your browser supports it and the model is downloaded</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Try a different browser</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Image className="h-5 w-5 text-primary" />
                  <span>Avatar generation failed or image won't upload</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Possible solutions:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Ensure your image is under 5MB in size</li>
                    <li>Use supported formats: JPG, PNG, or WebP</li>
                    <li>Try a different image or regenerate the AI avatar</li>
                    <li>Check that your description is clear and appropriate</li>
                    <li>Wait a moment and try again if the service is busy</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <span>I can't find my catbot in the public directory</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Check these things:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Verify the catbot is set to "Public" in visibility settings</li>
                    <li>Make sure you've added at least one tag</li>
                    <li>Check if the catbot name matches your search</li>
                    <li>Try clearing all filters and searching again</li>
                    <li>New catbots may take a moment to appear in listings</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-primary" />
                  <span>Tags aren't working or appearing correctly</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Troubleshooting steps:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Use the AI tag generator for automatic suggestions</li>
                    <li>Ensure tags are relevant to your catbot's personality</li>
                    <li>Avoid using special characters in tags</li>
                    <li>Tags should be concise (1-2 words typically)</li>
                    <li>Save your changes after editing tags</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Chat history disappeared or isn't saving</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>What to check:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Make sure you're logged into your account</li>
                    <li>Check if you're using the same device/browser</li>
                    <li>Verify you haven't cleared browser data recently</li>
                    <li>If using Local LLM, chats are stored locally in your browser</li>
                    <li>Contact support if the issue persists</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-primary" />
                  <span>I forgot my password or can't log in</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Recovery steps:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Use the "Forgot Password" link on the login page</li>
                    <li>Check your email (including spam folder) for reset instructions</li>
                    <li>Ensure you're using the correct email address</li>
                    <li>Try clearing your browser cache and cookies</li>
                    <li>If issues persist, contact support for assistance</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Additional Resources */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Additional Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <Link to="/faq">
              <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                <CardHeader>
                  <HelpCircle className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">FAQ</CardTitle>
                  <CardDescription>
                    Frequently asked questions and quick answers
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/community-guidelines">
              <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Community Guidelines</CardTitle>
                  <CardDescription>
                    Rules and best practices for our community
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/terms">
              <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Terms of Service</CardTitle>
                  <CardDescription>
                    Legal terms and conditions of use
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/privacy">
              <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                <CardHeader>
                  <Lock className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Privacy Policy</CardTitle>
                  <CardDescription>
                    How we protect and handle your data
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </section>

        {/* Contact Section */}
        <section className="max-w-2xl mx-auto text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Still Need Help?</CardTitle>
              <CardDescription className="text-base">
                Can't find what you're looking for? Our support team is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24-48 hours during business days.
                </p>
                <Link to="/contact">
                  <Button size="lg" className="gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Help;
