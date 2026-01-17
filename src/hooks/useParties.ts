import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtimeClient';
import { toast } from '@/hooks/use-toast';

// Timeout wrapper to prevent infinite loading
const withTimeout = <T,>(promiseLike: PromiseLike<T>, timeoutMs = 15000): Promise<T> => {
  const promise = Promise.resolve(promiseLike);
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Please check your connection and try again.')), timeoutMs)
    ),
  ]);
};

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
      const { data, error } = await withTimeout(
        supabase
          .from('parties')
          .insert([partyData])
          .select()
          .single()
      );

      if (error) {
        console.error('Create party error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      return data as Party;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast({
        title: 'Party Added',
        description: 'New party has been saved successfully',
      });
    },
    onError: (error: Error) => {
      console.error('Create party mutation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add party',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...partyData }: CreatePartyData & { id: string }) => {
      const { data, error } = await withTimeout(
        supabase
          .from('parties')
          .update(partyData)
          .eq('id', id)
          .select()
          .single()
      );

      if (error) {
        console.error('Update party error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      return data as Party;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast({
        title: 'Party Updated',
        description: 'Party information has been updated',
      });
    },
    onError: (error: Error) => {
      console.error('Update party mutation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update party',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await withTimeout(
        supabase
          .from('parties')
          .delete()
          .eq('id', id)
      );

      if (error) {
        console.error('Delete party error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast({
        title: 'Party Deleted',
        description: 'Party has been removed',
      });
    },
    onError: (error: Error) => {
      console.error('Delete party mutation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete party',
        variant: 'destructive',
      });
    },
  });
};
