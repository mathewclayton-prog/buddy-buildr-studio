import { supabase } from "@/integrations/supabase/client";

interface CatbotWithFactors {
  id: string;
  name: string;
  public_profile: string | null;
  personality: string | null;
  created_at: string;
  current_interaction_count?: number;
}

// Calculate interaction count based on various factors
function calculateInteractionCount(catbot: CatbotWithFactors): number {
  const now = new Date();
  const createdAt = new Date(catbot.created_at);
  const daysOld = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  // Base factor from age (older bots have more interactions)
  const ageFactor = Math.min(daysOld * 3, 500); // Max 500 from age
  
  // Quality factor based on public profile length and content
  let qualityFactor = 0;
  if (catbot.public_profile) {
    const profileLength = catbot.public_profile.length;
    const hasGoodLength = profileLength >= 150 && profileLength <= 250;
    const hasEngagingWords = /\b(magical|mysterious|wise|adventure|legendary|skilled|expert|amazing|brilliant|charming)\b/i.test(catbot.public_profile);
    
    qualityFactor = hasGoodLength ? 100 : 50;
    qualityFactor += hasEngagingWords ? 100 : 0;
  }
  
  // Personality factor (some personalities are more popular)
  const popularPersonalities = [
    "Playful and energetic",
    "Friendly and outgoing", 
    "Witty and sarcastic",
    "Bold and adventurous"
  ];
  
  const personalityFactor = popularPersonalities.includes(catbot.personality || '') ? 150 : 75;
  
  // Random variance factor (±200)
  const randomFactor = Math.floor(Math.random() * 400) - 200;
  
  // Calculate total with weights
  const baseCount = ageFactor + qualityFactor + personalityFactor + randomFactor;
  
  // Ensure realistic range (0-3000, but most in 100-800 range)
  const finalCount = Math.max(0, Math.min(3000, baseCount));
  
  // Apply probability curve to favor 100-800 range
  if (finalCount > 800) {
    const reduction = Math.random() * 0.7; // 70% chance to reduce high counts
    if (reduction > 0.3) {
      return Math.floor(100 + Math.random() * 700); // Force into preferred range
    }
  }
  
  return Math.floor(finalCount);
}

// Calculate daily increase for existing interaction counts
function calculateDailyIncrease(currentCount: number): number {
  // More popular bots (higher counts) get more daily interactions
  const baseIncrease = Math.floor(currentCount / 100); // 1% of current count
  const randomIncrease = Math.floor(Math.random() * 10); // 0-9 random
  const totalIncrease = Math.max(1, baseIncrease + randomIncrease); // Minimum 1
  
  return Math.min(totalIncrease, 50); // Cap at 50 per day
}

export async function assignInteractionCounts() {
  try {
    console.log('Fetching all catbots...');
    
    const { data: catbots, error } = await supabase
      .from('catbots')
      .select('id, name, public_profile, personality, created_at, interaction_count');
    
    if (error) {
      console.error('Error fetching catbots:', error);
      return;
    }
    
    if (!catbots || catbots.length === 0) {
      console.log('No catbots found');
      return;
    }
    
    console.log(`Processing ${catbots.length} catbots...`);
    
    // Calculate interaction counts for all catbots
    const updates = catbots.map(catbot => {
      const interactionCount = calculateInteractionCount({
        ...catbot,
        current_interaction_count: catbot.interaction_count || 0
      });
      
      return {
        id: catbot.id,
        interaction_count: interactionCount
      };
    });
    
    // Batch update all catbots
    console.log('Updating interaction counts...');
    
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('catbots')
        .update({ interaction_count: update.interaction_count })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`Error updating catbot ${update.id}:`, updateError);
      }
    }
    
    console.log('Successfully assigned interaction counts to all catbots!');
    
    // Log some statistics
    const counts = updates.map(u => u.interaction_count);
    const avg = Math.floor(counts.reduce((a, b) => a + b, 0) / counts.length);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    
    console.log(`Statistics - Average: ${avg}, Max: ${max}, Min: ${min}`);
    
  } catch (error) {
    console.error('Error in assignInteractionCounts:', error);
  }
}

export async function updateDailyInteractions() {
  try {
    console.log('Starting daily interaction count update...');
    
    const { data: catbots, error } = await supabase
      .from('catbots')
      .select('id, interaction_count');
    
    if (error) {
      console.error('Error fetching catbots for daily update:', error);
      return;
    }
    
    if (!catbots || catbots.length === 0) {
      console.log('No catbots found for daily update');
      return;
    }
    
    // Update each catbot with daily increase
    const updates = catbots.map(catbot => {
      const currentCount = catbot.interaction_count || 0;
      const dailyIncrease = calculateDailyIncrease(currentCount);
      
      return {
        id: catbot.id,
        interaction_count: currentCount + dailyIncrease
      };
    });
    
    // Batch update
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('catbots')
        .update({ interaction_count: update.interaction_count })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`Error updating daily count for catbot ${update.id}:`, updateError);
      }
    }
    
    const totalIncrease = updates.reduce((sum, u, i) => sum + (u.interaction_count - (catbots[i].interaction_count || 0)), 0);
    console.log(`Daily update complete! Added ${totalIncrease} total interactions across ${catbots.length} catbots.`);
    
  } catch (error) {
    console.error('Error in updateDailyInteractions:', error);
  }
}

// Browser console functions
if (typeof window !== 'undefined') {
  (window as any).assignInteractionCounts = assignInteractionCounts;
  (window as any).updateDailyInteractions = updateDailyInteractions;
  console.log('Interaction count functions available:');
  console.log('- assignInteractionCounts() - Initial assignment based on factors');
  console.log('- updateDailyInteractions() - Daily increase simulation');
}