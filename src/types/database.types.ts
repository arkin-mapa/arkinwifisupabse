import type { VoucherSchema, VoucherWalletSchema } from './database/vouchers';
import type { PurchaseSchema } from './database/purchases';
import type { PlanSchema } from './database/plans';

export interface Database {
  public: {
    Tables: {
      vouchers: {
        Row: VoucherSchema;
        Insert: Omit<VoucherSchema, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VoucherSchema, 'id' | 'created_at' | 'updated_at'>>;
      };
      voucher_wallet: {
        Row: VoucherWalletSchema;
        Insert: Omit<VoucherWalletSchema, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VoucherWalletSchema, 'id' | 'created_at' | 'updated_at'>>;
      };
      purchases: {
        Row: PurchaseSchema;
        Insert: Omit<PurchaseSchema, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PurchaseSchema, 'id' | 'created_at' | 'updated_at'>>;
      };
      plans: {
        Row: PlanSchema;
        Insert: Omit<PlanSchema, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PlanSchema, 'id' | 'created_at' | 'updated_at'>>;
      };
      credits: {
        Row: {
          id: string;
          client_id: string;
          amount: number;
          transaction_type: 'deposit' | 'purchase';
          reference_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          amount: number;
          transaction_type: 'deposit' | 'purchase';
          reference_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          amount?: number;
          transaction_type?: 'deposit' | 'purchase';
          reference_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["user_role"] | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      transfer_vouchers_to_client: {
        Args: {
          p_client_id: string;
          p_voucher_ids: string[];
        };
        Returns: void;
      };
      get_user_id_by_email: {
        Args: {
          user_email: string;
        };
        Returns: string;
      };
      transfer_credits: {
        Args: {
          from_client_id: string;
          to_client_id: string;
          transfer_amount: number;
        };
        Returns: boolean;
      };
    };
    Enums: {
      payment_method: 'cash' | 'gcash' | 'paymaya' | 'credit';
      purchase_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
      credit_transaction_type: 'deposit' | 'purchase';
      user_role: 'admin' | 'client';
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
