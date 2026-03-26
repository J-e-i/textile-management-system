import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download, Eye, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllQuotations, acceptQuotation, rejectQuotation } from "@/lib/business";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { XCircle } from "lucide-react";

/** Row from quotation table (admin-created) with joined order & product */
interface QuotationRow {
  id: string;
  order_id: string;
  quoted_price: number;
  valid_until: string;
  status: string;
  rejection_reason?: string | null;
  created_at: string;
  orders?: {
    id: string;
    quantity: number;
    total_amount: number;
    status: string;
    products?: { id: string; name: string; gsm?: string; color?: string } | null;
  } | null;
}

/** Normalized for UI */
interface QuotationDisplay {
  id: string;
  quotation_number: string;
  order_id: string;
  fabric: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  tax: number;
  delivery_charge: number;
  grand_total: number;
  valid_until: string;
  status: string;
  order_status: string;
  rejection_reason: string | null;
  created_at: string;
}

function mapRowToDisplay(row: QuotationRow): QuotationDisplay {
  const order = row.orders;
  const product = order?.products;
  const quantity = order?.quantity ?? 0;
  const unitPrice = quantity > 0 ? row.quoted_price / quantity : 0;
  return {
    id: row.id,
    quotation_number: `QT-${row.id.slice(0, 8).toUpperCase()}`,
    order_id: row.order_id,
    fabric: product?.name ?? "—",
    quantity,
    unit_price: unitPrice,
    total_amount: row.quoted_price,
    tax: 0,
    delivery_charge: 0,
    grand_total: row.quoted_price,
    valid_until: row.valid_until,
    status: row.status,
    order_status: order?.status ?? 'PENDING',
    rejection_reason: row.rejection_reason ?? null,
    created_at: row.created_at,
  };
}

