import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { loadRazorpayScript } from '../lib/razorpay';
import { createRazorpayOrder, verifyRazorpayPayment } from '../lib/payments';
import { Order } from '../lib/business';

interface PaymentButtonProps {
  order: Order;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: any) => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  order, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      // 1. Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // 2. Create Order on Backend (Edge Function)
      const orderData = await createRazorpayOrder(order.id, order.total_amount);

      // 3. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // Fallback or loaded from env
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TEXORDER MANAGEMENT SYSTEM',
        description: `Payment for Order #${order.id.slice(0, 8)}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // 4. Verify Payment on Backend (Edge Function)
            await verifyRazorpayPayment({
              rzp_payment_id: response.razorpay_payment_id,
              rzp_order_id: response.razorpay_order_id,
              rzp_signature: response.razorpay_signature,
              db_order_id: order.id,
              amount: order.total_amount
            });
            
            if (onPaymentSuccess) onPaymentSuccess();
          } catch (verifyError) {
            console.error('Verification Error:', verifyError);
            if (onPaymentError) onPaymentError(verifyError);
          }
        },
        prefill: {
          // Normally you'd pass the user's name/email here from Auth Context
          name: "Buyer", 
          email: "buyer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: '#3B82F6' // matches standard blue in the app
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment Failed:', response.error);
        if (onPaymentError) onPaymentError(response.error);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment Error:', error);
      if (onPaymentError) onPaymentError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || order.status !== 'AWAITING_PAYMENT'}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      {isLoading ? 'Processing...' : 'Pay Now'}
    </button>
  );
};
