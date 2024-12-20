import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Voucher, Plan } from "@/types/plans";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

interface VoucherCardProps {
  voucher: Voucher;
  plan: Plan | undefined;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

const VoucherCard = ({ voucher, plan, onDelete, isSelected, onSelect }: VoucherCardProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`p-3 bg-white dark:bg-gray-800 hover:bg-accent/5 transition-colors ${
          voucher.isUsed ? 'opacity-50' : ''
        } ${isSelected ? 'ring-2 ring-primary' : ''}`}>
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => !voucher.isUsed && onSelect()}
              disabled={voucher.isUsed}
              className="translate-y-[2px]"
            />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <code 
                className={`px-3 py-1.5 rounded text-sm font-mono text-center break-all cursor-pointer transition-colors ${
                  voucher.isUsed 
                    ? 'bg-muted hover:bg-muted/80' 
                    : 'bg-green-800 hover:bg-green-700 text-white'
                }`}
                onClick={() => !voucher.isUsed && setShowConfirmDialog(true)}
              >
                {voucher.code}
              </code>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground font-medium">
                  ₱{plan?.price.toFixed(2)}
                </div>
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copy and Mark as Used?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will copy the voucher code and mark it as used. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              copyToClipboard(voucher.code);
              setShowConfirmDialog(false);
            }}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VoucherCard;
