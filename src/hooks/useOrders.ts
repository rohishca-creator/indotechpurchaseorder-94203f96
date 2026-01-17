import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceData } from '@/types/invoice';
import { toast } from '@/hooks/use-toast';

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered';

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  party_name: string;
  party_address: string | null;
  party_phone: string | null;
  party_email: string | null;
  broker_name: string | null;
  item_description: string;
  quantity: number;
  number_of_coils: number;
  rate: number;
  payment_terms: string | null;
  station: string;
  delivery_date: string | null;
  notes: string | null;
  status: OrderStatus;
}

export const useOrders = (statusFilter?: OrderStatus | 'all', searchQuery?: string) => {
  return useQuery({
    queryKey: ['orders', statusFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery) {
        query = query.or(`party_name.ilike.%${searchQuery}%,station.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Order[];
    },
  });
};

export const useOrdersByStation = () => {
  return useQuery({
    queryKey: ['orders-by-station'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'confirmed'])
        .order('station', { ascending: true });

      if (error) throw error;

      // Group by station
      const grouped = (data as Order[]).reduce((acc, order) => {
        const station = order.station || 'Unknown';
        if (!acc[station]) {
          acc[station] = [];
        }
        acc[station].push(order);
        return acc;
      }, {} as Record<string, Order[]>);

      return grouped;
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceData: InvoiceData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const orderData = {
        user_id: user?.id,
        party_name: invoiceData.partyName,
        party_address: invoiceData.partyAddress || null,
        party_phone: invoiceData.partyPhone || null,
        party_email: invoiceData.partyEmail || null,
        broker_name: invoiceData.brokerName || null,
        item_description: invoiceData.itemDescription,
        quantity: invoiceData.quantity,
        number_of_coils: invoiceData.numberOfCoils,
        rate: invoiceData.rate,
        payment_terms: invoiceData.paymentTerms || null,
        station: invoiceData.station || 'TBD',
        delivery_date: invoiceData.deliveryDate ? invoiceData.deliveryDate.toISOString().split('T')[0] : null,
        notes: invoiceData.notes || null,
        status: 'pending' as OrderStatus,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-by-station'] });
      toast({
        title: 'Order Saved!',
        description: 'Order has been saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Saving Order',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-by-station'] });
      toast({
        title: 'Status Updated',
        description: 'Order status has been updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
