import { supabase } from './supabase'
import type { Database } from './supabase'

export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Quotation = Database['public']['Tables']['quotation']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

// ============================
// PRODUCTS
// ============================

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================
// ORDERS
// ============================

export const createOrder = async (order: Omit<Order, 'id' | 'created_at'>): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getOrdersByBuyer = async (buyerId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      products:product_id (*),
      profiles:buyer_id (full_name, company_name)
    `)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products:product_id (*),
        profiles:buyer_id (full_name, company_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getAllOrders error:', error.message, error.details);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
    return data || []
  } catch (err: any) {
    console.error('getAllOrders exception:', err);
    throw err;
  }
}

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  return updateOrder(orderId, { status })
}

// ============================
// QUOTATIONS
// ============================

export const createQuotation = async (quotation: Omit<Quotation, 'id' | 'created_at'>): Promise<Quotation> => {
  const { data, error } = await supabase
    .from('quotation')
    .insert(quotation)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getQuotationsByBuyer = async (buyerId: string): Promise<Quotation[]> => {
  const { data, error } = await supabase
    .from('quotation')
    .select(`
      *,
      orders:order_id (
        *,
        products:product_id (*)
      )
    `)
    .eq('orders.buyer_id', buyerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getAllQuotations = async (): Promise<Quotation[]> => {
  try {
    const { data, error } = await supabase
      .from('quotation')
      .select(`
        *,
        orders:order_id (
          *,
          profiles:buyer_id (full_name, company_name),
          products:product_id (*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getAllQuotations error:', error.message, error.details);
      throw new Error(`Failed to fetch quotations: ${error.message}`);
    }
    return data || []
  } catch (err: any) {
    console.error('getAllQuotations exception:', err);
    throw err;
  }
}

export const acceptQuotation = async (quotationId: string): Promise<Quotation> => {
  // Update quotation status
  const { data: quotationData, error: quotationError } = await supabase
    .from('quotation')
    .update({ status: 'ACCEPTED' })
    .eq('id', quotationId)
    .select()
    .single()

  if (quotationError) throw quotationError

  // Update order status to AWAITING_PAYMENT
  await supabase
    .from('orders')
    .update({ status: 'AWAITING_PAYMENT' })
    .eq('id', quotationData.order_id)

  return quotationData
}

export const rejectQuotation = async (quotationId: string, reason: string): Promise<Quotation> => {
  // Update quotation status and reason
  const { data: quotationData, error: quotationError } = await supabase
    .from('quotation')
    .update({ 
      status: 'REJECTED',
      rejection_reason: reason 
    })
    .eq('id', quotationId)
    .select()
    .single()

  if (quotationError) throw quotationError

  // Update order status back to PENDING so admin can recreate it
  await supabase
    .from('orders')
    .update({ status: 'PENDING' })
    .eq('id', quotationData.order_id)

  return quotationData
}

// ============================
// PROFILES (Buyer Management)
// ============================

export const getAllProfiles = async (): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getAllProfiles error:', error.message, error.details);
      throw new Error(`Failed to fetch profiles: ${error.message}`);
    }
    return data || []
  } catch (err: any) {
    console.error('getAllProfiles exception:', err);
    throw err;
  }
}

export const updateProfileApproval = async (profileId: string, approvalStatus: Profile['approval_status']): Promise<Profile> => {
  // First, get the profile to find the user's email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('id', profileId)
    .single()

  if (profileError) throw profileError

  // Update approval status in database
  const { data, error } = await supabase
    .from('profiles')
    .update({ approval_status: approvalStatus })
    .eq('id', profileId)
    .select()
    .single()

  if (error) throw error

  // If approved, send confirmation email so they can verify and login
  if (approvalStatus === 'APPROVED' && profile?.email) {
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: profile.email
      })

      if (resendError) {
        console.error('Failed to send confirmation email:', resendError.message)
        // Don't throw - approval is done, email sending is secondary
        // User can request resend from login page if needed
      } else {
        console.log(`Confirmation email sent to ${profile.email}`)
      }
    } catch (err) {
      console.error('Error sending confirmation email:', err)
      // Don't throw - approval was successful, email is best effort
    }
  }

  return data
}
export const updateProfile = async (profileId: string, updates: Partial<Profile>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteBuyerCompletely = async (buyerId: string): Promise<void> => {
  const { data, error } = await supabase.rpc('delete_buyer_completely', {
    buyer_id: buyerId
  });

  if (error) {
    console.error('Error calling delete_buyer_completely:', error);
    throw error;
  }

  const result = data as { success: boolean, message: string };
  if (result && result.success === false) {
    throw new Error(result.message || 'Failed to delete buyer completely');
  }
}

// ============================
// PAYMENTS
// ============================

export const createPayment = async (payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> => {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updatePaymentStatus = async (paymentId: string, status: Payment['payment_status']): Promise<Payment> => {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      payment_status: status,
      paid_at: status === 'SUCCESS' ? new Date().toISOString() : null
    })
    .eq('id', paymentId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getPaymentsByBuyer = async (buyerId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      orders:order_id (
        *,
        products:product_id (*)
      )
    `)
    .eq('orders.buyer_id', buyerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ============================
// INVOICES
// ============================

export const createInvoice = async (invoice: Omit<Invoice, 'id' | 'issued_at'>): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getInvoiceByOrderId = async (orderId: string): Promise<Invoice | null> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('order_id', orderId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data
}

export const getAllInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      orders:order_id (
        *,
        products:product_id (*),
        profiles:buyer_id (full_name, company_name)
      )
    `)
    .order('issued_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const generateInvoiceForOrder = async (orderId: string, totalAmount: number): Promise<Invoice> => {
  // Check if invoice already exists
  const existing = await getInvoiceByOrderId(orderId)
  if (existing) return existing

  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const invoiceNumber = `INV-${dateStr}-${randomSuffix}`

  return createInvoice({
    order_id: orderId,
    invoice_number: invoiceNumber,
    total_amount: totalAmount,
    pdf_url: null,
  })
}

export const getInvoicesByBuyer = async (buyerId: string): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      orders:order_id (
        *,
        products:product_id (*)
      )
    `)
    .eq('orders.buyer_id', buyerId)
    .order('issued_at', { ascending: false })

  if (error) throw error
  return data || []
}
