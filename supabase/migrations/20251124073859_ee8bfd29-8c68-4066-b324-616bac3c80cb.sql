-- Add explicit RLS policies to prevent user role manipulation
-- Users should not be able to update or delete their roles after creation

CREATE POLICY "Roles cannot be updated by users"
ON public.user_roles FOR UPDATE
USING (false);

CREATE POLICY "Roles cannot be deleted by users"
ON public.user_roles FOR DELETE
USING (false);