import type { PaymentMethod, PurchaseStatus } from './database/enums';

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
  client_id: string;
  plan_id: string;
  plan: string;
  quantity: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
}