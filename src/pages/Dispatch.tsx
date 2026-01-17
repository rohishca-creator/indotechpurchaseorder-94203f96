import DispatchView from '@/components/orders/DispatchView';

const Dispatch = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dispatch</h1>
        <p className="text-muted-foreground">Orders grouped by station for dispatch planning</p>
      </div>
      <DispatchView />
    </div>
  );
};

export default Dispatch;