function openQuotationPrintWindow(quote: QuotationDisplay) {
  const w = window.open("", "_blank", "width=600,height=700");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html>
    <html><head><title>Quotation ${quote.quotation_number}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; color: #333; }
      h1 { font-size: 1.25rem; margin-bottom: 8px; }
      .row { display: flex; justify-content: space-between; margin: 6px 0; }
      .muted { color: #666; }
      .total { font-weight: 600; margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd; }
    </style></head><body>
    <h1>Quotation ${quote.quotation_number}</h1>
    <p class="muted">Order ID: ${(quote.order_id || "").slice(0, 8).toUpperCase()}</p>
    <div class="row"><span class="muted">Fabric</span><span>${quote.fabric}</span></div>
    <div class="row"><span class="muted">Quantity</span><span>${quote.quantity} meters</span></div>
    <div class="row"><span class="muted">Valid until</span><span>${quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "N/A"}</span></div>
    <div class="row"><span class="muted">Status</span><span>${quote.status}</span></div>
    <hr/>
    <div class="row total"><span>Quoted amount</span><span>₹${quote.grand_total?.toLocaleString()}</span></div>
    <p class="muted" style="font-size: 10px; margin-top: -10px;">* Includes Tax & Delivery charges</p>
    <p style="margin-top:24px;font-size:12px;color:#888;">Generated from TEXORDER MANAGEMENT SYSTEM. Use browser Print → Save as PDF to download.</p>
    </body></html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

const BuyerQuotations = () => {
  const [quotations, setQuotations] = useState<QuotationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewQuote, setViewQuote] = useState<QuotationDisplay | null>(null);
  const [rejectingQuote, setRejectingQuote] = useState<QuotationDisplay | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await getAllQuotations();
      setQuotations((data as QuotationRow[]).map(mapRowToDisplay));
    } catch (error: any) {
      console.error('Failed to fetch quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleAccept = async (quote: QuotationDisplay) => {
    try {
      if (!confirm("Are you sure you want to accept this quotation? This will move your order to the payment stage.")) return;
      await acceptQuotation(quote.id);
      toast({
        title: "Quotation Accepted",
        description: "Your order is now awaiting payment.",
      });
      fetchQuotations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to accept quotation",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!rejectingQuote || !rejectionReason.trim()) return;
    try {
      await rejectQuotation(rejectingQuote.id, rejectionReason);
      toast({
        title: "Quotation Rejected",
        description: "Your feedback has been sent to the admin.",
      });
      setRejectingQuote(null);
      setRejectionReason("");
      fetchQuotations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject quotation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading quotations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Quotations</h2>
        <p className="text-muted-foreground">Review and approve quotations for your orders</p>
      </div>

      {/* Quotation Cards */}
      <div className="space-y-4">
        {quotations.length === 0 && (
          <div className="dashboard-card p-8 text-center text-muted-foreground">
            <p>No quotations yet. When the admin sends a quote for your order, it will appear here.</p>
          </div>
        )}
        {quotations.map((quote) => (
          <div key={quote.id} className="dashboard-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Left Section */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-foreground">{quote.quotation_number}</h3>
                  <span className={`status-badge ${
                    quote.status === 'ACCEPTED' ? "status-approved" :
                    quote.status === 'ACTIVE' ? "status-pending" :
                    quote.status === 'REJECTED' ? "status-rejected" :
                    "status-default"
                  }`}>
                    {quote.status === 'ACCEPTED' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Accepted</>
                    ) : quote.status === 'REJECTED' ? (
                      <><XCircle className="h-3 w-3 mr-1" /> Rejected</>
                    ) : quote.status === 'EXPIRED' ? (
                      <>Expired</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" /> Active</>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Order ID</span>
                    <span className="font-medium text-foreground">{(quote.order_id || '').slice(0, 8).toUpperCase() || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Fabric</span>
                    <span className="font-medium text-foreground">{quote.fabric}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Quantity</span>
                    <span className="font-medium text-foreground">{quote.quantity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Valid Until</span>
                    <span className="font-medium text-foreground">
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section - Pricing */}
              <div className="lg:w-64 lg:border-l lg:pl-6 border-border">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quoted Amount</span>
                    <span className="text-foreground">₹{quote.grand_total?.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic text-right mt-1">
                    * Includes Tax & Delivery
                  </p>
                  <div className="flex justify-between pt-2 border-t border-border font-semibold">
                    <span className="text-foreground">Grand Total</span>
                    <span className="text-primary">₹{quote.grand_total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setViewQuote(quote)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm" onClick={() => openQuotationPrintWindow(quote)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {quote.status === 'ACTIVE' && quote.order_status === 'AWAITING_PAYMENT' && (
                <>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-success hover:bg-success/90"
                    onClick={() => handleAccept(quote)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept & Continue
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive border-destructive/20 hover:bg-destructive/10"
                    onClick={() => setRejectingQuote(quote)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!viewQuote} onOpenChange={(open) => !open && setViewQuote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quotation details</DialogTitle>
          </DialogHeader>
          {viewQuote && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quotation</span>
                <span className="font-medium">{viewQuote.quotation_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">{(viewQuote.order_id || "").slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fabric</span>
                <span className="font-medium">{viewQuote.fabric}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{viewQuote.quantity}</span>
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
                <span className="text-muted-foreground">Grand total</span>
                <span className="font-semibold text-primary">₹{viewQuote.grand_total?.toLocaleString()}</span>
              </div>
              {viewQuote.status === 'REJECTED' && viewQuote.rejection_reason && (
                <div className="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-md">
                  <span className="text-xs font-semibold text-destructive uppercase block mb-1">Rejection Reason</span>
                  <p className="text-sm text-foreground">{viewQuote.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={!!rejectingQuote} onOpenChange={(open) => !open && setRejectingQuote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Quotation</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this quotation. This feedback will help us provide a better quote.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason</label>
              <Textarea 
                placeholder="e.g., Price is too high, Delivery time is too long..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingQuote(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerQuotations;
