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
  id: string;  // Changed from number to string since it's a UUID
  date: string;
  plan: string;
  quantity: number;
  total: number;
  paymentMethod: "cash" | "gcash" | "paymaya";
  status: "pending" | "approved" | "rejected" | "cancelled";
  vouchers?: Voucher[];
  paymentInstructions?: string;
}