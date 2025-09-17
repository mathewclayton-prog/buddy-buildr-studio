-- Update all catbots with realistic weighted heart distribution
UPDATE catbots 
SET like_count = 
  CASE 
    WHEN random() < 0.40 THEN FLOOR(random() * 5) + 1        -- 40%: 1-5 hearts
    WHEN random() < 0.75 THEN FLOOR(random() * 10) + 6       -- 35%: 6-15 hearts  
    WHEN random() < 0.95 THEN FLOOR(random() * 15) + 16      -- 20%: 16-30 hearts
    ELSE FLOOR(random() * 20) + 31                           -- 5%: 31-50 hearts
  END;