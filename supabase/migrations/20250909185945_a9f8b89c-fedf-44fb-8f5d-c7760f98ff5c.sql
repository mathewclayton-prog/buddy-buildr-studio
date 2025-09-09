-- Create images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images', 
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- Create storage policies for user avatars
CREATE POLICY "Anyone can view images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Users can upload their own avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can delete their own avatars" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Create storage policies for catbot images
CREATE POLICY "Users can upload their catbot images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] = 'catbots'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can update their catbot images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] = 'catbots'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can delete their catbot images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] = 'catbots'
  AND auth.uid()::text = (storage.foldername(name))[2]
);