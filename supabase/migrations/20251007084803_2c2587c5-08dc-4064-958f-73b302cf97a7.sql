-- Create a temporary function to normalize tags
CREATE OR REPLACE FUNCTION normalize_catbot_tags()
RETURNS void AS $$
DECLARE
  catbot_record RECORD;
  normalized_tags text[];
  original_tag text;
  normalized_tag text;
BEGIN
  -- Loop through all catbots with tags
  FOR catbot_record IN 
    SELECT id, tags 
    FROM catbots 
    WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
  LOOP
    normalized_tags := ARRAY[]::text[];
    
    -- Process each tag
    FOREACH original_tag IN ARRAY catbot_record.tags
    LOOP
      -- Normalize tag based on mapping rules
      normalized_tag := CASE
        -- Entertainment/Media
        WHEN lower(original_tag) IN ('fantasy', 'fantasi', 'fantasía') THEN 'Fantasy'
        WHEN lower(original_tag) IN ('sci-fi', 'scifi', 'science fiction', 'sci fi') THEN 'Sci-Fi'
        WHEN lower(original_tag) IN ('gaming', 'games', 'video games', 'videogames', 'gamer') THEN 'Gaming'
        WHEN lower(original_tag) IN ('anime', 'animé') THEN 'Anime'
        WHEN lower(original_tag) IN ('movies', 'movie', 'film', 'films', 'cinema') THEN 'Movies'
        WHEN lower(original_tag) IN ('books', 'book', 'literature', 'reading') THEN 'Books'
        WHEN lower(original_tag) IN ('rpg', 'role-playing', 'roleplay', 'role playing') THEN 'RPG'
        WHEN lower(original_tag) IN ('manga', 'mangá') THEN 'Manga'
        WHEN lower(original_tag) IN ('text adventure', 'text-adventure', 'interactive fiction') THEN 'Text Adventure'
        
        -- Roles/Functions
        WHEN lower(original_tag) IN ('teacher', 'tutor', 'instructor', 'educator') THEN 'Teacher'
        WHEN lower(original_tag) IN ('expert', 'specialist', 'professional') THEN 'Expert'
        WHEN lower(original_tag) IN ('coach', 'mentor', 'trainer') THEN 'Coach'
        WHEN lower(original_tag) IN ('therapist', 'counselor', 'therapy', 'counselling') THEN 'Therapist'
        WHEN lower(original_tag) IN ('companion', 'companionship') THEN 'Companion'
        WHEN lower(original_tag) IN ('friend', 'friendship', 'buddy') THEN 'Friend'
        
        -- Topics/Interests
        WHEN lower(original_tag) IN ('religion', 'religious', 'faith') THEN 'Religion'
        WHEN lower(original_tag) IN ('creative writing', 'writing', 'creative-writing', 'author') THEN 'Creative Writing'
        WHEN lower(original_tag) IN ('business', 'entrepreneur', 'corporate', 'entrepreneurship') THEN 'Business'
        WHEN lower(original_tag) IN ('travel', 'traveling', 'travelling', 'tourism') THEN 'Travel'
        WHEN lower(original_tag) IN ('music', 'musical', 'musician') THEN 'Music'
        WHEN lower(original_tag) IN ('art', 'artistic', 'artist', 'arts') THEN 'Art'
        WHEN lower(original_tag) IN ('sports', 'sport', 'athletic', 'athletics') THEN 'Sports'
        WHEN lower(original_tag) IN ('nature', 'natural', 'outdoors', 'wildlife') THEN 'Nature'
        WHEN lower(original_tag) IN ('technology', 'tech', 'technological', 'it') THEN 'Technology'
        WHEN lower(original_tag) IN ('history', 'historical', 'historic') THEN 'History'
        WHEN lower(original_tag) IN ('politics', 'political', 'government') THEN 'Politics'
        WHEN lower(original_tag) IN ('philosophy', 'philosophical', 'philosopher') THEN 'Philosophy'
        WHEN lower(original_tag) IN ('educational', 'education', 'learning', 'academic') THEN 'Educational'
        WHEN lower(original_tag) IN ('cooking', 'culinary', 'chef', 'food', 'recipe') THEN 'Cooking'
        WHEN lower(original_tag) IN ('spirituality', 'spiritual') THEN 'Spirituality'
        
        -- Identity
        WHEN lower(original_tag) IN ('lgbtq+', 'lgbtq', 'lgbt', 'queer', 'pride') THEN 'LGBTQ+'
        
        -- No match - return NULL to filter out
        ELSE NULL
      END;
      
      -- Add normalized tag if valid and not duplicate
      IF normalized_tag IS NOT NULL AND NOT (normalized_tag = ANY(normalized_tags)) THEN
        normalized_tags := array_append(normalized_tags, normalized_tag);
      END IF;
    END LOOP;
    
    -- Limit to 4 tags maximum
    IF array_length(normalized_tags, 1) > 4 THEN
      normalized_tags := normalized_tags[1:4];
    END IF;
    
    -- Update the catbot with normalized tags
    UPDATE catbots 
    SET tags = normalized_tags
    WHERE id = catbot_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the normalization
SELECT normalize_catbot_tags();

-- Drop the temporary function
DROP FUNCTION normalize_catbot_tags();