export interface VoucherSchema {
  id: string;
  code: string;
  plan_id: string | null;
  is_used: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoucherWalletSchema {
  id: string;
  client_id: string;
  voucher_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
}