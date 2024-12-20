export interface PurchaseSchema {
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
}