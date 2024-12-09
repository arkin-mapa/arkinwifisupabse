import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import PlanCard from "./PlanCard";
import VoucherPool from "./VoucherPool";
import AddPlanDialog from "./AddPlanDialog";
import { fetchPlans, createPlan, deletePlan, fetchVouchers, addVouchers } from "@/utils/supabaseData";
import type { Plan, Voucher } from "@/types/plans";

const PlansManager = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [vouchers, setVouchers] = useState<Record<string, Voucher[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, vouchersData] = await Promise.all([
        fetchPlans(),
        fetchVouchers()
      ]);

      // Transform plans data to include available vouchers count
      const plansWithCounts = plansData.map(plan => ({
        ...plan,
        availableVouchers: (vouchersData[plan.duration] || []).filter(v => !v.isUsed).length
      }));

      setPlans(plansWithCounts);
      setVouchers(vouchersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load plans and vouchers",
        variant: "destructive"
      });
    }
  };

  const handleAddPlan = async (newPlan: Omit<Plan, 'id' | 'availableVouchers'>) => {
    try {
      await createPlan(newPlan);
      await loadData(); // Reload all data
      
      toast({
        title: "Success",
        description: "New plan added successfully",
      });
    } catch (error) {
      console.error('Error adding plan:', error);
      toast({
        title: "Error",
        description: "Failed to add new plan",
        variant: "destructive"
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePlan(planId);
      await loadData(); // Reload all data
      
      toast({
        title: "Plan deleted",
        description: "The plan has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive"
      });
    }
  };

  const handleVoucherExtracted = async (planId: string, voucherCodes: string[]) => {
    try {
      await addVouchers(planId, voucherCodes);
      await loadData(); // Reload all data

      toast({
        title: "Vouchers uploaded",
        description: `${voucherCodes.length} new vouchers added successfully`,
      });
    } catch (error) {
      console.error('Error adding vouchers:', error);
      toast({
        title: "Error",
        description: "Failed to add vouchers",
        variant: "destructive"
      });
    }
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
            onVoucherExtracted={handleVoucherExtracted}
          />
        ))}
      </div>

      <VoucherPool vouchers={vouchers} />
    </div>
  );
};

export default PlansManager;