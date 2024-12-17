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
      <Card className="p-2 bg-background hover:bg-accent/5 transition-colors">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <code className="bg-muted px-2 py-1 rounded text-xs flex-1 text-center font-mono">
              {voucher.code}
            </code>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => copyToClipboard(voucher.code)}
                className="h-7 w-7"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onPrint(voucher)}
                className="h-7 w-7"
              >
                <Printer className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                className="h-7 w-7 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {plan && (
            <div className="text-xs text-muted-foreground text-right">
              Price: ₱{plan.price.toFixed(2)}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default VoucherCard;