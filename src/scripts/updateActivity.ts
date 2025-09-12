import { supabase } from "@/integrations/supabase/client";
import { getRandomOnlineCount } from "@/lib/activityHelpers";

// Function to update last_active_at with random recent times
export async function updateRandomLastActive() {
  try {
    console.log('Updating random last active timestamps...');
    
    const { data: catbots, error } = await supabase
      .from('catbots')
      .select('id, interaction_count, created_at');
    
    if (error) {
      console.error('Error fetching catbots:', error);
      return;
    }
    
    if (!catbots || catbots.length === 0) {
      console.log('No catbots found');
      return;
    }
    
    let totalUpdated = 0;
    
    // Update each catbot with realistic recent activity
    for (const catbot of catbots) {
      // More popular bots are more likely to be recently active
      const popularityFactor = Math.min(catbot.interaction_count / 100, 10);
      const baseChance = 0.7 + (popularityFactor * 0.03); // 70-100% chance
      
      if (Math.random() < baseChance) {
        // Generate random time within last few hours to days
        const now = new Date();
        const hoursAgo = Math.random() * 72; // 0-72 hours ago
        const randomActiveTime = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
        
        const { error: updateError } = await supabase
          .from('catbots')
          .update({ last_active_at: randomActiveTime.toISOString() })
          .eq('id', catbot.id);
        
        if (updateError) {
          console.error(`Error updating catbot ${catbot.id}:`, updateError);
        } else {
          totalUpdated++;
        }
      }
    }
    
    console.log(`Updated ${totalUpdated} catbots with random activity times`);
    
  } catch (error) {
    console.error('Error in updateRandomLastActive:', error);
  }
}

// Browser console functions
if (typeof window !== 'undefined') {
  (window as any).updateRandomLastActive = updateRandomLastActive;
  console.log('Activity update function available: updateRandomLastActive()');
}