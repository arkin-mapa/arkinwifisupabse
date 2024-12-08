import type { Voucher } from "@/types/plans";

export const assignVouchersToClient = (
  voucherPool: Record<string, Voucher[]>,
  planDuration: string,
  quantity: number
): { assignedVouchers: Voucher[], remainingPool: Record<string, Voucher[]> } => {
  const planVouchers = voucherPool[planDuration] || [];
  const availableVouchers = planVouchers.filter(v => !v.isUsed);
  
  if (availableVouchers.length < quantity) {
    throw new Error("Not enough vouchers available in the pool");
  }

  const assignedVouchers = availableVouchers.slice(0, quantity).map(v => ({
    ...v,
    isUsed: true
  }));

  const remainingVouchers = planVouchers.map(v => 
    assignedVouchers.find(av => av.id === v.id) ? { ...v, isUsed: true } : v
  );

  const remainingPool = {
    ...voucherPool,
    [planDuration]: remainingVouchers
  };

  return { assignedVouchers, remainingPool };
};