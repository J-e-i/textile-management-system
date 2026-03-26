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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle, XCircle, Eye, Loader2, Calendar, Mail, Phone, Building2, Fingerprint, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getAllProfiles, updateProfileApproval, deleteBuyerCompletely } from "@/lib/business";
import type { Profile } from "@/lib/business";

const AdminBuyers = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<Profile | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load buyer profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Filter only buyers
  const buyers = profiles.filter(p => p.role === 'buyer');

  // Show active buyers (PENDING and APPROVED, hide REJECTED from main list)
  const activeBuyers = buyers.filter(b => b.approval_status !== 'REJECTED');

  // Choose base list depending on selected status so "all", "pending", and "rejected" work correctly
  const baseList = statusFilter === 'all' ? buyers : 
                  statusFilter === 'pending' ? buyers.filter(b => b.approval_status === 'PENDING') :
                  statusFilter === 'rejected' ? buyers.filter(b => b.approval_status === 'REJECTED') :
                  activeBuyers;

  const filteredBuyers = baseList.filter((buyer) => {
    const matchesSearch = buyer.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.gst_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || buyer.approval_status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string) => {
    try {
      const { data, error } = await supabase
        .rpc('approve_buyer_simple', { 
          buyer_id: id,
          admin_email: 'admin@textile-connect.com'
        });
    
      if (error) {
        toast({ title: "Error", description: error.message });
      } else {
        toast({ 
          title: "Success", 
          description: data.message || "Buyer approved and email confirmed!" 
        });
        fetchProfiles(); // Refresh the list
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to approve buyer" });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject and PERMANENTLY delete this buyer? This will also remove their login access.")) {
      return;
    }

    try {
      await deleteBuyerCompletely(id);
      setProfiles(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Buyer Removed",
        description: "The buyer has been rejected and completely removed from the system.",
        variant: "destructive",
      });
      if (selectedBuyer?.id === id) {
        setIsDetailsOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove buyer. Make sure the RPC function is installed.",
        variant: "destructive",
      });
    }
  };

  const openBuyerDetails = (buyer: Profile) => {
    setSelectedBuyer(buyer);
    setIsDetailsOpen(true);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "status-approved";
      case "PENDING":
        return "status-pending";
      case "REJECTED":
        return "status-rejected";
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
        <h2 className="text-2xl font-bold text-foreground">Buyer Management</h2>
        <p className="text-muted-foreground">Approve registrations and manage buyer accounts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Active Buyers</p>
          <p className="text-2xl font-bold text-foreground">{activeBuyers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">(Pending + Approved)</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Pending Approval</p>
          <p className="text-2xl font-bold text-warning">{activeBuyers.filter(b => b.approval_status === "PENDING").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Approved Buyers</p>
          <p className="text-2xl font-bold text-success">{activeBuyers.filter(b => b.approval_status === "APPROVED").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="text-2xl font-bold text-destructive">{buyers.filter(b => b.approval_status === "REJECTED").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by business name, GST, or email..."
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buyers Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>GST Number</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuyers.map((buyer) => (
                <tr key={buyer.id}>
                  <td className="font-medium text-foreground">{buyer.company_name || 'N/A'}</td>
                  <td className="font-mono text-sm">{buyer.gst_number || 'N/A'}</td>
                  <td>{buyer.full_name || 'N/A'}</td>
                  <td>{buyer.email}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(buyer.approval_status || 'PENDING')}`}>
                      {buyer.approval_status || 'PENDING'}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{new Date(buyer.created_at || '').toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openBuyerDetails(buyer)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {buyer.approval_status === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-success hover:text-success"
                            onClick={() => handleApprove(buyer.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleReject(buyer.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBuyers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No buyers found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Buyer Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Buyer Details
            </DialogTitle>
            <DialogDescription>
              Detailed information for {selectedBuyer?.company_name}
            </DialogDescription>
          </DialogHeader>

          {selectedBuyer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Fingerprint className="h-4 w-4" />
                  <span className="text-sm font-medium">Business</span>
                </div>
                <div className="col-span-3 text-sm font-semibold text-foreground">
                  {selectedBuyer.company_name}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 flex justify-center font-bold text-[10px] border border-muted-foreground rounded-[2px]">G</div>
                  <span className="text-sm font-medium">GST</span>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <span className="font-mono text-xs bg-muted p-1 px-2 rounded w-fit">
                    {selectedBuyer.gst_number}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-[10px] gap-1"
                    onClick={() => window.open(`https://services.gst.gov.in/services/searchtp`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Verify GST
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Contact</span>
                </div>
                <div className="col-span-3 text-sm">
                  {selectedBuyer.full_name}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <div className="col-span-3 text-sm">
                  {selectedBuyer.email}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Joined</span>
                </div>
                <div className="col-span-3 text-sm">
                  {new Date(selectedBuyer.created_at || '').toLocaleDateString()} at {new Date(selectedBuyer.created_at || '').toLocaleTimeString()}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <div className="col-span-3">
                  <span className={`status-badge ${getStatusClass(selectedBuyer.approval_status || 'PENDING')}`}>
                    {selectedBuyer.approval_status || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {(selectedBuyer?.approval_status === 'PENDING' || selectedBuyer?.approval_status === 'REJECTED') && (
              <Button 
                variant="outline" 
                className="text-destructive border-destructive/20 hover:bg-destructive/10"
                onClick={() => handleReject(selectedBuyer.id)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {selectedBuyer?.approval_status === 'REJECTED' ? 'Delete Permanently' : 'Reject & Delete'}
              </Button>
            )}
            
            {selectedBuyer?.approval_status === 'PENDING' && (
              <Button 
                onClick={() => {
                  handleApprove(selectedBuyer.id);
                  setIsDetailsOpen(false);
                }}
                className="bg-success hover:bg-success/90 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Buyer
              </Button>
            )}
            <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBuyers;
