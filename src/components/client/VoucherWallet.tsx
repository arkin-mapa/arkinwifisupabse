import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { Voucher } from "@/types/plans";
import { toast } from "sonner";
import { printVoucher } from "@/utils/printUtils";
import PlanGroup from "./voucher/PlanGroup";
import { fetchClientVouchers } from "@/utils/supabaseData";
import { useQuery } from "@tanstack/react-query";

const VoucherWallet = () => {
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ['clientVouchers'],
    queryFn: fetchClientVouchers
  });

  const handlePrintVoucher = (voucher: Voucher) => {
    if (!printVoucher(voucher)) {
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
  }, {} as Record<string, Voucher[]>);

  if (isLoading) {
    return <div className="text-center">Loading vouchers...</div>;
  }

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
          vouchers={planVouchers}
          isExpanded={expandedPlans[planId]}
          onToggle={() => togglePlanExpansion(planId)}
          onPrintVoucher={handlePrintVoucher}
          onDeleteVoucher={() => {}}
          plan={undefined}
        />
      ))}
    </div>
  );
};

export default VoucherWallet;