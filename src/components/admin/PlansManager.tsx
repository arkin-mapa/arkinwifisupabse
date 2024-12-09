import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import PlanCard from "./PlanCard";
import VoucherPool from "./VoucherPool";
import AddPlanDialog from "./AddPlanDialog";
import type { Plan, Voucher } from "@/types/plans";

const PlansManager = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [vouchers, setVouchers] = useState<Record<string, Voucher[]>>({});
  const { toast } = useToast();

  // Load plans and vouchers from localStorage on component mount
  useEffect(() => {
    const storedPlans = localStorage.getItem('wifiPlans');
    const storedVouchers = localStorage.getItem('vouchers');
    
    if (storedPlans) {
      const parsedPlans = JSON.parse(storedPlans);
      // Update available vouchers count to only include unused vouchers
      const updatedPlans = parsedPlans.map(plan => ({
        ...plan,
        availableVouchers: (JSON.parse(storedVouchers || '{}')[plan.duration] || [])
          .filter(v => !v.isUsed).length
      }));
      setPlans(updatedPlans);
      localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));
    } else {
      // Initialize with default plans if none exist
      const defaultPlans: Plan[] = [
        { id: "1", duration: "2 hrs", price: 5, availableVouchers: 0 },
        { id: "2", duration: "4 hrs", price: 10, availableVouchers: 0 },
        { id: "3", duration: "6 hrs", price: 15, availableVouchers: 0 },
        { id: "4", duration: "8 hrs", price: 20, availableVouchers: 0 },
        { id: "5", duration: "5 days", price: 50, availableVouchers: 0 },
        { id: "6", duration: "30 days", price: 200, availableVouchers: 0 },
      ];
      localStorage.setItem('wifiPlans', JSON.stringify(defaultPlans));
      setPlans(defaultPlans);
    }

    if (storedVouchers) {
      setVouchers(JSON.parse(storedVouchers));
    }
  }, []);

  const handleAddPlan = (newPlan: Omit<Plan, 'id' | 'availableVouchers'>) => {
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

  const handleDeletePlan = (planId: string) => {
    const updatedPlans = plans.filter(plan => plan.id !== planId);
    localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));
    setPlans(updatedPlans);
    
    // Also remove vouchers for this plan
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

  const handleVoucherUpload = (planId: string, voucherCodes: string[]) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // Get existing vouchers for this plan
    const existingVouchers = vouchers[plan.duration] || [];
    const existingCodes = new Set(existingVouchers.map(v => v.code));

    // Filter out duplicates
    const uniqueNewCodes = voucherCodes.filter(code => !existingCodes.has(code));

    if (uniqueNewCodes.length < voucherCodes.length) {
      const duplicateCount = voucherCodes.length - uniqueNewCodes.length;
      toast({
        title: "Duplicate vouchers found",
        description: `${duplicateCount} duplicate voucher(s) were skipped.`,
      });

      if (uniqueNewCodes.length === 0) {
        return; // Exit if all vouchers were duplicates
      }
    }

    const newVouchers = uniqueNewCodes.map((code, index) => ({
      id: `${planId}-${Date.now()}-${index}`,
      code,
      planId,
      isUsed: false
    }));

    // Update vouchers state
    const updatedVouchers = {
      ...vouchers,
      [plan.duration]: [...(vouchers[plan.duration] || []), ...newVouchers]
    };
    setVouchers(updatedVouchers);
    localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));

    // Update plans with new voucher count
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">WiFi Plans</h2>
        <AddPlanDialog onAddPlan={handleAddPlan} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onDelete={handleDeletePlan}
            onVoucherUpload={handleVoucherUpload}
          />
        ))}
      </div>

      <VoucherPool vouchers={vouchers} />
    </div>
  );
};

export default PlansManager;