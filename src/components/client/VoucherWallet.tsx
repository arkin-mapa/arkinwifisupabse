import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Voucher, Plan } from "@/types/plans";

const VoucherWallet = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

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
      const updatedPlans = localStorage.getItem('wifiPlans');
      if (updatedVouchers) setVouchers(JSON.parse(updatedVouchers));
      if (updatedPlans) setPlans(JSON.parse(updatedPlans));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Voucher code copied!");
    } catch (err) {
      toast.error("Failed to copy code. Please try again.");
    }
  };

  const deleteVoucher = (voucherId: string) => {
    const updatedVouchers = vouchers.filter(v => v.id !== voucherId);
    localStorage.setItem('clientVouchers', JSON.stringify(updatedVouchers));
    setVouchers(updatedVouchers);
    toast.success("Voucher deleted successfully");
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
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No vouchers available in your wallet.</p>
      </Card>
    );
  }

  const getPlanName = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.duration : planId;
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedVouchers).map(([planId, planVouchers], groupIndex) => (
        <motion.div
          key={planId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.1 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {getPlanName(planId)}
            </h3>
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
              {planVouchers.length} voucher{planVouchers.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="grid gap-4">
            {planVouchers.map((voucher, index) => (
              <motion.div
                key={voucher.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:bg-accent transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <code className="bg-muted px-3 py-1.5 rounded-lg flex-1 sm:flex-none text-center">
                        {voucher.code}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(voucher.code)}
                        className="hover:bg-secondary"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteVoucher(voucher.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default VoucherWallet;