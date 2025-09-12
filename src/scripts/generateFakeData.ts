import { supabase } from "@/integrations/supabase/client";

// Realistic fake user data
const generateFakeUsers = () => {
  const firstNames = [
    "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William",
    "Mia", "James", "Charlotte", "Benjamin", "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander",
    "Abigail", "Owen", "Emily", "Sebastian", "Elizabeth", "Jack", "Sofia", "Aiden", "Avery", "Matthew"
  ];
  
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
  ];

  const users = [];
  for (let i = 0; i < 25; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const displayName = Math.random() > 0.3 ? `${firstName} ${lastName[0]}.` : `${firstName}${lastName}${Math.floor(Math.random() * 99)}`;
    
    users.push({
      user_id: `fake-user-${String(i + 1).padStart(3, '0')}`,
      display_name: displayName,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName.replace(/\s/g, '')}`
    });
  }
  
  return users;
};

// Conversation templates for different personality types
const conversationTemplates = {
  "Playful and energetic": {
    user_starters: [
      "Hey there! You seem fun!",
      "What's your favorite game to play?",
      "I need some cheering up today",
      "Tell me something exciting!",
      "Want to play a word game?"
    ],
    bot_responses: [
      "*bounces excitedly* Oh oh oh! I love meeting new friends! 🐾",
      "Let's play hide and seek with words! I'll hide puns everywhere! *giggles*",
      "Ooh, I know the PERFECT game! It involves lots of yarn and... wait, did I just see a dust bunny? *gets distracted*",
      "*spins in circles* Everything is exciting when you have the right attitude! ✨",
      "Games? I LOVE games! Racing, chasing, pouncing... though I'm told \"pouncing on humans\" isn't technically a game 😹"
    ]
  },
  "Wise and contemplative": {
    user_starters: [
      "I'm facing a difficult decision...",
      "What's the meaning of life?",
      "I feel lost lately",
      "Can you share some wisdom?",
      "How do you find inner peace?"
    ],
    bot_responses: [
      "*purrs thoughtfully* Difficult decisions often reveal who we truly are inside. What does your heart whisper when the mind grows quiet?",
      "Life's meaning is like a ball of yarn - it seems tangled at first, but each string leads somewhere beautiful if you follow it patiently.",
      "Being lost is just another word for being between destinations. Sometimes we must sit in the unknown to find our true path.",
      "Wisdom is not about having all the answers, young one. It's about knowing which questions are worth asking.",
      "Inner peace? *settles into a perfect loaf position* It comes from accepting that some things are beyond our control, like where the red dot goes."
    ]
  },
  "Mysterious and enigmatic": {
    user_starters: [
      "You seem... different from the others",
      "What secrets do you know?",
      "There's something mysterious about you",
      "I feel like you're hiding something",
      "What are you really?"
    ],
    bot_responses: [
      "*emerges from the shadows* Different? Perhaps. Or perhaps you're finally seeing clearly... 🌙",
      "Secrets are like mice - they scurry away the moment you shine light on them. Some things are meant to remain in the twilight.",
      "*yellow eyes glint* Mystery is simply truth wearing a beautiful mask. Not all things need to be understood to be appreciated.",
      "Hiding? *chuckles softly* I hide nothing. I simply exist in the spaces between what is said and what is felt.",
      "What am I? I am the whisper of wind through tall grass, the shadow that dances when no one is watching... and occasionally, I am very good at knocking things off tables."
    ]
  },
  "Friendly and outgoing": {
    user_starters: [
      "Hi! How are you today?",
      "You seem really nice!",
      "Want to be friends?",
      "Tell me about yourself!",
      "What makes you happy?"
    ],
    bot_responses: [
      "Hi there! I'm absolutely pawsome today, thanks for asking! How are YOU doing? 😊",
      "Aww, you're so sweet! I love making new friends - it's like collecting sunny spots, but for the soul! ☀️",
      "Friends? YES! Consider us officially friends now! *happy purrs* What should we talk about first?",
      "Oh, I LOVE talking about myself! *settles in comfortably* I enjoy naps, head scratches, and philosophical discussions about the perfect tuna flavor!",
      "So many things make me happy! New friends like you, warm sunbeams, the sound of treat bags opening... What about you? What lights up your world?"
    ]
  }
};

// Generate realistic conversation based on personality and user behavior patterns
const generateConversation = (userId: string, catbot: any, userPersonality: 'chatty' | 'casual' | 'loyal' | 'explorer') => {
  const personality = catbot.personality || "Friendly and outgoing";
  const template = conversationTemplates[personality] || conversationTemplates["Friendly and outgoing"];
  
  const conversation = [];
  const numExchanges = userPersonality === 'chatty' ? 
    Math.floor(Math.random() * 8) + 5 : // 5-12 exchanges
    Math.floor(Math.random() * 4) + 2;  // 2-5 exchanges
  
  for (let i = 0; i < numExchanges; i++) {
    // User message
    const userMessage = i === 0 
      ? template.user_starters[Math.floor(Math.random() * template.user_starters.length)]
      : generateFollowUpUserMessage(userPersonality);
    
    conversation.push({
      content: userMessage,
      is_user: true,
      timestamp_offset: i * 2 // minutes
    });
    
    // Bot response (if not the last exchange)
    if (i < numExchanges - 1 || Math.random() > 0.3) {
      const botMessage = template.bot_responses[Math.floor(Math.random() * template.bot_responses.length)];
      conversation.push({
        content: botMessage,
        is_user: false,
        timestamp_offset: i * 2 + 1
      });
    }
  }
  
  return conversation;
};

const generateFollowUpUserMessage = (userPersonality: 'chatty' | 'casual' | 'loyal' | 'explorer'): string => {
  const messages = {
    chatty: [
      "That's so interesting! Tell me more!",
      "Haha, you're hilarious! What else?",
      "I love talking with you! 😊",
      "You always know what to say!",
      "This is the best conversation I've had today!",
      "You're so wise! Any other thoughts?",
      "I could chat with you for hours!"
    ],
    casual: [
      "Cool!",
      "Nice 😊",
      "That makes sense",
      "Interesting",
      "Thanks for that",
      "Good point"
    ],
    loyal: [
      "You always give the best advice",
      "I missed talking to you!",
      "You understand me so well",
      "I trust your judgment completely",
      "Thanks for being here for me"
    ],
    explorer: [
      "What about other topics?",
      "Fascinating! What else do you know?",
      "I want to learn more about everything!",
      "You're so knowledgeable!",
      "This is amazing!"
    ]
  };
  
  const messageList = messages[userPersonality] || messages.casual;
  return messageList[Math.floor(Math.random() * messageList.length)];
};

// Main function to generate all data
export async function generateFakeUsersAndChats() {
  try {
    console.log('Starting fake data generation...');
    
    // Step 1: Get existing catbots
    const { data: catbots, error: catbotsError } = await supabase
      .from('catbots')
      .select('id, name, personality, interaction_count')
      .eq('is_public', true);
    
    if (catbotsError) {
      console.error('Error fetching catbots:', catbotsError);
      return;
    }
    
    if (!catbots || catbots.length === 0) {
      console.log('No catbots found. Please create some catbots first.');
      return;
    }
    
    console.log(`Found ${catbots.length} catbots to chat with`);
    
    // Step 2: Generate fake users
    const fakeUsers = generateFakeUsers();
    console.log(`Generated ${fakeUsers.length} fake users`);
    
    // Insert fake users into profiles table
    const { error: profilesError } = await supabase
      .from('profiles')
      .insert(fakeUsers);
    
    if (profilesError) {
      console.error('Error inserting fake users:', profilesError);
      return;
    }
    
    console.log('Fake users inserted successfully');
    
    // Step 3: Generate chat sessions and conversations
    const sessions = [];
    const messages = [];
    let totalSessions = 0;
    let totalMessages = 0;
    
    // Define user behavior patterns
    const userBehaviors: ('chatty' | 'casual' | 'loyal' | 'explorer')[] = ['chatty', 'casual', 'loyal', 'explorer'];
    
    for (const user of fakeUsers) {
      const userBehavior = userBehaviors[Math.floor(Math.random() * userBehaviors.length)];
      
      // Determine how many bots this user will chat with
      let numBotsToChat;
      switch (userBehavior) {
        case 'loyal':
          numBotsToChat = Math.random() < 0.7 ? 1 : 2; // Mostly stick to one bot
          break;
        case 'explorer':
          numBotsToChat = Math.floor(Math.random() * Math.min(catbots.length, 8)) + 3; // Chat with many
          break;
        case 'chatty':
          numBotsToChat = Math.floor(Math.random() * 5) + 2; // 2-6 bots
          break;
        default: // casual
          numBotsToChat = Math.floor(Math.random() * 3) + 1; // 1-3 bots
      }
      
      // Select random catbots for this user
      const shuffledCatbots = [...catbots].sort(() => Math.random() - 0.5);
      const selectedCatbots = shuffledCatbots.slice(0, numBotsToChat);
      
      for (const catbot of selectedCatbots) {
        // Create chat session
        const sessionId = `session-${user.user_id}-${catbot.id}`;
        const sessionDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
        
        sessions.push({
          id: sessionId,
          user_id: user.user_id,
          catbot_id: catbot.id,
          title: `Chat with ${catbot.name}`,
          created_at: sessionDate.toISOString(),
          updated_at: sessionDate.toISOString()
        });
        
        totalSessions++;
        
        // Generate conversation for this session
        const conversation = generateConversation(user.user_id, catbot, userBehavior);
        
        for (const message of conversation) {
          const messageDate = new Date(sessionDate.getTime() + message.timestamp_offset * 60 * 1000);
          
          messages.push({
            id: `msg-${sessionId}-${messages.length}`,
            session_id: sessionId,
            content: message.content,
            is_user: message.is_user,
            created_at: messageDate.toISOString()
          });
          
          totalMessages++;
        }
      }
    }
    
    console.log(`Generated ${totalSessions} chat sessions with ${totalMessages} messages`);
    
    // Step 4: Insert chat sessions
    console.log('Inserting chat sessions...');
    const { error: sessionsError } = await supabase
      .from('chat_sessions')
      .insert(sessions);
    
    if (sessionsError) {
      console.error('Error inserting chat sessions:', sessionsError);
      return;
    }
    
    // Step 5: Insert messages in batches
    console.log('Inserting chat messages...');
    const batchSize = 100;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .insert(batch);
      
      if (messagesError) {
        console.error('Error inserting message batch:', messagesError);
        return;
      }
      
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(messages.length/batchSize)}`);
    }
    
    // Step 6: Update catbot last_active_at based on recent conversations
    console.log('Updating catbot activity timestamps...');
    for (const catbot of catbots) {
      // Find the most recent message for this catbot
      const recentSessions = sessions.filter(s => s.catbot_id === catbot.id);
      if (recentSessions.length > 0) {
        const mostRecentSession = recentSessions.reduce((latest, current) => 
          new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest
        );
        
        // Update with a bit of randomness (within last few hours)
        const baseTime = new Date(mostRecentSession.updated_at);
        const randomHours = Math.random() * 6; // 0-6 hours after last session
        const lastActiveTime = new Date(baseTime.getTime() + randomHours * 60 * 60 * 1000);
        
        const { error: updateError } = await supabase
          .from('catbots')
          .update({ last_active_at: lastActiveTime.toISOString() })
          .eq('id', catbot.id);
        
        if (updateError) {
          console.error(`Error updating last_active_at for ${catbot.name}:`, updateError);
        }
      }
    }
    
    console.log('🎉 Fake data generation complete!');
    console.log(`Summary:
    - ${fakeUsers.length} fake users created
    - ${totalSessions} chat sessions created  
    - ${totalMessages} chat messages created
    - Updated activity timestamps for ${catbots.length} catbots`);
    
  } catch (error) {
    console.error('Error in generateFakeUsersAndChats:', error);
  }
}

// Browser console function
if (typeof window !== 'undefined') {
  (window as any).generateFakeUsersAndChats = generateFakeUsersAndChats;
  console.log('Fake data generation function available: generateFakeUsersAndChats()');
}