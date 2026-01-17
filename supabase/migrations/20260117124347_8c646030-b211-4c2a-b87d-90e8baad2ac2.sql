-- Create parties table for storing customer/party information
CREATE TABLE public.parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  station TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;

-- All authenticated org members can view parties
CREATE POLICY "Authenticated users can view parties" 
ON public.parties 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- All authenticated org members can create parties
CREATE POLICY "Authenticated users can create parties" 
ON public.parties 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- All authenticated org members can update parties
CREATE POLICY "Authenticated users can update parties" 
ON public.parties 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Only admins can delete parties
CREATE POLICY "Only admins can delete parties" 
ON public.parties 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_parties_updated_at
BEFORE UPDATE ON public.parties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();