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
      const { data, error } = await supabase
        .from('parties')
        .insert([partyData])
        .select()
        .single();

      if (error) {
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
    onError: (error) => {
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
      const { data, error } = await supabase
        .from('parties')
        .update(partyData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
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
    onError: (error) => {
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
      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', id);

      if (error) {
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
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete party',
        variant: 'destructive',
      });
    },
  });
};
