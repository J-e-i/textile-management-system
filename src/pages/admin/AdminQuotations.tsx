import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, Send, Download, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { getAllQuotations, createQuotation, getAllOrders, updateOrder } from "@/lib/business";
import type { Quotation, Order } from "@/lib/business";

const AdminQuotations = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewQuote, setViewQuote] = useState<Quotation | null>(null);

  const [quoteForm, setQuoteForm] = useState({
    pricePerUnit: "",
    taxRate: "18",
    deliveryCharges: "",
    validityDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quotationsData, ordersData] = await Promise.all([
          getAllQuotations(),
          getAllOrders()
        ]);
        
        setQuotations(quotationsData);
        setOrders(ordersData);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load quotations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const pendingOrders = orders.filter(o => o.status === 'PENDING');

  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuoteForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateQuote = (order: any) => {
    setSelectedOrder(order);
    setQuoteForm({ pricePerUnit: "", taxRate: "18", deliveryCharges: "", validityDate: "" });
    setIsQuoteDialogOpen(true);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder || !quoteForm.pricePerUnit || !quoteForm.validityDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const quantity = selectedOrder.quantity;
      const price = parseFloat(quoteForm.pricePerUnit);
      const taxRate = parseFloat(quoteForm.taxRate);
      const delivery = parseFloat(quoteForm.deliveryCharges || "0");
      
      const subtotal = quantity * price;
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + tax + delivery;

      // Create quotation
      const newQuotation = await createQuotation({
        order_id: selectedOrder.id,
        quoted_price: total,
        valid_until: quoteForm.validityDate,
        status: 'ACTIVE',
        rejection_reason: null
      });

      // Update order status and total_amount so buyer can pay the quoted amount
      await updateOrder(selectedOrder.id, { 
        status: 'AWAITING_PAYMENT',
        total_amount: total
      });

      // Update local state
      setQuotations(prev => [newQuotation, ...prev]);
      setOrders(prev => prev.map(o => 
        o.id === selectedOrder.id ? { ...o, status: 'AWAITING_PAYMENT' as const } : o
      ));

      toast({
        title: "Quotation Created",
        description: `Quotation for ${selectedOrder.id.substring(0, 8).toUpperCase()} has been created.`,
      });
      
      setIsQuoteDialogOpen(false);
      setQuoteForm({
        pricePerUnit: "",
        taxRate: "18",
        deliveryCharges: "",
        validityDate: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create quotation",
        variant: "destructive",
      });
    }
  };

  const calculateTotal = () => {
    const quantity = parseInt(selectedOrder?.quantity || "0");
    const price = parseFloat(quoteForm.pricePerUnit || "0");
    const taxRate = parseFloat(quoteForm.taxRate || "0");
    const delivery = parseFloat(quoteForm.deliveryCharges || "0");
    
    const subtotal = quantity * price;
    const tax = subtotal * (taxRate / 100);
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      delivery: delivery.toFixed(2),
      total: (subtotal + tax + delivery).toFixed(2),
    };
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "status-quoted";
      case "ACCEPTED":
        return "status-approved";
      case "EXPIRED":
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
        <h2 className="text-2xl font-bold text-foreground">Quotation Management</h2>
        <p className="text-muted-foreground">Generate and manage quotations for bulk orders</p>
      </div>

      {/* Pending Orders for Quote */}
      {pendingOrders.length > 0 && (
        <div className="dashboard-card border-warning/30">
          <h3 className="text-lg font-semibold text-foreground mb-4">Orders Awaiting Quotation</h3>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-warning/5 rounded-lg border border-warning/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{order.id.substring(0, 8).toUpperCase()}</span>
                    <span className="status-badge status-pending">Needs Quote</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(order as any).profiles?.company_name || 'Unknown Buyer'} • {(order as any).products?.name || 'Unknown Product'} • {order.quantity} meters
                  </p>
                </div>
                <Button onClick={() => handleCreateQuote(order)}>
                  Create Quotation
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotation Dialog */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Quotation</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <form onSubmit={handleSubmitQuote} className="space-y-4">
              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-medium">{selectedOrder.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buyer</span>
                  <span className="font-medium">{(selectedOrder as any).profiles?.company_name || 'Unknown Buyer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product</span>
                  <span className="font-medium">{(selectedOrder as any).products?.name || 'Unknown Product'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{selectedOrder.quantity} meters</span>
                </div>
              </div>

              {/* Pricing Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-enterprise">Price per meter (₹) *</label>
                  <Input
                    name="pricePerUnit"
                    type="number"
                    value={quoteForm.pricePerUnit}
                    onChange={handleQuoteChange}
                    required
                    placeholder="e.g., 180"
                  />
                </div>
                <div>
                  <label className="label-enterprise">Tax Rate (%) *</label>
                  <Input
                    name="taxRate"
                    type="number"
                    value={quoteForm.taxRate}
                    onChange={handleQuoteChange}
                    required
                    placeholder="18"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-enterprise">Delivery Charges (₹) *</label>
                  <Input
                    name="deliveryCharges"
                    type="number"
                    value={quoteForm.deliveryCharges}
                    onChange={handleQuoteChange}
                    required
                    placeholder="e.g., 2500"
                  />
                </div>
                <div>
                  <label className="label-enterprise">Valid Until *</label>
                  <Input
                    name="validityDate"
                    type="date"
                    value={quoteForm.validityDate}
                    onChange={handleQuoteChange}
                    required
                  />
                </div>
              </div>

              {/* Calculated Total */}
              {quoteForm.pricePerUnit && (
                <div className="bg-primary/5 rounded-lg p-4 space-y-2 text-sm border border-primary/20">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{calculateTotal().subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({quoteForm.taxRate}%)</span>
                    <span>₹{calculateTotal().tax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>₹{calculateTotal().delivery}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-primary/20 font-semibold">
                    <span>Grand Total</span>
                    <span className="text-primary">₹{calculateTotal().total}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Send Quotation
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Existing Quotations */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">All Quotations</h3>
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Fabric</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quote) => (
                <tr key={quote.id}>
                  <td className="font-medium text-foreground">{quote.id.substring(0, 8).toUpperCase()}</td>
                  <td>{(quote as any).orders?.id.substring(0, 8).toUpperCase() || 'N/A'}</td>
                  <td>{(quote as any).orders?.profiles?.company_name || 'Unknown Buyer'}</td>
                  <td>{(quote as any).orders?.products?.name || 'Unknown Product'}</td>
                  <td>{(quote as any).orders?.quantity || 'N/A'} meters</td>
                  <td className="font-medium text-foreground">₹{quote.quoted_price.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(quote.status)}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewQuote(quote)} title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Download PDF"
                        onClick={() => {
                          const q = quote as any;
                          const w = window.open("", "_blank", "width=600,height=700");
                          if (!w) return;
                          w.document.write(`
                            <!DOCTYPE html>
                            <html><head><title>Quotation ${(quote.id || "").slice(0, 8).toUpperCase()}</title>
                            <style>body{font-family:system-ui,sans-serif;padding:24px;color:#333;}
                            h1{font-size:1.25rem;margin-bottom:8px;}
                            .row{display:flex;justify-content:space-between;margin:6px 0;}
                            .muted{color:#666;}
                            .total{font-weight:600;margin-top:12px;padding-top:12px;border-top:1px solid #ddd;}
                            </style></head><body>
                            <h1>Quotation ${(quote.id || "").slice(0, 8).toUpperCase()}</h1>
                            <p class="muted">Order ID: ${(q.orders?.id || "").toString().slice(0, 8).toUpperCase() || "N/A"}</p>
                            <div class="row"><span class="muted">Buyer</span><span>${q.orders?.profiles?.company_name || "—"}</span></div>
                            <div class="row"><span class="muted">Fabric</span><span>${q.orders?.products?.name || "—"}</span></div>
                            <div class="row"><span class="muted">Quantity</span><span>${q.orders?.quantity ?? "N/A"} meters</span></div>
                            <div class="row"><span class="muted">Valid until</span><span>${quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "N/A"}</span></div>
                            <div class="row"><span class="muted">Status</span><span>${quote.status}</span></div>
                            <hr/>
                            <div class="row total"><span>Quoted amount</span><span>₹${typeof quote.quoted_price === "number" ? quote.quoted_price.toLocaleString() : quote.quoted_price}</span></div>
                            <p style="margin-top:24px;font-size:12px;color:#888;">TEXORDER MANAGEMENT SYSTEM. Use Print → Save as PDF to download.</p>
                            </body></html>
                          `);
                          w.document.close();
                          w.focus();
                          setTimeout(() => w.print(), 300);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {quote.status === 'REJECTED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-warning hover:text-warning"
                          title="Recreate Quotation"
                          onClick={async () => {
                            if (!confirm("This will move the order back to 'Needs Quote' state. Continue?")) return;
                            try {
                              await updateOrder((quote as any).order_id, { status: 'PENDING' as any });
                              toast({
                                title: "Order Reset",
                                description: "The order is now awaiting a new quotation.",
                              });
                              // Refresh orders/quotations
                              const [quotationsData, ordersData] = await Promise.all([
                                getAllQuotations(),
                                getAllOrders()
                              ]);
                              setQuotations(quotationsData);
                              setOrders(ordersData);
                            } catch (error: any) {
                              toast({
                                title: "Error",
                                description: "Failed to reset order status",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewQuote} onOpenChange={(open) => !open && setViewQuote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quotation details</DialogTitle>
          </DialogHeader>
          {viewQuote && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quote ID</span>
                <span className="font-medium">{(viewQuote as any).id?.toString().slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">{((viewQuote as any).orders?.id || "").toString().slice(0, 8).toUpperCase() || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buyer</span>
                <span className="font-medium">{(viewQuote as any).orders?.profiles?.company_name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fabric</span>
                <span className="font-medium">{(viewQuote as any).orders?.products?.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{(viewQuote as any).orders?.quantity ?? "N/A"} meters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid until</span>
                <span className="font-medium">{viewQuote.valid_until ? new Date(viewQuote.valid_until).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{viewQuote.status}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Quoted amount</span>
                <span className="font-semibold text-primary">₹{typeof viewQuote.quoted_price === "number" ? viewQuote.quoted_price.toLocaleString() : viewQuote.quoted_price}</span>
              </div>
              {(viewQuote as any).status === 'REJECTED' && (viewQuote as any).rejection_reason && (
                <div className="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-md">
                  <div className="flex items-center gap-2 mb-1 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase">Rejection Reason</span>
                  </div>
                  <p className="text-sm text-foreground">{(viewQuote as any).rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuotations;
