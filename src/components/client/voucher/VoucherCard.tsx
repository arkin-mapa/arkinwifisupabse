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
import { Badge } from "@/components/ui/badge";

interface VoucherCardProps {
  voucher: Voucher;
  plan: Plan | undefined;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

const VoucherCard = ({ voucher, plan, onDelete, isSelected, onSelect }: VoucherCardProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      
      const { error: walletError } = await supabase
        .from('voucher_wallet')
        .update({ is_used: true })
        .eq('voucher_id', voucher.id);

      if (walletError) throw walletError;

      const { error: voucherError } = await supabase
        .from('vouchers')
        .update({ is_used: true })
        .eq('id', voucher.id);

      if (voucherError) throw voucherError;

      setIsCopied(true);
      toast.success("Voucher code copied and marked as used!");
      setTimeout(() => setIsCopied(false), 3000);
      onSelect(); // Trigger re-render
    } catch (err) {
      console.error('Error:', err);
      toast.error("Failed to copy code or mark as used");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="group relative"
      >
        <Card className={`p-3 bg-white/50 backdrop-blur-sm hover:bg-accent/5 transition-all duration-200
          ${voucher.isUsed ? 'opacity-60' : ''} 
          ${isSelected ? 'ring-2 ring-primary' : ''}`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => !voucher.isUsed && onSelect()}
              disabled={voucher.isUsed}
              className="translate-y-[2px]"
            />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="relative group/code">
                <Badge
                  variant={voucher.isUsed ? "secondary" : "default"}
                  className="w-full justify-between py-2 px-3 font-mono text-xs cursor-pointer
                    transition-all duration-200 hover:shadow-sm"
                  onClick={() => !voucher.isUsed && setShowConfirmDialog(true)}
                >
                  {voucher.code}
                  {!voucher.isUsed && (
                    <Copy className="h-3.5 w-3.5 opacity-0 group-hover/code:opacity-100 transition-opacity ml-2" />
                  )}
                </Badge>
                {isCopied && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </motion.div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground font-medium">
                  ₱{plan?.price.toFixed(2)}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(voucher.id)}
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity 
                    text-destructive hover:text-destructive"
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