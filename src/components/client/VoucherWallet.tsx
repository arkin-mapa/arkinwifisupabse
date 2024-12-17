import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import PlanGroup from "./voucher/PlanGroup";
import { fetchClientVouchers, fetchClientPlans } from "@/utils/supabaseData";
import { printVoucher } from "@/utils/printUtils";
import { supabase } from "@/integrations/supabase/client";
import type { Voucher, Plan } from "@/types/plans";
import { useSession } from "@supabase/auth-helpers-react";

const VoucherWallet = () => {
  const [vouchers, setVouchers] = useState<Record<string, Voucher[]>>({});
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const session = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      loadData();
    }
  }, [session?.user?.id]);

  const loadData = async () => {
    try {
      const [vouchersData, plansData] = await Promise.all([
        fetchClientVouchers(),
        fetchClientPlans()
      ]);

      const plansLookup = plansData.reduce((acc, plan) => {
        acc[plan.id] = plan;
        return acc;
      }, {} as Record<string, Plan>);
      
      const groupedVouchers = vouchersData.reduce((acc, voucher) => {
        const planId = voucher.planId || 'unknown';
        if (!acc[planId]) {
          acc[planId] = [];
        }
        acc[planId].push(voucher);
        return acc;
      }, {} as Record<string, Voucher[]>);
      
      setVouchers(groupedVouchers);
      setPlans(plansLookup);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Failed to load vouchers");
    }
  };

  const handlePrintVoucher = (voucher: Voucher) => {
    const plan = plans[voucher.planId];
    if (!printVoucher(voucher, plan)) {
      toast.error("Unable to open print window. Please check your popup settings.");
    } else {
      toast.success("Print window opened successfully");
    }
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    try {
      const { error: walletError } = await supabase
        .from('voucher_wallet')
        .delete()
        .eq('voucher_id', voucherId);

      if (walletError) {
        throw walletError;
      }

      const { error: voucherError } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', voucherId);

      if (voucherError) {
        throw voucherError;
      }

      toast.success("Voucher deleted successfully");
      await loadData();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error("Failed to delete voucher");
    }
  };

  const togglePlanExpansion = (planDuration: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planDuration]: !prev[planDuration]
    }));
  };

  if (!session) {
    return (
      <Card className="mx-4">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please log in to view your vouchers.</p>
        </CardContent>
      </Card>
    );
  }

  if (!vouchers || Object.keys(vouchers).length === 0) {
    return (
      <Card className="mx-4">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No vouchers available in your wallet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Your Vouchers</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-3 px-4 pb-4">
            {Object.entries(vouchers).map(([planId, planVouchers]) => (
              <PlanGroup
                key={planId}
                planId={planId}
                plan={plans[planId]}
                vouchers={planVouchers}
                isExpanded={expandedPlans[planId] || false}
                onToggle={() => togglePlanExpansion(planId)}
                onPrintVoucher={handlePrintVoucher}
                onDeleteVoucher={handleDeleteVoucher}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default VoucherWallet;