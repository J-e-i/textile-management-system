import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { getInvoices } from "@/lib/business-real";

/** Invoice row from API (with joined order & product) */
interface InvoiceRow {
  id: string;
  invoice_number: string;
  order_id: string;
  total_amount: number;
  pdf_url?: string | null;
  issued_at: string;
  orders?: {
    id: string;
    quantity: number;
    total_amount: number;
    status: string;
    created_at: string;
    products?: { id: string; name: string; gsm?: string; color?: string } | null;
  } | null;
}

const BuyerInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewInvoice, setViewInvoice] = useState<InvoiceRow | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getInvoices();
        setInvoices((data || []) as InvoiceRow[]);
      } catch (error: any) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getStatusClass = (status: string) => {
    if (status === "PAID" || status === "DISPATCHED" || status === "DELIVERED") return "status-approved";
    return "status-pending";
  };

  const getInvoiceAmount = (inv: InvoiceRow) => inv.total_amount ?? 0;

  function openInvoicePrintWindow(inv: InvoiceRow) {
    const order = inv.orders;
    const product = order?.products;
    const amount = getInvoiceAmount(inv);
    const w = window.open("", "_blank", "width=600,height=700");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html><head><title>Invoice ${inv.invoice_number}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #333; }
        h1 { font-size: 1.25rem; margin-bottom: 4px; }
        .sub { color: #666; font-size: 0.875rem; margin-bottom: 16px; }
        .row { display: flex; justify-content: space-between; margin: 8px 0; }
        .muted { color: #666; }
        .total { font-weight: 600; margin-top: 16px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 1.1rem; }
        .status { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.875rem; margin-top: 8px; background: #dcfce7; color: #166534; }
      </style></head><body>
      <h1>${inv.invoice_number}</h1>
      <p class="sub">Invoice date: ${inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : "N/A"}</p>
      <div class="row"><span class="muted">Order ID</span><span>${(inv.order_id || "").slice(0, 8).toUpperCase()}</span></div>
      <div class="row"><span class="muted">Product / Fabric</span><span>${product?.name ?? "—"}</span></div>
      ${product?.gsm ? `<div class="row"><span class="muted">GSM</span><span>${product.gsm}</span></div>` : ""}
      ${product?.color ? `<div class="row"><span class="muted">Color</span><span>${product.color}</span></div>` : ""}
      <div class="row"><span class="muted">Quantity</span><span>${order?.quantity ?? "—"}</span></div>
      <div class="row"><span class="muted">Order Status</span><span>${order?.status ?? "—"}</span></div>
      <div class="row total"><span>Amount</span><span>₹${Number(amount).toLocaleString()}</span></div>
      <span class="status">✅ Paid</span>
      <p style="margin-top:24px;font-size:12px;color:#888;">TEXORDER MANAGEMENT SYSTEM. Use browser Print → Save as PDF to download.</p>
      </body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary border-t-transparent border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Invoices</h2>
        <p className="text-muted-foreground">View and download invoices for your orders</p>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-foreground">{invoices.length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-success">
            ₹{invoices.reduce((sum, inv) => sum + getInvoiceAmount(inv), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Order ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-medium text-foreground">{invoice.invoice_number}</td>
                  <td className="font-mono text-sm">{(invoice.order_id || "").slice(0, 8).toUpperCase()}</td>
                  <td>
                    <div>
                      <p className="font-medium">{invoice.orders?.products?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.orders?.products?.gsm && `${invoice.orders.products.gsm} GSM`}
                        {invoice.orders?.products?.color ? ` • ${invoice.orders.products.color}` : ""}
                      </p>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{invoice.orders?.quantity ?? "—"}</td>
                  <td className="font-mono text-sm">₹{getInvoiceAmount(invoice).toLocaleString()}</td>
                  <td className="text-muted-foreground">
                    {invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(invoice.orders?.status || '')}`}>
                      {invoice.orders?.status || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewInvoice(invoice)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInvoicePrintWindow(invoice)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {invoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No invoices yet. Invoices are auto-generated when you complete a payment.</p>
          </div>
        )}
      </div>

      {/* View details dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice details</DialogTitle>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice number</span>
                <span className="font-medium">{viewInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">{(viewInvoice.order_id || "").slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{viewInvoice.orders?.products?.name || "—"}</span>
              </div>
              {(viewInvoice.orders?.products?.gsm ?? viewInvoice.orders?.products?.color) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spec</span>
                  <span className="font-medium">
                    {[viewInvoice.orders?.products?.gsm && `${viewInvoice.orders.products.gsm} GSM`, viewInvoice.orders?.products?.color]
                      .filter(Boolean)
                      .join(" • ") || "—"}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{viewInvoice.orders?.quantity ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice date</span>
                <span className="font-medium">
                  {viewInvoice.issued_at ? new Date(viewInvoice.issued_at).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Status</span>
                <span className={`status-badge ${getStatusClass(viewInvoice.orders?.status || '')}`}>{viewInvoice.orders?.status || '—'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-primary">₹{getInvoiceAmount(viewInvoice).toLocaleString()}</span>
              </div>
              {viewInvoice.pdf_url && (
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground block mb-1">PDF URL</span>
                  <p className="text-foreground">{viewInvoice.pdf_url}</p>
                </div>
              )}
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={() => openInvoicePrintWindow(viewInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerInvoices;
