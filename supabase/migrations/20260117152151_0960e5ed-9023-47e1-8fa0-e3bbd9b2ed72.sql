-- Drop existing admin-only delete policy
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

-- Create new policy allowing any authenticated user to delete orders
CREATE POLICY "Authenticated users can delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);