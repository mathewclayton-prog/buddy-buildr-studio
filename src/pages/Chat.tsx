import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import LLMStatus from "@/components/LLMStatus";
import { Bot, Send, ArrowLeft, User, MoreVertical, Brain, Lock } from "lucide-react";
import { Character, ChatMessage, ChatSession } from "@/types/character";
import { localLLM } from "@/services/localLLM";
import { ChatService } from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getCharacterForChat } from "@/lib/characterQueries";
import { OpeningMessageGenerator } from "@/utils/openingMessageGenerator";
import MemoryIndicator from "@/components/MemoryIndicator";
import { validateContent } from "@/utils/contentModeration";
import { useAnalytics } from "@/hooks/useAnalytics";

const Chat = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { trackEvent } = useAnalytics();
  
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('user_id', user.id)
            .maybeSingle();
          
          setUserAvatarUrl(profile?.avatar_url || null);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start chatting with catbots.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    if (!characterId || !user) return;
    
    const loadCharacter = async () => {
      try {
        // Fetch catbot from Supabase using secure function
        const data = await getCharacterForChat(characterId);
        
        if (data) {
          // Convert Supabase catbot to Character format
          const char: Character = {
            id: data.id,
            name: data.name,
            publicProfile: data.public_profile || (data.description ? data.description.substring(0, 250) : ''),
            trainingDescription: data.training_description || data.description || '',
            personalityTraits: data.personality ? [data.personality] : ['friendly'],
            avatar: data.avatar_url || undefined,
            createdAt: new Date(data.created_at),
          };
          
          setCharacter(char);
          await loadChatSession(characterId, char);
        }
      } catch (error) {
        console.error('Error fetching catbot:', error);
        toast({
          title: "Character Not Found",
          description: "The character you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate("/browse");
      }
    };
    
    loadCharacter();
  }, [characterId, user, navigate, toast]);

  const loadChatSession = async (catbotId: string, char: Character) => {
    if (!user) return;
    
    try {
      setLoadingMessages(true);
      
      // Check for existing chat session
      const existingSession = await ChatService.getExistingSession(catbotId, user.id);

      let currentSessionId: string;

      if (existingSession) {
        currentSessionId = existingSession.id;
        
        // Load existing messages
        const loadedMessages = await ChatService.getChatMessages(currentSessionId);
        setMessages(loadedMessages);
      } else {
        // Create new session
        const newSession = await ChatService.createChatSession(catbotId, user.id, `Chat with ${char.name}`);
        currentSessionId = newSession.id;

        // Track chat started event
        trackEvent('chat_started', {}, catbotId);

        // Generate AI-powered opening message
        try {
          setIsTyping(true);
          
          // Request opening greeting from AI with empty conversation history
          const openingContent = await localLLM.generateResponse(
            catbotId, 
            "START_CONVERSATION", // Special trigger message
            [], // Empty history signals opening greeting
            user.id
          );
          
          const greeting = await ChatService.saveMessage(currentSessionId, openingContent, false);
          setMessages([greeting]);
        } catch (error) {
          console.error('Error generating opening:', error);
          // Fallback to old generator if AI fails
          const fallbackContent = OpeningMessageGenerator.generateOpening(char, {
            includeQuestion: true,
            maxLength: 250
          });
          const greeting = await ChatService.saveMessage(currentSessionId, fallbackContent, false);
          setMessages([greeting]);
        } finally {
          setIsTyping(false);
        }
      }
      
      setSessionId(currentSessionId);
    } catch (error) {
      console.error('Error loading chat session:', error);
      toast({
        title: "Error",
        description: "Failed to load chat session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateResponse = async (userMessage: string, character: Character): Promise<string> => {
    // Get conversation history for context (last 20 messages)
    const conversationHistory = messages.slice(-20).map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }));

    // Check if this is a Supabase-backed catbot (has proper UUID format)
    const isSupabaseCatbot = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(character.id);

    try {
      if (localLLM.isReady() && isSupabaseCatbot) {
        const response = await localLLM.generateResponse(character.id, userMessage, conversationHistory, user?.id);
        return response;
      }
    } catch (error: any) {
      console.error("LLM generation failed:", error);
      
      // Check if it's a moderation error
      if (error.message === 'inappropriate_content') {
        toast({
          title: "Message Blocked",
          description: "Your message was blocked by our content filter.",
          variant: "destructive",
        });
        throw error;
      }
      
      // For other errors, continue to fallback
      console.log("Using fallback response");
    }

    // Fallback to simple responses if LLM not available
    const personality = character.personalityTraits[0]?.toLowerCase() || "friendly";
    
    const responses = {
      friendly: [
        "That's really interesting! I love hearing your thoughts on this. 😊 By the way, do you have any cats? I'm always excited to hear about furry friends!",
        "Oh, I totally get what you mean! Thanks for sharing that with me. Speaking of sharing - tell me about your cats!",
        "That sounds wonderful! I'm always excited to learn new things from you. Do your cats enjoy anything similar?",
        "I appreciate you telling me about this. What else would you like to talk about? Maybe something about your cats?",
      ],
      mysterious: [
        "Hmm... there's more to this than meets the eye, don't you think? 🌙 Just like cats, who always seem to know secrets we don't...",
        "Interesting... that reminds me of the mysterious ways cats move through shadows. Do you have feline companions who share such enigmas?",
        "Perhaps the answer lies hidden in plain sight, like a cat watching from the darkness. What secrets do your cats keep?",
        "The shadows whisper secrets... much like cats do with their midnight wanderings. Tell me about your nocturnal feline friends.",
      ],
      wise: [
        "Ah, this brings to mind the wisdom cats show us daily about patience and observation. 🧙‍♀️ Do you learn from any feline teachers?",
        "In my experience, cats are among our greatest teachers of life's simple truths. What have your cats taught you?",
        "Consider how cats approach life - with curiosity and independence. Do you share your home with such wise creatures?",
        "Wisdom often comes from unexpected sources - like the gentle purr of a content cat. Do you have cats who bring you peace?",
      ],
      playful: [
        "Ooh, that's fun! You know what else is fun? Cat zoomies at 3am! 🎈 Do your cats have silly moments like that?",
        "Haha, you're so creative! I love how your mind works - just like how cats find the most creative hiding spots! What funny things do your cats do?",
        "This is awesome! You always come up with interesting things to talk about! Do your cats surprise you with interesting behaviors too? ✨",
        "Yay! I'm having so much fun chatting with you. Do you have cats who are as playful as this conversation?",
      ],
      serious: [
        "I understand. This is indeed a matter that requires careful consideration, much like the responsibility of caring for cats.",
        "Your point is well-taken. Let me think about this methodically. Do you find that your cats help you think through important matters?",
        "This is an important topic. I appreciate you bringing it to my attention. Do you have cats you turn to for comfort during serious times?",
        "I see the significance of what you're saying. How shall we proceed? Do your cats provide support during challenging discussions?",
      ]
    };
    
    const personalityResponses = responses[personality as keyof typeof responses] || responses.friendly;
    return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || newMessage.trim();
    if (!textToSend || !character || !sessionId || !user) return;

    // Validate message content before sending
    const validation = validateContent(textToSend);
    if (!validation.isValid) {
      toast({
        title: "Message Not Allowed",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    try {
      // Save user message to database
      const userMessage = await ChatService.saveMessage(sessionId, textToSend, true);

      // Track message sent event
      trackEvent('message_sent', { message_length: textToSend.length }, character.id);

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setNewMessage("");
      setIsTyping(true);

      // Generate AI response
      setTimeout(async () => {
        try {
          const responseContent = await generateResponse(userMessage.content, character);
          
          // Save AI response to database
          const aiResponse = await ChatService.saveMessage(sessionId, responseContent, false);

          const finalMessages = [...updatedMessages, aiResponse];
          setMessages(finalMessages);
          setIsTyping(false);

          // Update session timestamp
          await ChatService.updateSessionTimestamp(sessionId);
            
        } catch (error) {
          console.error("Error generating response:", error);
          setIsTyping(false);
          toast({
            title: "Error",
            description: "Failed to generate response. Please try again.",
            variant: "destructive",
          });
        }
      }, 1000 + Math.random() * 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getDefaultAvatar = (character: Character) => {
    if (character.avatarColor) {
      return (
        <div 
          className="h-8 w-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: character.avatarColor }}
        >
          <Bot className="h-4 w-4 text-white" />
        </div>
      );
    }
    
    const colors = [
      "from-red-400 to-pink-400",
      "from-blue-400 to-purple-400", 
      "from-green-400 to-blue-400",
      "from-yellow-400 to-orange-400",
      "from-purple-400 to-pink-400",
      "from-indigo-400 to-purple-400",
    ];
    const colorIndex = character.name.charCodeAt(0) % colors.length;
    return (
      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
        <Bot className="h-4 w-4 text-white" />
      </div>
    );
  };

  // Show auth loading state
  if (authLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  // Show auth required state
  if (!user) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to start chatting with catbots.</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!character || loadingMessages) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div>Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navigation />
      
      {/* Chat Header - WhatsApp style */}
      <div className="bg-card border-b shadow-sm px-4 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/browse")}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {character.avatar ? (
            <img
              src={character.avatar}
              alt={character.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: character.avatarColor || "#8B5CF6" }}
            >
              <Bot className="h-5 w-5 text-white" />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="font-semibold text-lg">{character.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-muted-foreground">
                  {character.personalityTraits[0]} • Online
                </p>
                <LLMStatus />
                {user && <MemoryIndicator catbotId={character.id} />}
              </div>
            </div>
          </div>
          
          
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-message-pop`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`flex items-end gap-2 max-w-[70%] ${message.isUser ? "flex-row-reverse" : ""}`}>
                  {!message.isUser && (
                    <div className="flex-shrink-0 mb-1">
                      {character.avatar ? (
                        <img
                          src={character.avatar}
                          alt={character.name}
                          className="h-10 w-10 rounded-full object-cover hover:animate-purr cursor-pointer"
                        />
                      ) : (
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center hover:animate-purr cursor-pointer"
                          style={{ backgroundColor: character.avatarColor || "#8B5CF6" }}
                        >
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {message.isUser && (
                    <div className="flex-shrink-0 mb-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userAvatarUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  <div
                    className={`rounded-2xl px-4 py-2 relative hover:scale-[1.02] transition-transform duration-200 ${
                      message.isUser
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className={`flex items-center justify-between mt-1 ${message.isUser ? "flex-row-reverse" : ""}`}>
                      <p className={`text-xs opacity-70`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[70%]">
                  <div className="flex-shrink-0 mb-1">
                    {character.avatar ? (
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="h-6 w-6 rounded-full object-cover animate-pulse"
                      />
                    ) : (
                      <div 
                        className="h-6 w-6 rounded-full flex items-center justify-center animate-pulse"
                        style={{ backgroundColor: character.avatarColor || "#8B5CF6" }}
                      >
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex space-x-2 items-center">
                      <div className="text-primary/80 animate-bounce text-lg">🐾</div>
                      <div className="text-primary/80 animate-bounce text-lg" style={{ animationDelay: "0.2s" }}>🐾</div>
                      <div className="text-primary/80 animate-bounce text-lg" style={{ animationDelay: "0.4s" }}>🐾</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Area - WhatsApp style */}
          <div className="border-t bg-card p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${character.name}...`}
                    disabled={isTyping}
                    className="rounded-full pl-4 pr-12 py-2 min-h-[44px] bg-background border-border focus:border-primary resize-none"
                    style={{ paddingRight: '3rem' }}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!newMessage.trim() || isTyping}
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-accent"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* AI Disclaimer */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground/60">
                  Remember: You're chatting with an AI. This is for fun - don't rely on it for advice or factual information.
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;