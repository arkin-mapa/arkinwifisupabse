import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Copy, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Voucher, Plan } from "@/types/plans";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

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
      
      // Update both wallet and voucher tables
      const updates = await Promise.all([
        supabase
          .from('voucher_wallet')
          .update({ is_used: true })
          .eq('voucher_id', voucher.id),
        
        supabase
          .from('vouchers')
          .update({ is_used: true })
          .eq('id', voucher.id)
      ]);

      const [walletError, voucherError] = updates.map(update => update.error);

      if (walletError) {
        console.error('Error updating voucher_wallet:', walletError);
        throw walletError;
      }

      if (voucherError) {
        console.error('Error updating vouchers:', voucherError);
        throw voucherError;
      }

      toast.success("Voucher code copied and marked as used!");
      onSelect(); // Trigger re-render
    } catch (err) {
      console.error('Error:', err);
      toast.error("Failed to copy code or mark as used. Please try again.");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className={`relative p-3 backdrop-blur-sm transition-all duration-300 ${
            voucher.isUsed 
              ? 'bg-gray-50/80 dark:bg-gray-800/50' 
              : 'bg-white/80 hover:bg-purple-50/80 dark:bg-gray-800/80 dark:hover:bg-purple-900/50'
          } ${isSelected ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''}`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => !voucher.isUsed && onSelect()}
              disabled={voucher.isUsed}
              className="translate-y-[2px]"
            />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div 
                className={`group relative px-3 py-1.5 rounded font-mono text-center break-all cursor-pointer transition-all ${
                  voucher.isUsed 
                    ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white shadow-sm'
                }`}
                onClick={() => !voucher.isUsed && setShowConfirmDialog(true)}
              >
                <code className="text-sm">{voucher.code}</code>
                {!voucher.isUsed && (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Copy className="h-4 w-4 text-white" />
                  </div>
                )}
                {voucher.isUsed && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  ₱{plan?.price.toFixed(2)}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(voucher.id)}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
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