import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllOrders, updateOrderStatus, createQuotation } from "@/lib/business";
import type { Order } from "@/lib/business";

const AdminOrders = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order as any).profiles?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order as any).products?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PROCESSING":
      case "PAID":
        return "status-approved";
      case "QUOTED":
        return "status-quoted";
      case "PENDING":
        return "status-pending";
      case "DELIVERED":
        return "bg-accent/15 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Order Management</h2>
        <p className="text-muted-foreground">View and process bulk order requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Pending Quote</p>
          <p className="text-2xl font-bold text-warning">{orders.filter(o => o.status === "PENDING").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Quoted</p>
          <p className="text-2xl font-bold text-info">{orders.filter(o => o.status === "QUOTED").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">In Production</p>
          <p className="text-2xl font-bold text-success">{orders.filter(o => o.status === "PROCESSING").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Delivered</p>
          <p className="text-2xl font-bold text-accent">{orders.filter(o => o.status === "DELIVERED").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID, buyer, or fabric..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="dispatched">Dispatched</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Fabric</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium text-foreground">{order.id.substring(0, 8).toUpperCase()}</td>
                  <td>{(order as any).profiles?.company_name || 'Unknown Buyer'}</td>
                  <td>
                    <div>
                      <p className="font-medium">{(order as any).products?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-muted-foreground">
                        {(order as any).products?.gsm && `${(order as any).products.gsm} GSM • `}
                        {(order as any).products?.color || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td>{order.quantity} meters</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === "PENDING" && (
                        <Button size="sm" asChild>
                          <Link to={`/admin/quotations/create?order=${order.id}`}>
                            <FileText className="h-4 w-4 mr-1" />
                            Quote
                          </Link>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
