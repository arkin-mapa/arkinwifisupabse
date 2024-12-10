import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import PlanGroup from "./voucher/PlanGroup";
import { fetchClientVouchers } from "@/utils/supabaseData";
import type { Voucher } from "@/types/plans";

const VoucherWallet = () => {
  const [vouchers, setVouchers] = useState<Record<string, Voucher[]>>({});
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const vouchersData = await fetchClientVouchers();
      setVouchers(vouchersData);
    } catch (error) {
      console.error('Error loading vouchers:', error);
    }
  };

  const handlePrintVoucher = (voucher: Voucher) => {
    // Implementation for printing voucher
    console.log('Printing voucher:', voucher);
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    try {
      // Implementation for deleting voucher
      await loadVouchers(); // Reload vouchers after deletion
    } catch (error) {
      console.error('Error deleting voucher:', error);
    }
  };

  const togglePlanExpansion = (planDuration: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planDuration]: !prev[planDuration]
    }));
  };

  if (!vouchers || Object.keys(vouchers).length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No vouchers available in your wallet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Your Vouchers</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {Object.entries(vouchers).map(([planDuration, planVouchers]) => (
            <PlanGroup
              key={planDuration}
              planId={planDuration}
              plan={undefined}
              vouchers={planVouchers}
              isExpanded={expandedPlans[planDuration] || false}
              onToggle={() => togglePlanExpansion(planDuration)}
              onPrintVoucher={handlePrintVoucher}
              onDeleteVoucher={handleDeleteVoucher}
            />
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default VoucherWallet;