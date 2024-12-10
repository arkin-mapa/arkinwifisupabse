import type { Database } from "@/integrations/supabase/types";

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
  isUsed: boolean;
}

export interface Purchase {
  id: string;
  date: string;
  customerName: string;
  plan: string;
  quantity: number;
  total: number;
  paymentMethod: Database["public"]["Enums"]["payment_method"];
  status: Database["public"]["Enums"]["purchase_status"];
  vouchers?: Voucher[];
}