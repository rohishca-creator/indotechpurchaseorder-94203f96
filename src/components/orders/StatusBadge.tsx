import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/hooks/useOrders';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  dispatched: {
    label: 'Dispatched',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
