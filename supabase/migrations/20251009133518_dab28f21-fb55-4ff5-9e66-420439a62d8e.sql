-- SECURITY FIX: Remove dangerous permissive INSERT policy that allows privilege escalation
DROP POLICY IF EXISTS "System can insert roles" ON public.user_roles;

-- Add secure policy: only admins can assign roles
-- Note: The handle_new_user() trigger will still work because SECURITY DEFINER bypasses RLS
CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add policy to allow admins to delete roles (for role management)
CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add policy to allow admins to update roles (for role management)
CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));