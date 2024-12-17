import type { Database } from "./database.types";

export interface CreditTransaction {
  id: string;
  clientId: string;
  amount: number;
  transactionType: Database['public']['Enums']['credit_transaction_type'];
  referenceId?: string;
  createdAt: string;
}

export interface CreditBalance {
  total: number;
  transactions: CreditTransaction[];
}