import { useState } from 'react';
import { useOrdersByStation, useUpdateOrderStatus, OrderStatus } from '@/hooks/useOrders';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { MapPin, ChevronDown, ChevronRight, Package, Truck, CheckCircle, Loader2, Layers, Box, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

const DispatchView = () => {
  const { data: ordersByStation, isLoading } = useOrdersByStation();
  const updateStatus = useUpdateOrderStatus();
  const [openStations, setOpenStations] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter stations based on search query
  const filteredStations = Object.entries(ordersByStation).filter(([station, orders]) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      station.toLowerCase().includes(searchLower) ||
      orders.some(o => o.party_name.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by order, party, vehicle, or LR n..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 bg-card border-border rounded-xl text-base"
        />
      </div>

      {/* Station Cards - Vertical List */}
      <div className="space-y-3">
        {filteredStations.map(([station, orders]) => {
          const isOpen = openStations[station] ?? false;
          const totalQty = orders.reduce((sum, o) => sum + o.quantity, 0);
          const totalWireRod = orders.reduce((sum, o) => sum + o.number_of_coils, 0);
          const orderCount = orders.length;

          return (
            <Collapsible
              key={station}
              open={isOpen}
              onOpenChange={() => toggleStation(station)}
            >
              <div className="bg-gradient-to-r from-primary/5 to-accent/10 rounded-2xl overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                    {/* City with Icon */}
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="font-bold text-lg text-foreground">{station}</span>
                    </div>

                    {/* Wire Rod Count */}
                    <div className="bg-card rounded-xl px-3 py-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-500" />
                        <div className="text-center">
                          <p className="font-bold text-foreground">{totalWireRod}</p>
                          <p className="text-xs text-muted-foreground">Wire Rod</p>
                        </div>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="bg-card rounded-xl px-3 py-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-primary" />
                        <div className="text-center">
                          <p className="font-bold text-foreground">{totalQty.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-muted-foreground">kg</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Count */}
                    <div className="bg-card rounded-xl px-3 py-2 shadow-sm">
                      <div className="text-center">
                        <p className="font-bold text-foreground">{orderCount}</p>
                        <p className="text-xs text-muted-foreground">dispatch</p>
                      </div>
                    </div>

                    <div className="ml-auto">
                      {isOpen ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border bg-card">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <Link
                              to={`/orders/${order.id}`}
                              className="font-bold text-foreground hover:text-primary"
                            >
                              {order.party_name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span>{formatDate(order.created_at)}</span>
                              <span>•</span>
                              <span className="font-semibold">{order.quantity.toLocaleString('en-IN')} kg</span>
                              <span>•</span>
                              <span className="font-semibold">{order.number_of_coils} Wire Rod</span>
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
    </div>
  );
};

export default DispatchView;
