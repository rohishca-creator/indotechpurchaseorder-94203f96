import { 
  FileText, 
  Clock, 
  Truck, 
  CheckCircle, 
  Users, 
  IndianRupee, 
  Package 
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import StatCard from '@/components/dashboard/StatCard';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { data: stats, isLoading } = useDashboardStats();

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const formatQuantity = (kg: number) => {
    const tonnes = kg / 1000;
    return `${tonnes.toFixed(2)} T`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your purchase orders</p>
      </div>

      {/* 2x2 Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={FileText}
          iconBgColor="bg-teal-100"
          iconColor="text-teal-600"
          value={stats?.totalOrders || 0}
          label="Total Orders"
        />
        <StatCard
          icon={Clock}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          value={stats?.pendingOrders || 0}
          label="Pending"
        />
        <StatCard
          icon={Truck}
          iconBgColor="bg-cyan-100"
          iconColor="text-cyan-600"
          value={stats?.dispatchedOrders || 0}
          label="Dispatched"
        />
        <StatCard
          icon={CheckCircle}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          value={stats?.deliveredOrders || 0}
          label="Delivered"
        />
      </div>

      {/* Full-width Stats */}
      <div className="space-y-4">
        <StatCard
          icon={Users}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          value={stats?.totalParties || 0}
          label="Registered Parties"
          fullWidth
        />
        <StatCard
          icon={IndianRupee}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          value={formatCurrency(stats?.totalOrderValue || 0)}
          label="Total Order Value"
          fullWidth
        />
        <StatCard
          icon={Package}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
          value={formatQuantity(stats?.totalQuantity || 0)}
          label="Total Quantity"
          fullWidth
        />
      </div>
    </div>
  );
};

export default Index;
