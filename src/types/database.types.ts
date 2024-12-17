export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      plans: {
        Row: {
          id: string
          duration: string
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          duration: string
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          duration?: string
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      vouchers: {
        Row: {
          id: string
          code: string
          plan_id: string
          is_used: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          plan_id: string
          is_used?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          plan_id?: string
          is_used?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          customer_name: string
          plan_id: string
          quantity: number
          total_amount: number
          payment_method: 'cash' | 'gcash' | 'paymaya'
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          plan_id: string
          quantity: number
          total_amount: number
          payment_method: 'cash' | 'gcash' | 'paymaya'
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          plan_id?: string
          quantity?: number
          total_amount?: number
          payment_method?: 'cash' | 'gcash' | 'paymaya'
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}