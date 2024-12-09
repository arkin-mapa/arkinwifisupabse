import type { Plan, Voucher } from "@/types/plans";
import { Toast } from "@/components/ui/toast";

export const handleAddPlan = (
  newPlan: Omit<Plan, 'id' | 'availableVouchers'>,
  plans: Plan[],
  setPlans: (plans: Plan[]) => void,
  toast: any
) => {
  const newPlanObj: Plan = {
    id: (plans.length + 1).toString(),
    ...newPlan,
    availableVouchers: 0,
  };

  const updatedPlans = [...plans, newPlanObj];
  localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));
  setPlans(updatedPlans);

  toast({
    title: "Success",
    description: "New plan added successfully",
  });
};

export const handleDeletePlan = (
  planId: string,
  plans: Plan[],
  setPlans: (plans: Plan[]) => void,
  vouchers: Record<string, Voucher[]>,
  setVouchers: (vouchers: Record<string, Voucher[]>) => void,
  toast: any
) => {
  const updatedPlans = plans.filter(plan => plan.id !== planId);
  localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));
  setPlans(updatedPlans);
  
  const plan = plans.find(p => p.id === planId);
  if (plan) {
    const { [plan.duration]: _, ...remainingVouchers } = vouchers;
    localStorage.setItem('vouchers', JSON.stringify(remainingVouchers));
    setVouchers(remainingVouchers);
  }
  
  toast({
    title: "Plan deleted",
    description: "The plan has been removed successfully.",
  });
};

export const handleVoucherUpload = (
  planId: string,
  voucherCodes: string[],
  plans: Plan[],
  setPlans: (plans: Plan[]) => void,
  vouchers: Record<string, Voucher[]>,
  setVouchers: (vouchers: Record<string, Voucher[]>) => void,
  toast: any
) => {
  const plan = plans.find(p => p.id === planId);
  if (!plan) return;

  const existingVouchers = vouchers[plan.duration] || [];
  const existingCodes = new Set(existingVouchers.map(v => v.code));

  const uniqueNewCodes = voucherCodes.filter(code => !existingCodes.has(code));

  if (uniqueNewCodes.length < voucherCodes.length) {
    const duplicateCount = voucherCodes.length - uniqueNewCodes.length;
    toast({
      title: "Duplicate vouchers found",
      description: `${duplicateCount} duplicate voucher(s) were skipped.`,
    });

    if (uniqueNewCodes.length === 0) {
      return;
    }
  }

  const newVouchers = uniqueNewCodes.map((code, index) => ({
    id: `${planId}-${Date.now()}-${index}`,
    code,
    planId,
    isUsed: false
  }));

  const updatedVouchers = {
    ...vouchers,
    [plan.duration]: [...(vouchers[plan.duration] || []), ...newVouchers]
  };
  setVouchers(updatedVouchers);
  localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));

  const updatedPlans = plans.map(p => 
    p.id === planId 
      ? { ...p, availableVouchers: (updatedVouchers[plan.duration] || []).filter(v => !v.isUsed).length }
      : p
  );
  
  localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));
  setPlans(updatedPlans);

  toast({
    title: "Vouchers uploaded",
    description: `${uniqueNewCodes.length} new vouchers added to ${plan.duration} plan`,
  });
};