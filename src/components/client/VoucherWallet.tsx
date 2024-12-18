import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import PlanGroup from "./voucher/PlanGroup";
import { fetchClientVouchers, fetchClientPlans } from "@/utils/supabaseData";
import { supabase } from "@/integrations/supabase/client";
import type { Voucher, Plan } from "@/types/plans";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { QrCode, Printer, Wallet } from "lucide-react";
import { QRCodeScanner } from "./voucher/QRCodeScanner";
import { QRCodeGenerator } from "./voucher/QRCodeGenerator";
import { printVoucher, printPlanVouchers } from "@/utils/printUtils";

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

  const handlePrintSelected = async () => {
    if (selectedVouchers.length === 0) {
      toast.error("Please select vouchers to print");
      return;
    }

    try {
      for (const voucher of selectedVouchers) {
        await printVoucher(voucher, plans[voucher.planId || '']);
      }
      toast.success("Selected vouchers sent to printer");
    } catch (error) {
      toast.error("Failed to print vouchers");
    }
  };

  const handlePrintAll = async () => {
    try {
      for (const [planId, planVouchers] of Object.entries(vouchers)) {
        await printPlanVouchers(planVouchers, plans[planId]);
      }
      toast.success("All vouchers sent to printer");
    } catch (error) {
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
      <CardHeader className="pb-3 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Your Vouchers</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintSelected}
              disabled={selectedVouchers.length === 0}
              className="hidden sm:flex"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintAll}
              disabled={Object.keys(vouchers).length === 0}
              className="hidden sm:flex"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsQRGeneratorOpen(true)}
            disabled={selectedVouchers.length === 0}
            className="flex-1 sm:flex-none"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Share ({selectedVouchers.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsQRScannerOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Scan QR
          </Button>
          <div className="flex gap-2 w-full sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintSelected}
              disabled={selectedVouchers.length === 0}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintAll}
              disabled={Object.keys(vouchers).length === 0}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-3 px-4 pb-4">
            {Object.keys(vouchers).length > 0 ? (
              Object.entries(vouchers).map(([planId, planVouchers]) => (
                <PlanGroup
                  key={planId}
                  planId={planId}
                  plan={plans[planId]}
                  vouchers={planVouchers}
                  isExpanded={expandedPlans[planId] || false}
                  onToggle={() => togglePlanExpansion(planId)}
                  onDeleteVoucher={handleDeleteVoucher}
                  selectedVouchers={selectedVouchers}
                  onVoucherSelect={toggleVoucherSelection}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No vouchers in your wallet.</p>
                <p className="mt-2">Scan a QR code to receive vouchers.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {isQRGeneratorOpen && (
        <QRCodeGenerator
          isOpen={isQRGeneratorOpen}
          onClose={() => setIsQRGeneratorOpen(false)}
          vouchers={selectedVouchers}
          onTransferComplete={() => {
            loadData();
            setIsQRGeneratorOpen(false);
          }}
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