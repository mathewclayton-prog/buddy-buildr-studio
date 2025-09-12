import { supabase } from "@/integrations/supabase/client";

// Get recent conversations for testimonials and activity feed
export async function getRecentConversations(limit: number = 10) {
  try {
    // First get recent chat sessions with catbot info
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        user_id,
        catbots (
          name,
          avatar_url
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(limit * 2);
    
    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return [];
    }

    // Then get user profiles separately
    const userIds = sessions?.map(s => s.user_id) || [];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // Get recent messages from these sessions
    const sessionIds = sessions?.map(s => s.id) || [];
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('content, is_user, created_at, session_id')
      .in('session_id', sessionIds)
      .eq('is_user', true)
      .order('created_at', { ascending: false })
      .limit(limit * 3);

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return [];
    }

    // Combine the data
    const userMessages = messages
      ?.filter(msg => 
        msg.content.length > 10 && 
        msg.content.length < 200 &&
        !msg.content.toLowerCase().includes('hi') &&
        !msg.content.toLowerCase().includes('hello')
      )
      .slice(0, limit)
      .map(msg => {
        const session = sessions?.find(s => s.id === msg.session_id);
        const profile = profiles?.find(p => p.user_id === session?.user_id);
        
        return {
          content: msg.content,
          userName: profile?.display_name || 'Anonymous',
          catbotName: session?.catbots?.name || 'Unknown',
          timestamp: msg.created_at
        };
      }) || [];
    
    return userMessages;
  } catch (error) {
    console.error('Error in getRecentConversations:', error);
    return [];
  }
}

// Get conversation samples for specific catbots (for preview cards)
export async function getCatbotConversationSamples(catbotId: string, limit: number = 3) {
  try {
    // Get chat sessions for this catbot
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('id, user_id')
      .eq('catbot_id', catbotId)
      .limit(20);
    
    if (sessionsError || !sessions?.length) {
      return [];
    }

    // Get user profiles
    const userIds = sessions.map(s => s.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);

    // Get messages from these sessions
    const sessionIds = sessions.map(s => s.id);
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('content, is_user, created_at, session_id')
      .in('session_id', sessionIds)
      .eq('is_user', true)
      .order('created_at', { ascending: false })
      .limit(limit * 3);
    
    if (messagesError) {
      return [];
    }
    
    // Filter for interesting messages
    const samples = messages
      ?.filter(msg => 
        msg.content.length > 15 && 
        msg.content.length < 150 &&
        !msg.content.toLowerCase().startsWith('hi') &&
        !msg.content.toLowerCase().startsWith('hello')
      )
      .slice(0, limit)
      .map(msg => {
        const session = sessions.find(s => s.id === msg.session_id);
        const profile = profiles?.find(p => p.user_id === session?.user_id);
        
        return {
          content: msg.content,
          userName: profile?.display_name || 'Someone',
          timestamp: msg.created_at
        };
      }) || [];
    
    return samples;
  } catch (error) {
    console.error('Error in getCatbotConversationSamples:', error);
    return [];
  }
}

// Generate testimonial-style activity from conversations
export const generateConversationActivity = (conversations: any[]) => {
  return conversations.map((conv, index) => ({
    id: `conv-activity-${index}`,
    text: `"${conv.content}" - ${conv.userName} chatting with ${conv.catbotName}`,
    timeAgo: formatTimeAgo(conv.timestamp),
    type: 'testimonial' as const
  }));
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
};

// Get chat statistics for a catbot
export async function getChatStats(catbotId: string) {
  try {
    const { data: sessionCount, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('catbot_id', catbotId);
    
    const { data: messageCount, error: messageError } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .in('session_id', (await supabase
        .from('chat_sessions')
        .select('id')
        .eq('catbot_id', catbotId)
      ).data?.map(s => s.id) || []);
    
    if (sessionError || messageError) {
      console.error('Error fetching chat stats:', sessionError || messageError);
      return { sessions: 0, messages: 0 };
    }
    
    return {
      sessions: sessionCount || 0,
      messages: messageCount || 0
    };
  } catch (error) {
    console.error('Error in getChatStats:', error);
    return { sessions: 0, messages: 0 };
  }
}

// Browser console functions for testing
if (typeof window !== 'undefined') {
  (window as any).getRecentConversations = getRecentConversations;
  (window as any).getCatbotConversationSamples = getCatbotConversationSamples;
  (window as any).getChatStats = getChatStats;
  console.log('Conversation query functions available:');
  console.log('- getRecentConversations(limit)');
  console.log('- getCatbotConversationSamples(catbotId, limit)');
  console.log('- getChatStats(catbotId)');
}