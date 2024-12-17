import type { Plan, Purchase, Voucher } from './database/tables';
import type { PaymentMethod, PurchaseStatus, UserRole, CreditTransactionType } from './database/enums';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      plans: {
        Row: Plan;
        Insert: Omit<Plan, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Plan, 'created_at' | 'updated_at'>>;
      };
      purchases: {
        Row: Purchase;
        Insert: Omit<Purchase, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Purchase, 'created_at' | 'updated_at'>>;
      };
      vouchers: {
        Row: Voucher;
        Insert: Omit<Voucher, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Voucher, 'created_at' | 'updated_at'>>;
      };
    };
    Enums: {
      payment_method: PaymentMethod;
      purchase_status: PurchaseStatus;
      user_role: UserRole;
      credit_transaction_type: CreditTransactionType;
    };
  };
}