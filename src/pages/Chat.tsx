import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import LLMStatus from "@/components/LLMStatus";
import { Bot, Send, ArrowLeft, User, MoreVertical, Brain } from "lucide-react";
import { Character, ChatMessage, ChatSession } from "@/types/character";
import { storageService } from "@/lib/storage";
import { localLLM } from "@/services/localLLM";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!characterId) return;
    
    const loadCharacter = async () => {
      // First try to get from local storage (for locally created characters)
      let char = storageService.getCharacter(characterId);
      
      // If not found locally, try to fetch from Supabase (for public catbots)
      if (!char) {
        try {
          const { data, error } = await supabase
            .from('catbots')
            .select('*')
            .eq('id', characterId)
            .single();
          
          if (error) throw error;
          
          if (data) {
            // Convert Supabase catbot to Character format
            char = {
              id: data.id,
              name: data.name,
              publicProfile: data.public_profile || '',
              trainingDescription: data.training_description || '',
              personalityTraits: data.personality ? [data.personality] : ['friendly'],
              avatar: data.avatar_url || undefined,
              createdAt: new Date(data.created_at),
            };
          }
        } catch (error) {
          console.error('Error fetching catbot:', error);
        }
      }
      
      if (!char) {
        toast({
          title: "Character Not Found",
          description: "The character you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate("/browse");
        return;
      }
      
      setCharacter(char);
      
      // Load existing chat session or create initial message
      const existingSession = storageService.getChatSession(characterId);
      if (existingSession) {
        setMessages(existingSession.messages);
      } else {
        // Create personality-specific opening message
        const personality = char.personalityTraits[0]?.toLowerCase() || "friendly";
        
        const openingMessages = {
          playful: `Hello! I'm ${char.name}. ${char.publicProfile}. How is your day going?`,
          wise: `Hello! I'm ${char.name}. ${char.publicProfile}. How is your day going?`,
          friendly: `Hello! I'm ${char.name}. ${char.publicProfile}. How is your day going?`,
          mysterious: `Hello! I'm ${char.name}. ${char.publicProfile}. How is your day going?`,
          serious: `Hello! I'm ${char.name}. ${char.publicProfile}. How is your day going?`
        };
        
        const openingContent = openingMessages[personality] || openingMessages.friendly;
        
        const greeting: ChatMessage = {
          id: crypto.randomUUID(),
          content: openingContent,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([greeting]);
      }
    };
    
    loadCharacter();
  }, [characterId, navigate, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateResponse = async (userMessage: string, character: Character): Promise<string> => {
    // Get conversation history for context (last 20 messages)
    const conversationHistory = messages.slice(-20).map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }));

    try {
      if (localLLM.isReady()) {
        return await localLLM.generateResponse(character.id, userMessage, conversationHistory);
      }
    } catch (error) {
      console.error("LLM generation failed, using fallback:", error);
    }

    // Fallback to simple responses if LLM not available
    const personality = character.personalityTraits[0]?.toLowerCase() || "friendly";
    
    const responses = {
      friendly: [
        "That's really interesting! I love hearing your thoughts on this. 😊",
        "Oh, I totally get what you mean! Thanks for sharing that with me.",
        "That sounds wonderful! I'm always excited to learn new things from you.",
        "I appreciate you telling me about this. What else would you like to talk about?",
      ],
      mysterious: [
        "Hmm... there's more to this than meets the eye, don't you think? 🌙",
        "Interesting... that reminds me of something I once discovered in an old tome.",
        "Perhaps the answer lies hidden in plain sight. What do you truly see?",
        "The shadows whisper secrets... but are you ready to hear them?",
      ],
      wise: [
        "Ah, this brings to mind an ancient saying: 'Knowledge is the light that guides us.' 🧙‍♀️",
        "In my experience, the most profound truths are often the simplest ones.",
        "Consider this perspective: every question contains the seeds of its own answer.",
        "Wisdom comes not from having all the answers, but from asking the right questions.",
      ],
      playful: [
        "Ooh, that's fun! You know what we should do next? Let's explore this idea more! 🎈",
        "Haha, you're so creative! I love how your mind works. What other ideas do you have?",
        "This is awesome! You always come up with the most interesting things to talk about! ✨",
        "Yay! I'm having so much fun chatting with you. Tell me more, tell me more!",
      ],
      serious: [
        "I understand. This is indeed a matter that requires careful consideration.",
        "Your point is well-taken. Let me think about this methodically.",
        "This is an important topic. I appreciate you bringing it to my attention.",
        "I see the significance of what you're saying. How shall we proceed?",
      ]
    };
    
    const personalityResponses = responses[personality as keyof typeof responses] || responses.friendly;
    return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !character) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: newMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage("");
    setIsTyping(true);

    // Generate AI response
    setTimeout(async () => {
      try {
        const responseContent = await generateResponse(userMessage.content, character);
        
        const aiResponse: ChatMessage = {
          id: crypto.randomUUID(),
          content: responseContent,
          isUser: false,
          timestamp: new Date(),
        };

        const finalMessages = [...updatedMessages, aiResponse];
        setMessages(finalMessages);
        setIsTyping(false);

        // Save chat session
        const session: ChatSession = {
          id: character.id,
          characterId: character.id,
          messages: finalMessages,
          createdAt: new Date(),
        };
        storageService.saveChatSession(session);
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

  if (!character) {
    return <div>Loading...</div>;
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
              <p className="text-sm text-muted-foreground">
                {character.personalityTraits[0]} • Online
              </p>
              <LLMStatus />
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
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end gap-2 max-w-[70%] ${message.isUser ? "flex-row-reverse" : ""}`}>
                  {!message.isUser && (
                    <div className="flex-shrink-0 mb-1">
                      {character.avatar ? (
                        <img
                          src={character.avatar}
                          alt={character.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className="h-6 w-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: character.avatarColor || "#8B5CF6" }}
                        >
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div
                    className={`rounded-2xl px-4 py-2 relative ${
                      message.isUser
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70 ${message.isUser ? "text-right" : ""}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
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
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="h-6 w-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: character.avatarColor || "#8B5CF6" }}
                      >
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
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
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isTyping}
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-accent"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;