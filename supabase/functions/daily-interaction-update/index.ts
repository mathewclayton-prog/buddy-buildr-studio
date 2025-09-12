import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Calculate daily increase for existing interaction counts
function calculateDailyIncrease(currentCount: number): number {
  // More popular bots (higher counts) get more daily interactions
  const baseIncrease = Math.floor(currentCount / 100); // 1% of current count
  const randomIncrease = Math.floor(Math.random() * 10); // 0-9 random
  const totalIncrease = Math.max(1, baseIncrease + randomIncrease); // Minimum 1
  
  return Math.min(totalIncrease, 50); // Cap at 50 per day
}

Deno.serve(async (req) => {
  try {
    console.log('Starting daily interaction count update...');
    
    // Fetch all catbots with their current interaction counts
    const { data: catbots, error } = await supabase
      .from('catbots')
      .select('id, interaction_count, name')
      .eq('is_public', true); // Only update public catbots
    
    if (error) {
      console.error('Error fetching catbots:', error);
      throw error;
    }
    
    if (!catbots || catbots.length === 0) {
      console.log('No catbots found for daily update');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No catbots found',
        updated: 0 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let totalUpdated = 0;
    let totalIncrease = 0;
    
    // Process catbots in batches to avoid timeouts
    const batchSize = 20;
    for (let i = 0; i < catbots.length; i += batchSize) {
      const batch = catbots.slice(i, i + batchSize);
      
      const updates = batch.map(catbot => {
        const currentCount = catbot.interaction_count || 0;
        const dailyIncrease = calculateDailyIncrease(currentCount);
        const newCount = currentCount + dailyIncrease;
        
        totalIncrease += dailyIncrease;
        
        return {
          id: catbot.id,
          interaction_count: newCount
        };
      });
      
      // Update this batch
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('catbots')
          .update({ interaction_count: update.interaction_count })
          .eq('id', update.id);
        
        if (updateError) {
          console.error(`Error updating catbot ${update.id}:`, updateError);
        } else {
          totalUpdated++;
        }
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const result = {
      success: true,
      message: `Daily interaction update complete`,
      updated: totalUpdated,
      totalCatbots: catbots.length,
      totalIncrease: totalIncrease,
      averageIncrease: Math.round(totalIncrease / catbots.length * 100) / 100,
      timestamp: new Date().toISOString()
    };
    
    console.log('Update complete:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in daily update function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
})