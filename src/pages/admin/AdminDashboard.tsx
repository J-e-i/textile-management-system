import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Package, FileText, Boxes, ArrowRight, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getAllProfiles, getAllOrders, getAllQuotations, updateProfileApproval, updateOrderStatus, createQuotation } from "@/lib/business";
import type { Profile, Order, Quotation } from "@/lib/business";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profilesData, ordersData, quotationsData] = await Promise.all([
          getAllProfiles(),
          getAllOrders(),
          getAllQuotations()
        ]);
        
        setProfiles(profilesData);
        setOrders(ordersData);
        setQuotations(quotationsData);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calculate stats
  const totalBuyers = profiles.filter(p => p.role === 'buyer').length;
  const pendingApprovals = profiles.filter(p => p.approval_status === 'PENDING' && p.role === 'buyer').length;
  const newOrders = orders.filter(o => o.status === 'PENDING').length;
  const activeOrders = orders.filter(o => ['QUOTED', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING'].includes(o.status)).length;

  const stats = [
    { label: "Total Buyers", value: totalBuyers.toString(), icon: Users, color: "bg-primary/10 text-primary", change: "Registered buyers" },
    { label: "Pending Approvals", value: pendingApprovals.toString(), icon: AlertCircle, color: "bg-warning/10 text-warning", change: "Needs attention" },
    { label: "New Orders", value: newOrders.toString(), icon: Package, color: "bg-info/10 text-info", change: "Awaiting quotes" },
    { label: "Active Orders", value: activeOrders.toString(), icon: CheckCircle, color: "bg-success/10 text-success", change: "In progress" },
  ];

  const pendingBuyers = profiles
    .filter(p => p.approval_status === 'PENDING' && p.role === 'buyer')
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      businessName: p.company_name || 'Unknown Company',
      gst: p.gst_number || 'N/A',
      email: p.email,
      date: new Date(p.created_at).toLocaleDateString()
    }));

  const recentOrders = orders
    .slice(0, 3)
    .map(o => ({
      id: o.id.substring(0, 8).toUpperCase(),
      buyer: (o as any).profiles?.company_name || 'Unknown Buyer',
      fabric: (o as any).products?.name || 'Unknown Product',
      quantity: `${o.quantity} meters`,
      status: o.status.replace('_', ' ')
    }));

  const handleApproveBuyer = async (profileId: string) => {
    try {
      await updateProfileApproval(profileId, 'APPROVED');
      setProfiles(profiles.map(p => 
        p.id === profileId ? { ...p, approval_status: 'APPROVED' as const } : p
      ));
      toast({
        title: "Success",
        description: "Buyer approved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to approve buyer",
        variant: "destructive",
      });
    }
  };

  const handleRejectBuyer = async (profileId: string) => {
    try {
      await updateProfileApproval(profileId, 'REJECTED');
      setProfiles(profiles.map(p => 
        p.id === profileId ? { ...p, approval_status: 'REJECTED' as const } : p
      ));
      toast({
        title: "Success",
        description: "Buyer rejected successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject buyer",
        variant: "destructive",
      });
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return "status-approved";
      case "QUOTED":
        return "status-quoted";
      case "PENDING":
        return "status-pending";
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
        <h2 className="text-2xl font-bold text-foreground">Admin Overview</h2>
        <p className="text-muted-foreground">Manage buyers, orders, and quotations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="dashboard-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Buyer Approvals */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Pending Buyer Approvals</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/buyers">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {pendingBuyers.map((buyer) => (
              <div key={buyer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{buyer.businessName}</p>
                  <p className="text-sm text-muted-foreground truncate">{buyer.email}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleRejectBuyer(buyer.id)}
                  >
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleApproveBuyer(buyer.id)}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/orders">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{order.id}</p>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {order.buyer} • {order.fabric} • {order.quantity}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="ml-4">
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/buyers" className="dashboard-card hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">Manage Buyers</p>
              <p className="text-sm text-muted-foreground">Approve & manage</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/orders" className="dashboard-card hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">Order Management</p>
              <p className="text-sm text-muted-foreground">Process orders</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/quotations" className="dashboard-card hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">Quotations</p>
              <p className="text-sm text-muted-foreground">Generate quotes</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/products" className="dashboard-card hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Boxes className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">Products</p>
              <p className="text-sm text-muted-foreground">Manage fabrics</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
