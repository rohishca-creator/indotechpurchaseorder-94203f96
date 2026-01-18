import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtimeClient';
import { Order } from './useOrders';

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  dispatchedOrders: number;
  deliveredOrders: number;
  confirmedOrders: number;
  totalParties: number;
  totalOrderValue: number;
  totalQuantity: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch all orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) throw ordersError;

      // Fetch parties count
      const { count: partiesCount, error: partiesError } = await supabase
        .from('parties')
        .select('*', { count: 'exact', head: true });

      if (partiesError) throw partiesError;

      const ordersList = (orders || []) as Order[];

      // Calculate stats
      const totalOrders = ordersList.length;
      const pendingOrders = ordersList.filter(o => o.status === 'pending').length;
      const confirmedOrders = ordersList.filter(o => o.status === 'confirmed').length;
      const dispatchedOrders = ordersList.filter(o => o.status === 'dispatched').length;
      const deliveredOrders = ordersList.filter(o => o.status === 'delivered').length;

      // Calculate total value and quantity
      const totalOrderValue = ordersList.reduce((sum, order) => {
        return sum + (order.quantity * order.rate);
      }, 0);

      const totalQuantity = ordersList.reduce((sum, order) => {
        return sum + order.quantity;
      }, 0);

      return {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        dispatchedOrders,
        deliveredOrders,
        totalParties: partiesCount || 0,
        totalOrderValue,
        totalQuantity,
      };
    },
  });
};
