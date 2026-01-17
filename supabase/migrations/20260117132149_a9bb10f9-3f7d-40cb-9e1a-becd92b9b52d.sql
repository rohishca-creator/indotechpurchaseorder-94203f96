-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can create parties" ON public.parties;
DROP POLICY IF EXISTS "Authenticated users can update parties" ON public.parties;
DROP POLICY IF EXISTS "Authenticated users can view parties" ON public.parties;
DROP POLICY IF EXISTS "Only admins can delete parties" ON public.parties;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Authenticated users can view parties" 
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

CREATE POLICY "Only admins can delete parties" 
ON public.parties 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));