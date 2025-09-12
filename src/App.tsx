import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import GlobalAudioManager from "@/components/GlobalAudioManager";
import Index from "./pages/Index";
import CreateCharacter from "./pages/CreateCharacter";
import BrowseCharacters from "./pages/BrowseCharacters";
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
    <AuthProvider>
      <GlobalAudioManager />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create" element={<CreateCharacter />} />
          <Route path="/edit/:catbotId" element={<CreateCharacter />} />
          <Route path="/browse" element={<BrowseCharacters />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
