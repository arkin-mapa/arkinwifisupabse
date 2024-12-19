import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import VoucherHeader from "./voucher/VoucherHeader";
import { fetchClientVouchers, fetchClientPlans } from "@/utils/supabaseData";
import { supabase } from "@/integrations/supabase/client";
import type { Voucher, Plan } from "@/types/plans";
import { useSession } from "@supabase/auth-helpers-react";
import { QRCodeScanner } from "./voucher/QRCodeScanner";
import { QRCodeGenerator } from "./voucher/QRCodeGenerator";
import { printPlanVouchers } from "@/utils/printUtils";
import { VoucherList } from "./voucher/VoucherList";

const VoucherWallet = () => {
  const [vouchers, setVouchers] = useState<Record<string, Voucher[]>>({});
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [selectedVouchers, setSelectedVouchers] = useState<Voucher[]>([]);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false);
  const session = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      loadData();
    }
  }, [session?.user?.id]);

  const loadData = async () => {
    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const [vouchersData, plansData] = await Promise.all([
        fetchClientVouchers(session.user.id),
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
      setSelectedVouchers([]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Failed to load vouchers");
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

      await loadData();
      toast.success("Voucher deleted successfully");
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error("Failed to delete voucher");
    }
  };

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const toggleVoucherSelection = (voucher: Voucher) => {
    setSelectedVouchers(prev => {
      const isSelected = prev.some(v => v.id === voucher.id);
      if (isSelected) {
        return prev.filter(v => v.id !== voucher.id);
      } else {
        return [...prev, voucher];
      }
    });
  };

  const handleTransferComplete = async (transferredVoucherIds: string[]) => {
    setSelectedVouchers(prev => prev.filter(v => !transferredVoucherIds.includes(v.id)));
    await loadData();
  };

  const handlePrintSelected = async () => {
    if (selectedVouchers.length === 0) {
      toast.error("Please select vouchers to print");
      return;
    }

    const planId = selectedVouchers[0].planId;
    const plan = plans[planId || ''];
    
    if (!plan) {
      toast.error("Plan not found for selected vouchers");
      return;
    }

    const success = await printPlanVouchers(selectedVouchers, plan);
    if (success) {
      toast.success("Vouchers sent to printer");
      setSelectedVouchers([]);
    } else {
      toast.error("Failed to print vouchers");
    }
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

  return (
    <Card className="mx-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <VoucherHeader
        selectedVouchers={selectedVouchers}
        onOpenQRGenerator={() => setIsQRGeneratorOpen(true)}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        onPrintSelected={handlePrintSelected}
      />
      <CardContent className="p-0">
        <VoucherList
          vouchers={vouchers}
          plans={plans}
          expandedPlans={expandedPlans}
          onTogglePlan={togglePlanExpansion}
          onDeleteVoucher={handleDeleteVoucher}
          selectedVouchers={selectedVouchers}
          onVoucherSelect={toggleVoucherSelection}
        />
      </CardContent>

      {isQRGeneratorOpen && (
        <QRCodeGenerator
          isOpen={isQRGeneratorOpen}
          onClose={() => setIsQRGeneratorOpen(false)}
          vouchers={selectedVouchers}
          onTransferComplete={handleTransferComplete}
        />
      )}

      {isQRScannerOpen && (
        <QRCodeScanner
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onTransferComplete={loadData}
        />
      )}
    </Card>
  );
};

export default VoucherWallet;