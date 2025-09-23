-- Reset Tom Cat's like count to zero and clean up associated like records
-- First, delete all like records for Tom Cat to maintain consistency
DELETE FROM public.catbot_likes 
WHERE catbot_id = 'ba9ef875-b375-49db-aa31-eb3fcd07c8dc';

-- Then reset the like count to zero
UPDATE public.catbots 
SET like_count = 0 
WHERE id = 'ba9ef875-b375-49db-aa31-eb3fcd07c8dc';