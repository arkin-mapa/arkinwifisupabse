import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import type { Voucher } from "@/types/plans";

const VoucherWallet = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    // Load vouchers from localStorage
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
      <Card className="p-4">
        <p className="text-muted-foreground">No vouchers available in your wallet.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {vouchers.map((voucher) => (
        <Card key={voucher.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Plan: {voucher.planId}</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded">
                {voucher.code}
              </code>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => copyToClipboard(voucher.code)}
                disabled={voucher.isUsed}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default VoucherWallet;