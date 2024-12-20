export interface Database {
  public: {
    Tables: {
      plans: {
        Row: {
          id: string;
          duration: string;
          price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          duration: string;
          price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          duration?: string;
          price?: number;
          created_at?: string;
          updated_at?: string;
        };
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
      vouchers: {
        Row: {
          id: string;
          code: string;
          plan_id: string;
          is_used: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          plan_id: string;
          is_used?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          plan_id?: string;
          is_used?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          customer_name: string;
          client_id: string;
          plan_id: string | null;
          quantity: number;
          total_amount: number;
          payment_method: 'cash' | 'gcash' | 'paymaya' | 'credit';
          status: 'pending' | 'approved' | 'rejected' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          client_id: string;
          plan_id?: string | null;
          quantity: number;
          total_amount: number;
          payment_method: 'cash' | 'gcash' | 'paymaya' | 'credit';
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          client_id?: string;
          plan_id?: string | null;
          quantity?: number;
          total_amount?: number;
          payment_method?: 'cash' | 'gcash' | 'paymaya' | 'credit';
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Enums: {
      payment_method: 'cash' | 'gcash' | 'paymaya' | 'credit';
      purchase_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
      credit_transaction_type: 'deposit' | 'purchase';
    };
  };
}
