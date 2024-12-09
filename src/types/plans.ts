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
  id: number;
  date: string;
  customerName: string;
  plan: string;
  quantity: number;
  total: number;
  paymentMethod: "cash" | "gcash" | "paymaya";
  status: "pending" | "approved" | "rejected" | "cancelled";
  vouchers?: Voucher[];
}