import { useState } from 'react';
import { useOrdersByStation, useUpdateOrderStatus, OrderStatus, Order } from '@/hooks/useOrders';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { MapPin, ChevronDown, ChevronRight, Package, Truck, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const DispatchView = () => {
  const { data: ordersByStation, isLoading } = useOrdersByStation();
  const updateStatus = useUpdateOrderStatus();
  const [openStations, setOpenStations] = useState<Record<string, boolean>>({});

  const toggleStation = (station: string) => {
    setOpenStations((prev) => ({
      ...prev,
      [station]: !prev[station],
    }));
  };

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateStatus.mutate({ orderId, status });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!ordersByStation || Object.keys(ordersByStation).length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No pending or confirmed orders to dispatch</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(ordersByStation).map(([station, orders]) => {
        const isOpen = openStations[station] ?? false;
        const pendingCount = orders.filter((o) => o.status === 'pending').length;
        const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
        const totalQty = orders.reduce((sum, o) => sum + o.quantity, 0);
        const totalWireRod = orders.reduce((sum, o) => sum + o.number_of_coils, 0);

        return (
          <Collapsible
            key={station}
            open={isOpen}
            onOpenChange={() => toggleStation(station)}
          >
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{station}</h3>
                      <p className="text-sm text-muted-foreground">
                        {orders.length} order{orders.length > 1 ? 's' : ''} • {totalWireRod} Wire Rod • {totalQty.toLocaleString('en-IN')} kg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2 text-xs">
                      {pendingCount > 0 && (
                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                          {pendingCount} pending
                        </span>
                      )}
                      {confirmedCount > 0 && (
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {confirmedCount} confirmed
                        </span>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t border-border">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <Link
                            to={`/orders/${order.id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {order.party_name}
                          </Link>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>{formatDate(order.created_at)}</span>
                            <span>•</span>
                            <span className="font-mono">{order.quantity.toLocaleString('en-IN')} kg</span>
                            <span>•</span>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                          )}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'dispatched')}
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              Dispatch
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default DispatchView;
