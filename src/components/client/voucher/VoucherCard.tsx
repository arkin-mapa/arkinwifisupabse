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
      <Card className="p-4 bg-white border hover:bg-gray-50 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <code className="bg-gray-100 px-3 py-1.5 rounded-lg text-gray-800 flex-1 sm:flex-none text-center">
              {voucher.code}
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => copyToClipboard(voucher.code)}
              className="text-gray-600 hover:bg-gray-100"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onPrint(voucher)}
              className="text-gray-600 hover:bg-gray-100"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              className="text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {plan && (
            <div className="text-sm text-gray-600">
              Price: ₱{plan.price.toFixed(2)}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default VoucherCard;