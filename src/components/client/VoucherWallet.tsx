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

    // Listen for changes in localStorage
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
      toast.success("Voucher code copied!", {
        style: { background: '#1a1b1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
    } catch (err) {
      toast.error("Failed to copy code. Please try again.", {
        style: { background: '#1a1b1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
    }
  };

  const deleteVoucher = (voucherId: string) => {
    const updatedVouchers = vouchers.filter(v => v.id !== voucherId);
    localStorage.setItem('clientVouchers', JSON.stringify(updatedVouchers));
    setVouchers(updatedVouchers);
    toast.success("Voucher deleted successfully", {
      style: { background: '#1a1b1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
    });
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
      <Card className="p-6 text-center bg-black/20 border-white/10 backdrop-blur-md">
        <p className="text-white/80">No vouchers available in your wallet.</p>
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
          className="rounded-xl bg-black/20 border border-white/10 p-6 backdrop-blur-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {getPlanName(planId)}
            </h3>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm">
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
                <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <code className="bg-black/30 px-3 py-1.5 rounded-lg text-white flex-1 sm:flex-none text-center">
                        {voucher.code}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(voucher.code)}
                        disabled={voucher.isUsed}
                        className="text-white hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteVoucher(voucher.id)}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {voucher.isUsed && (
                      <span className="text-sm text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                        Used
                      </span>
                    )}
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