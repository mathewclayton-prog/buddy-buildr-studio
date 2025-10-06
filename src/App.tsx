import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { SearchProvider } from "@/contexts/SearchContext";
import Index from "./pages/Index";
import CreateCharacter from "./pages/CreateCharacter";
import ComingSoon from "./pages/ComingSoon";
import MyCatbots from "./pages/MyCatbots";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
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

// Check if we're in coming soon mode
const isComingSoonMode = import.meta.env.VITE_COMING_SOON_MODE === 'true';
// Check if user is accessing the dev route
const isDevRoute = window.location.pathname.startsWith('/dev');

const App = () => {
  // Coming Soon mode - minimal providers (unless accessing dev route)
  if (isComingSoonMode && !isDevRoute) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  // Full app mode - all providers
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <SearchProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Main routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/create" element={<CreateCharacter />} />
                <Route path="/edit/:catbotId" element={<CreateCharacter />} />
                <Route path="/browse" element={<Index />} />
                <Route path="/my-cats" element={<MyCatbots />} />
                <Route path="/chat/:characterId" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/community-guidelines" element={<CommunityGuidelines />} />
                <Route path="/help" element={<Help />} />
                <Route path="/faq" element={<FAQ />} />

                {/* Dev routes - for accessing full app during Coming Soon mode */}
                <Route path="/dev" element={<Index />} />
                <Route path="/dev/auth" element={<Auth />} />
                <Route path="/dev/reset-password" element={<ResetPassword />} />
                <Route path="/dev/create" element={<CreateCharacter />} />
                <Route path="/dev/edit/:catbotId" element={<CreateCharacter />} />
                <Route path="/dev/browse" element={<Index />} />
                <Route path="/dev/my-cats" element={<MyCatbots />} />
                <Route path="/dev/chat/:characterId" element={<Chat />} />
                <Route path="/dev/profile" element={<Profile />} />
                <Route path="/dev/about" element={<About />} />
                <Route path="/dev/contact" element={<Contact />} />
                <Route path="/dev/blog" element={<Blog />} />
                <Route path="/dev/terms" element={<Terms />} />
                <Route path="/dev/privacy" element={<Privacy />} />
                <Route path="/dev/community-guidelines" element={<CommunityGuidelines />} />
                <Route path="/dev/help" element={<Help />} />
                <Route path="/dev/faq" element={<FAQ />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SearchProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
