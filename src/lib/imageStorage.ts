import { supabase } from "@/integrations/supabase/client";

// Types for image handling
export interface UploadResult {
  data?: {
    path: string;
    fullPath: string;
    publicUrl: string;
  };
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

// Allowed image formats and size limits
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Validates image file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images only.'
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size too large. Please upload images smaller than 5MB.'
    };
  }

  return { valid: true };
};

/**
 * Generates a unique filename with timestamp and random string
 */
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

/**
 * Uploads an image to Supabase Storage
 * @param file - The image file to upload
 * @param folder - The folder to upload to ('avatars' or 'catbots')
 * @param userId - Optional user ID (defaults to current user)
 * @returns Promise with upload result
 */
export const uploadImage = async (
  file: File, 
  folder: 'avatars' | 'catbots',
  userId?: string
): Promise<UploadResult> => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { error: validation.error };
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'Authentication required for image upload' };
    }

    const targetUserId = userId || user.id;
    
    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = `${folder}/${targetUserId}/${uniqueFilename}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { error: `Upload failed: ${error.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return {
      data: {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: urlData.publicUrl
      }
    };

  } catch (error: any) {
    console.error('Upload error:', error);
    return { error: `Upload failed: ${error.message}` };
  }
};

/**
 * Deletes an image from Supabase Storage
 * @param imagePath - The path of the image to delete
 * @returns Promise with deletion result
 */
export const deleteImage = async (imagePath: string): Promise<DeleteResult> => {
  try {
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required for image deletion' };
    }

    // Delete file from Supabase Storage
    const { error } = await supabase.storage
      .from('images')
      .remove([imagePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: `Delete failed: ${error.message}` };
    }

    return { success: true };

  } catch (error: any) {
    console.error('Delete error:', error);
    return { success: false, error: `Delete failed: ${error.message}` };
  }
};

/**
 * Gets the public URL for an image
 * @param imagePath - The path of the image
 * @returns Public URL string
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(imagePath);

  return data.publicUrl;
};

/**
 * Lists images in a specific folder for the current user
 * @param folder - The folder to list ('avatars' or 'catbots')
 * @param userId - Optional user ID (defaults to current user)
 * @returns Promise with list of image paths
 */
export const listUserImages = async (
  folder: 'avatars' | 'catbots',
  userId?: string
): Promise<{ data?: string[]; error?: string }> => {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'Authentication required' };
    }

    const targetUserId = userId || user.id;
    const folderPath = `${folder}/${targetUserId}`;

    // List files in user's folder
    const { data, error } = await supabase.storage
      .from('images')
      .list(folderPath);

    if (error) {
      console.error('List error:', error);
      return { error: `Failed to list images: ${error.message}` };
    }

    // Return file paths
    const filePaths = data.map(file => `${folderPath}/${file.name}`);
    return { data: filePaths };

  } catch (error: any) {
    console.error('List error:', error);
    return { error: `Failed to list images: ${error.message}` };
  }
};

/**
 * Updates user's avatar URL in their profile
 * @param avatarUrl - The new avatar URL
 * @returns Promise with update result
 */
export const updateUserAvatar = async (avatarUrl: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Update user profile with new avatar URL
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', user.id);

    if (error) {
      console.error('Profile update error:', error);
      return { success: false, error: `Failed to update profile: ${error.message}` };
    }

    return { success: true };

  } catch (error: any) {
    console.error('Profile update error:', error);
    return { success: false, error: `Failed to update profile: ${error.message}` };
  }
};

/**
 * Helper function to handle avatar upload and profile update in one operation
 * @param file - The avatar image file
 * @returns Promise with complete result
 */
export const uploadAndSetAvatar = async (file: File): Promise<UploadResult> => {
  try {
    // Upload the image
    const uploadResult = await uploadImage(file, 'avatars');
    
    if (uploadResult.error || !uploadResult.data) {
      return uploadResult;
    }

    // Update user profile with new avatar URL
    const updateResult = await updateUserAvatar(uploadResult.data.publicUrl);
    
    if (!updateResult.success) {
      // If profile update fails, clean up the uploaded image
      await deleteImage(uploadResult.data.path);
      return { error: updateResult.error };
    }

    return uploadResult;

  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return { error: `Avatar upload failed: ${error.message}` };
  }
};