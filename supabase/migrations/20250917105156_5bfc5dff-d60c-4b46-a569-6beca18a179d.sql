-- Fix search_path for all existing functions
CREATE OR REPLACE FUNCTION public.get_catbot_creator_profile(catbot_id uuid)
 RETURNS TABLE(display_name text, avatar_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.display_name, p.avatar_url
  FROM profiles p
  JOIN catbots c ON p.user_id = c.user_id
  WHERE c.id = catbot_id AND c.is_public = true;
$function$;

CREATE OR REPLACE FUNCTION public.update_catbot_like_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.catbots 
    SET like_count = like_count + 1 
    WHERE id = NEW.catbot_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.catbots 
    SET like_count = like_count - 1 
    WHERE id = OLD.catbot_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  
  -- Also insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role);
  
  RETURN NEW;
END;
$function$;