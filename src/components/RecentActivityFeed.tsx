import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, TrendingUp, Users, Sparkles } from "lucide-react";

interface ActivityItem {
  id: string;
  text: string;
  timeAgo: string;
  type: 'chat' | 'milestone';
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  onlineCount: number;
}

export const RecentActivityFeed = ({ activities, onlineCount }: RecentActivityFeedProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {onlineCount} online
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity, index) => (
          <div 
            key={activity.id} 
            className="flex items-start gap-3 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              activity.type === 'milestone' 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-400' 
                : 'bg-gradient-to-br from-primary/20 to-accent/20'
            }`}>
              {activity.type === 'milestone' ? (
                <Sparkles className="h-4 w-4 text-white" />
              ) : (
                <MessageCircle className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-relaxed">
                {activity.text}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activity.timeAgo}
              </p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};