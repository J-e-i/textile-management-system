export interface InvoiceData {
  invoiceNumber: string;
  issuedAt: string;
  buyerName: string;
  buyerCompany: string;
  productName: string;
  productDetails: string;
  quantity: number;
  totalAmount: number;
  paymentReference?: string;
  orderId: string;
}

export const printInvoice = (invoice: InvoiceData) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('Please allow popups to download the invoice.');
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1a1a2e; background: #fff; }
    .invoice-container { max-width: 700px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #3B82F6; padding-bottom: 20px; }
    .brand h1 { font-size: 28px; color: #3B82F6; font-weight: 700; }
    .brand p { color: #666; font-size: 13px; margin-top: 4px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 22px; color: #1a1a2e; text-transform: uppercase; letter-spacing: 2px; }
    .invoice-meta p { font-size: 13px; color: #666; margin-top: 4px; }
    .invoice-meta .inv-number { font-size: 15px; font-weight: 600; color: #3B82F6; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 8px; font-weight: 600; }
    .bill-to p { font-size: 14px; line-height: 1.6; }
    .bill-to .name { font-weight: 600; font-size: 16px; color: #1a1a2e; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead th { background: #f0f4ff; color: #3B82F6; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding: 12px 16px; text-align: left; font-weight: 600; }
    tbody td { padding: 14px 16px; border-bottom: 1px solid #eee; font-size: 14px; }
    .amount-col { text-align: right; font-weight: 600; }
    .total-row { background: #3B82F6; color: #fff; }
    .total-row td { padding: 14px 16px; font-size: 16px; font-weight: 700; border: none; }
    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
    .payment-info { background: #f8fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    .payment-info p { font-size: 13px; color: #555; }
    .payment-info .label { font-weight: 600; color: #333; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
    .print-btn { display: block; margin: 0 auto 30px; padding: 10px 30px; background: #3B82F6; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 600; }
    .print-btn:hover { background: #2563EB; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Download PDF</button>
  <div class="invoice-container">
    <div class="header">
      <div class="brand">
        <h1>TEXORDER MANAGEMENT SYSTEM</h1>
        <p>Premium Fabric Solutions</p>
      </div>
      <div class="invoice-meta">
        <h2>Invoice</h2>
        <p class="inv-number">${invoice.invoiceNumber}</p>
        <p>Date: ${new Date(invoice.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
      </div>
    </div>

    <div class="section bill-to">
      <p class="section-title">Billed To</p>
      <p class="name">${invoice.buyerCompany || invoice.buyerName}</p>
      <p>${invoice.buyerName}</p>
    </div>

    <div class="section">
      <p class="section-title">Order Details</p>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Qty</th>
            <th class="amount-col">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${invoice.productName}</td>
            <td>${invoice.productDetails}</td>
            <td>${invoice.quantity}</td>
            <td class="amount-col">₹${invoice.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3">Total Amount</td>
            <td class="amount-col">₹${invoice.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    ${invoice.paymentReference ? `
    <div class="payment-info">
      <p><span class="label">Payment Reference:</span> ${invoice.paymentReference}</p>
      <p><span class="label">Payment Method:</span> Razorpay</p>
      <p><span class="label">Status:</span> ✅ Paid</p>
    </div>
    ` : ''}

    <div class="footer">
      <p>Thank you for your business!</p>
      <p style="margin-top: 4px;">Order ID: ${invoice.orderId}</p>
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
};
