import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Voucher } from "@/types/plans";

const VoucherWallet = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    const storedVouchers = localStorage.getItem('clientVouchers');
    if (storedVouchers) {
      setVouchers(JSON.parse(storedVouchers));
    }
  }, []);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Voucher code copied to clipboard!");
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
      <Card className="p-6 text-center bg-white/5 border-white/10 backdrop-blur-md">
        <p className="text-white/60">No vouchers available in your wallet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedVouchers).map(([planId, planVouchers], groupIndex) => (
        <motion.div
          key={planId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.1 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3">Plan: {planId}</h3>
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
                      <code className="bg-white/10 px-3 py-1.5 rounded-lg text-white flex-1 sm:flex-none text-center">
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
                      <span className="text-sm text-yellow-400">Used</span>
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