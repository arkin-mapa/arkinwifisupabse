import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Voucher, Plan } from "@/types/plans";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface VoucherCardProps {
  voucher: Voucher;
  plan: Plan | undefined;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

const VoucherCard = ({ voucher, plan, onDelete, isSelected, onSelect }: VoucherCardProps) => {
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      
      // Mark voucher as used in both vouchers and voucher_wallet tables
      const { error: walletError } = await supabase
        .from('voucher_wallet')
        .update({ is_used: true })
        .eq('voucher_id', voucher.id);

      if (walletError) {
        throw walletError;
      }

      const { error: voucherError } = await supabase
        .from('vouchers')
        .update({ is_used: true })
        .eq('id', voucher.id);

      if (voucherError) {
        throw voucherError;
      }

      toast.success("Voucher code copied!");
    } catch (err) {
      console.error('Error:', err);
      toast.error("Failed to copy code. Please try again.");
    }
  };

  const handleDelete = () => {
    toast.promise(
      () => new Promise<void>((resolve) => {
        onDelete(voucher.id);
        resolve();
      }),
      {
        loading: 'Deleting voucher...',
        success: 'Voucher deleted successfully',
        error: 'Failed to delete voucher'
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-3 bg-white dark:bg-gray-800 hover:bg-accent/5 transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect()}
            className="translate-y-[2px]"
          />
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <code className="bg-muted px-3 py-1.5 rounded text-sm font-mono text-center break-all">
              {voucher.code}
            </code>
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground font-medium">
                ₱{plan?.price.toFixed(2)}
              </div>
              <div className="flex gap-1">
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
                  onClick={handleDelete}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default VoucherCard;