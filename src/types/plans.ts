import type { Database } from "@/types/database.types";

export interface Plan {
  id: string;
  duration: string;
  price: number;
  availableVouchers: number;
}

export interface Voucher {
  id: string;
  code: string;
  planId: string;
  isAssigned?: boolean;
}

export interface Purchase {
  id: string;
  date: string;
  customerName: string;
  client_id: string;
  plan_id: string;
  plan: string;
  quantity: number;
  total: number;
  paymentMethod: Database['public']['Tables']['purchases']['Row']['payment_method'];
  status: Database['public']['Tables']['purchases']['Row']['status'];
}