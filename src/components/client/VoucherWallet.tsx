import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import PlanGroup from "./voucher/PlanGroup";
import { fetchClientVouchers, deleteVoucher } from "@/utils/supabaseData";
import { printVoucher } from "@/utils/printUtils";
import type { Voucher } from "@/types/plans";
import { useSession } from "@supabase/auth-helpers-react";

const VoucherWallet = () => {
  const [vouchers, setVouchers] = useState<Record<string, Voucher[]>>({});
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const session = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      loadVouchers();
    }
  }, [session?.user?.id]);

  const loadVouchers = async () => {
    try {
      const vouchersData = await fetchClientVouchers();
      // Group vouchers by plan duration
      const groupedVouchers = vouchersData.reduce((acc, voucher) => {
        const planDuration = voucher.planId || 'unknown';
        if (!acc[planDuration]) {
          acc[planDuration] = [];
        }
        acc[planDuration].push(voucher);
        return acc;
      }, {} as Record<string, Voucher[]>);
      
      setVouchers(groupedVouchers);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error("Failed to load vouchers");
    }
  };

  const handlePrintVoucher = (voucher: Voucher) => {
    if (printVoucher(voucher, voucher.plan)) {
      toast.success("Printing voucher...");
    } else {
      toast.error("Failed to print voucher");
    }
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    try {
      setIsDeleting(true);
      await deleteVoucher(voucherId);
      toast.success("Voucher deleted successfully");
      await loadVouchers();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error("Failed to delete voucher");
    } finally {
      setIsDeleting(false);
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
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please log in to view your vouchers.</p>
        </CardContent>
      </Card>
    );
  }

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
              plan={planVouchers[0]?.plan}
              vouchers={planVouchers}
              isExpanded={expandedPlans[planDuration] || false}
              onToggle={() => togglePlanExpansion(planDuration)}
              onPrintVoucher={handlePrintVoucher}
              onDeleteVoucher={handleDeleteVoucher}
              isDeleting={isDeleting}
            />
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default VoucherWallet;