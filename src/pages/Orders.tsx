import OrdersTable from '@/components/orders/OrdersTable';

const Orders = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">View and manage all orders</p>
      </div>
      <OrdersTable />
    </div>
  );
};

export default Orders;
