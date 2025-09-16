import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🧹 Starting cleanup of auto-generated catbots...');

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log(`🔍 Looking for auto-generated catbots for user: ${user.id}`);

    // Find auto-generated catbots (those with names like "Complex Cat [timestamp]")
    const { data: autoCatbots, error: fetchError } = await supabase
      .from('catbots')
      .select('id, name, created_at')
      .eq('user_id', user.id)
      .like('name', 'Complex Cat %')
      .gte('created_at', '2025-09-16T00:00:00.000Z')
      .lt('created_at', '2025-09-17T00:00:00.000Z');

    if (fetchError) {
      console.error('❌ Error fetching auto-generated catbots:', fetchError);
      throw fetchError;
    }

    console.log(`📊 Found ${autoCatbots?.length || 0} auto-generated catbots to delete`);

    if (!autoCatbots || autoCatbots.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          deletedCount: 0, 
          message: 'No auto-generated catbots found to delete' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Delete the auto-generated catbots
    const catbotIds = autoCatbots.map(cat => cat.id);
    
    const { error: deleteError } = await supabase
      .from('catbots')
      .delete()
      .in('id', catbotIds);

    if (deleteError) {
      console.error('❌ Error deleting auto-generated catbots:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Successfully deleted ${autoCatbots.length} auto-generated catbots`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount: autoCatbots.length,
        deletedCatbots: autoCatbots.map(cat => ({ id: cat.id, name: cat.name })),
        message: `Successfully deleted ${autoCatbots.length} auto-generated catbots`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error in cleanup-auto-cats function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});