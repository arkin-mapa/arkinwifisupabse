import { Card } from "@/components/ui/card";
import { useVouchers } from "@/hooks/useVouchers";
import { usePlans } from "@/hooks/usePlans";
import { toast } from "sonner";
import { printVoucher } from "@/utils/printUtils";
import { supabase } from "@/integrations/supabase/client";
import PlanGroup from "./voucher/PlanGroup";
import { useState } from "react";

const VoucherWallet = () => {
  const { data: vouchers = [] } = useVouchers();
  const { data: plans = [] } = usePlans();
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  const deleteVoucher = async (voucherId: string) => {
    try {
      const { error } = await supabase
        .from("vouchers")
        .delete()
        .eq("id", voucherId);

      if (error) throw error;
      toast.success("Voucher deleted successfully");
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error("Failed to delete voucher. Please try again.");
    }
  };

  const handlePrintVoucher = (voucher: any) => {
    const plan = plans.find(p => p.id === voucher.planId);
    if (!printVoucher(voucher, plan)) {
      toast.error("Unable to open print window. Please check your popup settings.");
    }
  };

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  // Group vouchers by plan
  const groupedVouchers = vouchers.reduce((acc, voucher) => {
    if (!acc[voucher.planId]) {
      acc[voucher.planId] = [];
    }
    acc[voucher.planId].push(voucher);
    return acc;
  }, {} as Record<string, typeof vouchers>);

  if (vouchers.length === 0) {
    return (
      <Card className="p-6 text-center border">
        <p className="text-gray-600">No vouchers available in your wallet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedVouchers).map(([planId, planVouchers]) => (
        <PlanGroup
          key={planId}
          planId={planId}
          plan={plans.find(p => p.id === planId)}
          vouchers={planVouchers}
          isExpanded={expandedPlans[planId]}
          onToggle={() => togglePlanExpansion(planId)}
          onDeleteVoucher={deleteVoucher}
          onPrintVoucher={handlePrintVoucher}
        />
      ))}
    </div>
  );
};

export default VoucherWallet;