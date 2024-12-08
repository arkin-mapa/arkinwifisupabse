import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
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

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Voucher code copied to clipboard!");
  };

  if (vouchers.length === 0) {
    return (
      <Card className="p-6 text-center bg-white/5 border-white/10 backdrop-blur-md">
        <p className="text-white/60">No vouchers available in your wallet.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {vouchers.map((voucher, index) => (
        <motion.div
          key={voucher.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-semibold text-white">Plan: {voucher.planId}</p>
              </div>
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
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default VoucherWallet;