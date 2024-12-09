import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import type { Voucher, Plan } from "@/types/plans";
import { printVoucher, printAllVouchers } from "@/utils/printUtils";
import PlanGroup from "./voucher/PlanGroup";

const VoucherWallet = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedVouchers = localStorage.getItem('clientVouchers');
    const storedPlans = localStorage.getItem('wifiPlans');
    
    if (storedVouchers) {
      setVouchers(JSON.parse(storedVouchers));
    }
    if (storedPlans) {
      setPlans(JSON.parse(storedPlans));
    }

    const handleStorageChange = () => {
      const updatedVouchers = localStorage.getItem('clientVouchers');
      if (updatedVouchers) {
        setVouchers(JSON.parse(updatedVouchers));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const deleteVoucher = (voucherId: string) => {
    try {
      const updatedVouchers = vouchers.filter(v => v.id !== voucherId);
      setVouchers(updatedVouchers);
      localStorage.setItem('clientVouchers', JSON.stringify(updatedVouchers));
      toast.success("Voucher deleted successfully");
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error("Failed to delete voucher. Please try again.");
    }
  };

  const handlePrintVoucher = (voucher: Voucher) => {
    const plan = plans.find(p => p.id === voucher.planId);
    if (!printVoucher(voucher, plan)) {
      toast.error("Unable to open print window. Please check your popup settings.");
    }
  };

  const handlePrintAllVouchers = () => {
    if (!printAllVouchers(vouchers, plans)) {
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

  if (vouchers.length === 0) {
    return (
      <Card className="p-6 text-center border">
        <p className="text-gray-600">No vouchers available in your wallet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={handlePrintAllVouchers}
          className="mb-4"
          variant="outline"
        >
          <PrinterIcon className="mr-2 h-4 w-4" />
          Print All Vouchers
        </Button>
      </div>

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