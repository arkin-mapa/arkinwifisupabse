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

  // Load plans from localStorage on component mount
  useEffect(() => {
    const storedPlans = localStorage.getItem('wifiPlans');
    if (storedPlans) {
      setPlans(JSON.parse(storedPlans));
    } else {
      // Initialize with default plans if none exist
      const defaultPlans: Plan[] = [
        { id: "1", duration: "2 hrs", price: 5, availableVouchers: 93 },
        { id: "2", duration: "4 hrs", price: 10, availableVouchers: 100 },
        { id: "3", duration: "6 hrs", price: 15, availableVouchers: 100 },
        { id: "4", duration: "8 hrs", price: 20, availableVouchers: 100 },
        { id: "5", duration: "5 days", price: 50, availableVouchers: 0 },
        { id: "6", duration: "30 days", price: 200, availableVouchers: 95 },
      ];
      localStorage.setItem('wifiPlans', JSON.stringify(defaultPlans));
      setPlans(defaultPlans);
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
    
    toast({
      title: "Plan deleted",
      description: "The plan has been removed successfully.",
    });
  };

  const handleVoucherUpload = (planId: string, voucherCodes: string[]) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const newVouchers = voucherCodes.map((code, index) => ({
      id: `${planId}-${Date.now()}-${index}`,
      code,
      planId,
      isUsed: false
    }));

    // Update vouchers state
    setVouchers(prev => ({
      ...prev,
      [plan.duration]: [...(prev[plan.duration] || []), ...newVouchers]
    }));

    // Update plans with new voucher count
    const updatedPlans = plans.map(p => 
      p.id === planId 
        ? { ...p, availableVouchers: p.availableVouchers + voucherCodes.length }
        : p
    );
    
    localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));
    setPlans(updatedPlans);

    toast({
      title: "Vouchers uploaded",
      description: `${voucherCodes.length} vouchers added to ${plan.duration} plan`,
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