import { Bot } from "lucide-react";

/**
 * Renders a catbot avatar - either an uploaded image or a default colored icon
 */
interface CatbotAvatarProps {
  avatarUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CatbotAvatar = ({ 
  avatarUrl, 
  name, 
  size = 'md', 
  className = '' 
}: CatbotAvatarProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={`${name} avatar`} 
        className={`${sizeClasses[size]} rounded-lg object-cover shadow-soft animate-pulse hover:animate-purr cursor-pointer transition-transform duration-300 hover:scale-105 ${className}`}
        style={{ animationDuration: '3s' }}
      />
    );
  }

  // Always use orange gradient for all default icons
  const orangeGradient = "from-orange-400 to-orange-500";

  return (
    <div 
      className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br ${orangeGradient} flex items-center justify-center shadow-soft animate-pulse hover:animate-purr cursor-pointer transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ animationDuration: '3s' }}
    >
      <Bot className={`${iconSizes[size]} text-white`} />
    </div>
  );
};