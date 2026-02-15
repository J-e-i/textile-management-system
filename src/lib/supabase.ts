import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mvejujwxravdmprnpmql.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          gst_number: string | null
          role: 'buyer' | 'admin'
          approval_status: 'PENDING' | 'APPROVED' | 'REJECTED'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          gst_number?: string | null
          role: 'buyer' | 'admin'
          approval_status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          gst_number?: string | null
          role?: 'buyer' | 'admin'
          approval_status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          gsm: string | null
          color: string | null
          description: string | null
          base_price: number
          stock_quantity: number
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          gsm?: string | null
          color?: string | null
          description?: string | null
          base_price: number
          stock_quantity: number
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          gsm?: string | null
          color?: string | null
          description?: string | null
          base_price?: number
          stock_quantity?: number
          image_url?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          product_id: string
          quantity: number
          status: 'PENDING' | 'QUOTED' | 'AWAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'
          total_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          product_id: string
          quantity: number
          status?: 'PENDING' | 'QUOTED' | 'AWAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'
          total_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          product_id?: string
          quantity?: number
          status?: 'PENDING' | 'QUOTED' | 'AWAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'
          total_amount?: number
          created_at?: string
        }
      }
      quotation: {
        Row: {
          id: string
          order_id: string
          quoted_price: number
          valid_until: string
          status: 'ACTIVE' | 'ACCEPTED' | 'EXPIRED'
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          quoted_price: number
          valid_until: string
          status?: 'ACTIVE' | 'ACCEPTED' | 'EXPIRED'
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          quoted_price?: number
          valid_until?: string
          status?: 'ACTIVE' | 'ACCEPTED' | 'EXPIRED'
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          amount: number
          currency: string | null
          payment_status: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
          payment_gateway: string | null
          transaction_reference: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          amount: number
          currency?: string | null
          payment_status?: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
          payment_gateway?: string | null
          transaction_reference?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          amount?: number
          currency?: string | null
          payment_status?: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
          payment_gateway?: string | null
          transaction_reference?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          order_id: string
          invoice_number: string
          total_amount: number
          pdf_url: string | null
          issued_at: string
        }
        Insert: {
          id?: string
          order_id: string
          invoice_number: string
          total_amount: number
          pdf_url?: string | null
          issued_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          invoice_number?: string
          total_amount?: number
          pdf_url?: string | null
          issued_at?: string
        }
      }
    }
  }
}
