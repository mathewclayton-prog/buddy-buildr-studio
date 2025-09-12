import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Bot, TrendingUp, Clock, Star } from "lucide-react";

interface PlatformStatsProps {
  totalUsers: number;
  totalConversations: number;
  totalCatbots: number;
  activeNow: number;
}

export const PlatformStats = ({ totalUsers, totalConversations, totalCatbots, activeNow }: PlatformStatsProps) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-6 mb-12 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Join our Growing Community! 🌟
        </h2>
        <p className="text-lg text-muted-foreground">
          Connect with amazing AI cats and fellow cat lovers
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-full mx-auto mb-2">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600">
            {formatNumber(totalUsers)}
          </div>
          <div className="text-sm text-muted-foreground">Happy Users</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full mx-auto mb-2">
            <MessageCircle className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-green-600">
            {formatNumber(totalConversations)}
          </div>
          <div className="text-sm text-muted-foreground">Conversations</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-full mx-auto mb-2">
            <Bot className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-purple-600">
            {formatNumber(totalCatbots)}
          </div>
          <div className="text-sm text-muted-foreground">Unique Catbots</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-500/10 rounded-full mx-auto mb-2 relative">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-orange-600">
            {activeNow}
          </div>
          <div className="text-sm text-muted-foreground">Chatting Now</div>
        </div>
      </div>
    </div>
  );
};