import { supabase } from "@/integrations/supabase/client";

interface TagGenerationResult {
  success: boolean;
  updated: number;
  errors: string[];
}

export const generateTagsForAllCatbots = async (): Promise<TagGenerationResult> => {
  const result: TagGenerationResult = {
    success: true,
    updated: 0,
    errors: []
  };

  try {
    // Get all catbots that don't have tags or have empty tags
    const { data: catbots, error: fetchError } = await supabase
      .from('catbots')
      .select('id, name, description, public_profile, tags')
      .or('tags.is.null,tags.eq.{}');

    if (fetchError) {
      throw fetchError;
    }

    if (!catbots || catbots.length === 0) {
      console.log('No catbots found that need tag generation');
      return result;
    }

    console.log(`Found ${catbots.length} catbots that need tags`);

    // Process each catbot
    for (const catbot of catbots) {
      try {
        // Get training data for this catbot
        const { data: trainingData } = await supabase
          .from('catbot_training_data')
          .select('training_description, personality')
          .eq('catbot_id', catbot.id)
          .maybeSingle();

        // Generate tags using the edge function
        const { data: tagData, error: tagError } = await supabase.functions.invoke('generate-tags', {
          body: {
            name: catbot.name,
            description: catbot.description || catbot.public_profile,
            personality: trainingData?.personality || null,
            public_profile: catbot.public_profile,
            training_description: trainingData?.training_description || null
          }
        });

        if (tagError) {
          result.errors.push(`Failed to generate tags for ${catbot.name}: ${tagError.message}`);
          continue;
        }

        if (tagData?.tags && Array.isArray(tagData.tags) && tagData.tags.length > 0) {
          // Update the catbot with generated tags
          const { error: updateError } = await supabase
            .from('catbots')
            .update({ tags: tagData.tags })
            .eq('id', catbot.id);

          if (updateError) {
            result.errors.push(`Failed to update tags for ${catbot.name}: ${updateError.message}`);
          } else {
            result.updated++;
            console.log(`Generated tags for ${catbot.name}:`, tagData.tags);
          }
        } else {
          result.errors.push(`No tags generated for ${catbot.name}`);
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        result.errors.push(`Error processing ${catbot.name}: ${error.message}`);
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    console.log(`Tag generation complete. Updated: ${result.updated}, Errors: ${result.errors.length}`);
    return result;

  } catch (error: any) {
    console.error('Error in retroactive tag generation:', error);
    result.success = false;
    result.errors.push(`General error: ${error.message}`);
    return result;
  }
};

export const generateTagsForCatbot = async (catbotId: string): Promise<{ success: boolean; tags?: string[]; error?: string }> => {
  try {
    // Get the specific catbot
    const { data: catbot, error: fetchError } = await supabase
      .from('catbots')
      .select('id, name, description, public_profile')
      .eq('id', catbotId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Get training data for this catbot
    const { data: trainingData } = await supabase
      .from('catbot_training_data')
      .select('training_description, personality')
      .eq('catbot_id', catbotId)
      .maybeSingle();

    // Generate tags using the edge function
    const { data: tagData, error: tagError } = await supabase.functions.invoke('generate-tags', {
      body: {
        name: catbot.name,
        description: catbot.description || catbot.public_profile,
        personality: trainingData?.personality || null,
        public_profile: catbot.public_profile,
        training_description: trainingData?.training_description || null
      }
    });

    if (tagError) {
      throw tagError;
    }

    if (tagData?.tags && Array.isArray(tagData.tags) && tagData.tags.length > 0) {
      // Update the catbot with generated tags
      const { error: updateError } = await supabase
        .from('catbots')
        .update({ tags: tagData.tags })
        .eq('id', catbotId);

      if (updateError) {
        throw updateError;
      }

      return { success: true, tags: tagData.tags };
    } else {
      return { success: false, error: 'No tags generated' };
    }

  } catch (error: any) {
    console.error('Error generating tags for catbot:', error);
    return { success: false, error: error.message };
  }
};