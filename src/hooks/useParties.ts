import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtimeClient';
import { toast } from '@/hooks/use-toast';

export interface Party {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  station: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePartyData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  station?: string;
}

export const useParties = (searchQuery?: string) => {
  return useQuery({
    queryKey: ['parties', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('parties')
        .select('*')
        .order('name', { ascending: true });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Party[];
    },
  });
};

export const useCreateParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partyData: CreatePartyData) => {
      console.log('[parties] Creating party:', partyData);
      
      // Simple insert without .select().single() to reduce server work
      const { error } = await supabase
        .from('parties')
        .insert([partyData]);

      if (error) {
        console.error('[parties] Create error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log('[parties] Create success');
      return partyData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast({
        title: 'Party Added',
        description: 'New party has been saved successfully',
      });
    },
    onError: (error: Error) => {
      console.error('[parties] Create mutation error:', error);
      const isNetworkError = error.message.includes('timed out') || 
                             error.message.includes('network') ||
                             error.message.includes('Failed to fetch');
      toast({
        title: isNetworkError ? 'Network Error' : 'Error',
        description: isNetworkError 
          ? 'Request failed. Try disabling VPN/adblock or check your connection.' 
          : (error.message || 'Failed to add party'),
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...partyData }: CreatePartyData & { id: string }) => {
      console.log('[parties] Updating party:', id, partyData);
      
      const { error } = await supabase
        .from('parties')
        .update(partyData)
        .eq('id', id);

      if (error) {
        console.error('[parties] Update error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log('[parties] Update success');
      return { id, ...partyData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast({
        title: 'Party Updated',
        description: 'Party information has been updated',
      });
    },
    onError: (error: Error) => {
      console.error('[parties] Update mutation error:', error);
      const isNetworkError = error.message.includes('timed out') || 
                             error.message.includes('network') ||
                             error.message.includes('Failed to fetch');
      toast({
        title: isNetworkError ? 'Network Error' : 'Error',
        description: isNetworkError 
          ? 'Request failed. Try disabling VPN/adblock or check your connection.' 
          : (error.message || 'Failed to update party'),
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('[parties] Deleting party:', id);
      
      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[parties] Delete error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }
      
      console.log('[parties] Delete success');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast({
        title: 'Party Deleted',
        description: 'Party has been removed',
      });
    },
    onError: (error: Error) => {
      console.error('[parties] Delete mutation error:', error);
      const isNetworkError = error.message.includes('timed out') || 
                             error.message.includes('network') ||
                             error.message.includes('Failed to fetch');
      toast({
        title: isNetworkError ? 'Network Error' : 'Error',
        description: isNetworkError 
          ? 'Request failed. Try disabling VPN/adblock or check your connection.' 
          : (error.message || 'Failed to delete party'),
        variant: 'destructive',
      });
    },
  });
};
