import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const mockVouchers = [
  {
    id: 1,
    code: "WIFI-123-456",
    plan: "Basic",
    expiryDate: "2024-02-21",
    isUsed: false
  },
  {
    id: 2,
    code: "WIFI-789-012",
    plan: "Standard",
    expiryDate: "2024-02-26",
    isUsed: true
  }
];

const VoucherWallet = () => {
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Voucher code copied to clipboard!");
  };

  return (
    <div className="grid gap-4">
      {mockVouchers.map((voucher) => (
        <Card key={voucher.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{voucher.plan}</p>
              <p className="text-sm text-gray-500">Expires: {voucher.expiryDate}</p>
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