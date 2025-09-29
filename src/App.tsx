import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import CreateCharacter from "./pages/CreateCharacter";

import MyCatbots from "./pages/MyCatbots";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import Help from "./pages/Help";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Standalone pages without sidebar */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Main app pages with sidebar */}
            <Route path="/" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <Index />
                </div>
              </SidebarProvider>
            } />
            <Route path="/create" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <CreateCharacter />
                </div>
              </SidebarProvider>
            } />
            <Route path="/edit/:catbotId" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <CreateCharacter />
                </div>
              </SidebarProvider>
            } />
            <Route path="/browse" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <Index />
                </div>
              </SidebarProvider>
            } />
            <Route path="/my-cats" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <MyCatbots />
                </div>
              </SidebarProvider>
            } />
            <Route path="/chat/:characterId" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <Chat />
                </div>
              </SidebarProvider>
            } />
            <Route path="/profile" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <Profile />
                </div>
              </SidebarProvider>
            } />
            <Route path="/about" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <About />
                </div>
              </SidebarProvider>
            } />
            <Route path="/contact" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <Contact />
                </div>
              </SidebarProvider>
            } />
            <Route path="/blog" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <Blog />
                </div>
              </SidebarProvider>
            } />
            <Route path="/terms" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <Terms />
                </div>
              </SidebarProvider>
            } />
            <Route path="/privacy" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <Privacy />
                </div>
              </SidebarProvider>
            } />
            <Route path="/community-guidelines" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <CommunityGuidelines />
                </div>
              </SidebarProvider>
            } />
            <Route path="/help" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <Help />
                </div>
              </SidebarProvider>
            } />
            <Route path="/faq" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <FAQ />
                </div>
              </SidebarProvider>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
