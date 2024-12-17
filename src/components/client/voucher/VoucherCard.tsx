import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Voucher, Plan } from "@/types/plans";

interface VoucherCardProps {
  voucher: Voucher;
  plan: Plan | undefined;
  onDelete: (id: string) => void;
  onPrint: (voucher: Voucher) => void;
}

const VoucherCard = ({ voucher, plan, onDelete, onPrint }: VoucherCardProps) => {
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Voucher code copied!");
    } catch (err) {
      toast.error("Failed to copy code. Please try again.");
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      onDelete(voucher.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-3 bg-background hover:bg-accent/5 transition-colors">
        <div className="flex flex-col gap-2">
          <code className="bg-muted px-3 py-2 rounded text-sm font-mono text-center break-all">
            {voucher.code}
          </code>
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="text-xs text-muted-foreground">
              ₱{plan?.price.toFixed(2)}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(voucher.code)}
                className="h-7 w-7 p-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPrint(voucher)}
                className="h-7 w-7 p-0"
              >
                <Printer className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default VoucherCard;