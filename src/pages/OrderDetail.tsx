import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtimeClient';
import { useUpdateOrderStatus, useDeleteOrder, OrderStatus, Order } from '@/hooks/useOrders';
import StatusBadge from '@/components/orders/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { downloadPDF } from '@/utils/pdfGenerator';
import { calculateInvoice } from '@/utils/invoiceCalculations';
import { InvoiceData } from '@/types/invoice';
import { 
  ArrowLeft, 
  Download, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Package, 
  Coins,
  FileText,
  Loader2,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  const handleDeleteOrder = () => {
    if (order) {
      deleteOrder.mutate(order.id, {
        onSuccess: () => {
          navigate('/orders');
        },
      });
    }
  };

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!id,
  });

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (order) {
      updateStatus.mutate({ orderId: order.id, status: newStatus });
    }
  };

  const handleDownloadPDF = async () => {
    if (!order) return;

    const invoiceData: InvoiceData = {
      invoiceDate: new Date(order.created_at),
      deliveryDate: order.delivery_date ? new Date(order.delivery_date) : null,
      partyName: order.party_name,
      partyAddress: order.party_address || '',
      partyPhone: order.party_phone || '',
      partyEmail: order.party_email || '',
      brokerName: order.broker_name || '',
      itemDescription: order.item_description,
      quantity: order.quantity,
      numberOfCoils: order.number_of_coils,
      rate: Number(order.rate),
      paymentTerms: order.payment_terms || '',
      station: order.station,
      notes: order.notes || '',
    };

    const calculations = calculateInvoice(invoiceData);
    await downloadPDF(invoiceData, calculations);
    
    toast({
      title: 'PDF Generated!',
      description: 'Order confirmation downloaded successfully',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders" className="text-primary hover:underline mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{order.party_name}</h1>
            <p className="text-muted-foreground text-sm">
              Order from {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <Select value={order.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this order for {order.party_name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteOrder}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Customer Details
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Party Name</span>
              <p className="font-medium">{order.party_name}</p>
            </div>
            {order.party_address && (
              <div>
                <span className="text-sm text-muted-foreground">Address</span>
                <p className="font-medium">{order.party_address}</p>
              </div>
            )}
            {order.party_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{order.party_phone}</span>
              </div>
            )}
            {order.party_email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{order.party_email}</span>
              </div>
            )}
            {order.broker_name && (
              <div>
                <span className="text-sm text-muted-foreground">Broker</span>
                <p className="font-medium">{order.broker_name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Order Details
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Item</span>
              <p className="font-medium">{order.item_description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Quantity</span>
                <p className="font-mono font-medium">{order.quantity.toLocaleString('en-IN')} kg</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Wire Rod</span>
                <p className="font-mono font-medium">{order.number_of_coils}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono">₹{Number(order.rate).toLocaleString('en-IN')}/kg</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Delivery Details
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Station</span>
              <p className="font-medium">{order.station}</p>
            </div>
            {order.delivery_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(order.delivery_date)}</span>
              </div>
            )}
            {order.payment_terms && (
              <div>
                <span className="text-sm text-muted-foreground">Payment Terms</span>
                <p className="font-medium">{order.payment_terms}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-card rounded-xl shadow-card p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Notes
            </h2>
            <p className="text-foreground whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
