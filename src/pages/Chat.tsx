import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Bot, Send, ArrowLeft, User } from "lucide-react";
import { Character, ChatMessage, ChatSession } from "@/types/character";
import { storageService } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

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
    
    const char = storageService.getCharacter(characterId);
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
      // Create initial greeting message
      const greeting: ChatMessage = {
        id: crypto.randomUUID(),
        content: `Hello! I'm ${char.name}. ${char.description.split('.')[0]}. How can I help you today?`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [characterId, navigate, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateResponse = (userMessage: string, character: Character): string => {
    const responses = [
      `As someone who is ${character.personalityTraits.join(", ")}, I find that interesting. ${character.description.includes("wise") || character.personalityTraits.includes("wise") ? "Let me share some wisdom with you." : "Tell me more about that."}`,
      `That's fascinating! Given my nature as ${character.personalityTraits[0] || "someone unique"}, I'd say ${userMessage.toLowerCase().includes("what") ? "that's a great question" : "I can relate to that"}.`,
      `*reflects on what you said* Being ${character.personalityTraits.slice(0, 2).join(" and ")}, I think ${userMessage.toLowerCase().includes("how") ? "there are many ways to approach this" : "perspective is everything"}.`,
      `Interesting perspective! ${character.description.split('.')[0] || "As myself"}, I often think about similar things. What inspired you to ask about this?`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: crypto.randomUUID(),
        content: generateResponse(userMessage.content, character),
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
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getDefaultAvatar = (name: string) => {
    const colors = [
      "from-red-400 to-pink-400",
      "from-blue-400 to-purple-400",
      "from-green-400 to-blue-400",
      "from-yellow-400 to-orange-400",
      "from-purple-400 to-pink-400",
      "from-indigo-400 to-purple-400",
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  if (!character) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Character Header */}
        <Card className="mb-6 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/browse")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                {character.avatar ? (
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="h-12 w-12 rounded-full object-cover shadow-soft"
                  />
                ) : (
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getDefaultAvatar(character.name)} flex items-center justify-center`}>
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                )}
                
                <div>
                  <CardTitle className="text-xl">{character.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {character.description.slice(0, 100)}...
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {character.personalityTraits.slice(0, 3).map((trait) => (
                  <Badge key={trait} variant="secondary" className="text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <div className="flex flex-col h-[60vh]">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start gap-3 max-w-[70%] ${message.isUser ? "flex-row-reverse" : ""}`}>
                  <div className="flex-shrink-0">
                    {message.isUser ? (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    ) : character.avatar ? (
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getDefaultAvatar(character.name)} flex items-center justify-center`}>
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
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
                <div className="flex items-start gap-3 max-w-[70%]">
                  <div className="flex-shrink-0">
                    {character.avatar ? (
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getDefaultAvatar(character.name)} flex items-center justify-center`}>
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Type a message to ${character.name}...`}
              disabled={isTyping}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isTyping}
              size="icon"
              variant="chat"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;