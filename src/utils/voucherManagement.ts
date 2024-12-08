import { toast } from "sonner";
import type { Purchase, Voucher } from "@/types/plans";

export const transferVouchersToClient = (purchase: Purchase): void => {
  // Get the voucher pool
  const voucherPool = JSON.parse(localStorage.getItem('vouchers') || '{}');
  const planVouchers = voucherPool[purchase.plan] || [];
  const availableVouchers = planVouchers.filter(v => !v.isUsed);

  if (availableVouchers.length < purchase.quantity) {
    throw new Error(`Not enough vouchers available. Need ${purchase.quantity}, but only have ${availableVouchers.length}`);
  }

  // Select vouchers to transfer
  const vouchersToTransfer = availableVouchers.slice(0, purchase.quantity);
  const remainingVouchers = planVouchers.filter(voucher => 
    !vouchersToTransfer.some(transferVoucher => transferVoucher.id === voucher.id)
  );

  // Update voucher pool
  const updatedVoucherPool = {
    ...voucherPool,
    [purchase.plan]: remainingVouchers
  };
  localStorage.setItem('vouchers', JSON.stringify(updatedVoucherPool));

  // Update client wallet
  const clientVouchers = JSON.parse(localStorage.getItem('clientVouchers') || '[]');
  localStorage.setItem('clientVouchers', JSON.stringify([...clientVouchers, ...vouchersToTransfer]));

  // Update plan counts
  updatePlanVoucherCount(purchase.plan, remainingVouchers.length);
};

export const updatePlanVoucherCount = (planDuration: string, newCount: number): void => {
  const plans = JSON.parse(localStorage.getItem('wifiPlans') || '[]');
  const updatedPlans = plans.map(p => 
    p.duration === planDuration
      ? { ...p, availableVouchers: newCount }
      : p
  );
  localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));
};

export const deleteVoucher = (voucherId: string, planDuration: string): void => {
  // Remove from voucher pool
  const voucherPool = JSON.parse(localStorage.getItem('vouchers') || '{}');
  const planVouchers = voucherPool[planDuration] || [];
  const updatedPoolVouchers = planVouchers.filter(v => v.id !== voucherId);
  
  const updatedVoucherPool = {
    ...voucherPool,
    [planDuration]: updatedPoolVouchers
  };
  localStorage.setItem('vouchers', JSON.stringify(updatedVoucherPool));

  // Remove from client vouchers
  const clientVouchers = JSON.parse(localStorage.getItem('clientVouchers') || '[]');
  const updatedClientVouchers = clientVouchers.filter((v: Voucher) => v.id !== voucherId);
  localStorage.setItem('clientVouchers', JSON.stringify(updatedClientVouchers));

  // Update plan count
  updatePlanVoucherCount(planDuration, updatedPoolVouchers.length);
};