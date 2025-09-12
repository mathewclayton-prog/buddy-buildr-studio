import { formatDistanceToNow } from "date-fns";

// Helper functions for activity features
export const getActivityStatus = (lastActiveAt: string): string => {
  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 5) {
    return "Active now";
  } else if (diffInMinutes < 60) {
    return `Active ${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `Active ${hours}h ago`;
  } else {
    return `Active ${formatDistanceToNow(lastActive, { addSuffix: true })}`;
  }
};

export const isTrending = (interactionCount: number, allCounts: number[]): boolean => {
  if (allCounts.length === 0) return false;
  const sortedCounts = [...allCounts].sort((a, b) => b - a);
  const top20PercentIndex = Math.floor(sortedCounts.length * 0.2);
  const threshold = sortedCounts[top20PercentIndex] || 0;
  return interactionCount >= threshold && interactionCount > 100; // Minimum threshold for trending
};

export const isNew = (createdAt: string): boolean => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays <= 7;
};

export const getRandomOnlineCount = (): number => {
  return Math.floor(Math.random() * 14) + 2; // 2-15 people
};

// Generate fake activity feed items
export const generateActivityFeed = (characters: { id: string; name: string; interaction_count: number }[]) => {
  const activities = [];
  const userNames = [
    "Alex", "Sarah", "Mike", "Emma", "David", "Luna", "Chris", "Maya", 
    "Someone", "A cat lover", "New user", "Visitor"
  ];
  
  const activityTypes = [
    "just started chatting with",
    "discovered",
    "is having a great conversation with",
    "just found"
  ];

  // Add recent chat activities
  for (let i = 0; i < Math.min(8, characters.length); i++) {
    const character = characters[Math.floor(Math.random() * characters.length)];
    const userName = userNames[Math.floor(Math.random() * userNames.length)];
    const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const timeAgo = Math.floor(Math.random() * 30) + 1; // 1-30 minutes ago
    
    activities.push({
      id: `activity-${i}`,
      text: `${userName} ${activity} ${character.name}`,
      timeAgo: `${timeAgo}m ago`,
      type: 'chat' as const
    });
  }

  // Add milestone activities for high interaction counts
  const highInteractionBots = characters.filter(c => c.interaction_count > 400);
  for (let i = 0; i < Math.min(3, highInteractionBots.length); i++) {
    const character = highInteractionBots[i];
    const milestone = Math.floor(character.interaction_count / 100) * 100;
    if (milestone >= 500) {
      activities.push({
        id: `milestone-${i}`,
        text: `${character.name} just hit ${milestone} conversations! 🎉`,
        timeAgo: `${Math.floor(Math.random() * 120) + 10}m ago`,
        type: 'milestone' as const
      });
    }
  }

  // Shuffle and return top 10
  return activities.sort(() => Math.random() - 0.5).slice(0, 10);
};