import type { PaymentMethod, PurchaseStatus } from './enums';

export interface Plan {
  id: string;
  duration: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  customer_name: string;
  client_id: string;
  plan_id: string | null;
  quantity: number;
  total_amount: number;
  payment_method: PaymentMethod;
  status: PurchaseStatus;
  created_at: string;
  updated_at: string;
}

export interface Voucher {
  id: string;
  code: string;
  plan_id: string | null;
  is_used: boolean | null;
  created_at: string;
  updated_at: string;
}