-- Drop and recreate parties policies (some already exist with these names)
DROP POLICY IF EXISTS "Authenticated users can view all parties" ON public.parties;
DROP POLICY IF EXISTS "Authenticated users can create parties" ON public.parties;
DROP POLICY IF EXISTS "Authenticated users can update parties" ON public.parties;

-- Recreate parties policies
CREATE POLICY "Authenticated users can view all parties" 
ON public.parties 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create parties" 
ON public.parties 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update parties" 
ON public.parties 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Auto-assign 'staff' role on new user signup
CREATE OR REPLACE FUNCTION public.auto_assign_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'staff')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-assign role when profile is created
DROP TRIGGER IF EXISTS on_profile_created_assign_role ON public.profiles;
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_user_role();