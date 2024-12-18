import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Purchase } from "@/types/plans";

interface CreditPurchaseHandlerProps {
  purchase: Purchase;
  onSuccess: () => void;
  onReject: (id: string) => void;
}

export const CreditPurchaseHandler = ({ 
  purchase, 
  onSuccess, 
  onReject 
}: CreditPurchaseHandlerProps) => {
  const handleCreditTransaction = async () => {
    try {
      // Add credits to client's balance
      const { error: creditError } = await supabase
        .from('credits')
        .insert([{
          client_id: purchase.client_id,
          amount: purchase.total,
          transaction_type: 'deposit',
          reference_id: purchase.id
        }]);

      if (creditError) throw creditError;
      
      // Update purchase status
      const { error: updateError } = await supabase
        .from('purchases')
        .update({ status: 'approved' })
        .eq('id', purchase.id);

      if (updateError) throw updateError;

      onSuccess();
      toast.success("Credits added to client's balance");
    } catch (error) {
      console.error('Error processing credit transaction:', error);
      toast.error("Failed to process credit transaction");
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button
        size="sm"
        className="h-7 text-xs flex-1 bg-green-500 hover:bg-green-600"
        onClick={handleCreditTransaction}
      >
        <Check className="w-3 h-3 mr-1" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="h-7 text-xs flex-1"
        onClick={() => onReject(purchase.id)}
      >
        <X className="w-3 h-3 mr-1" />
        Reject
      </Button>
    </div>
  );
};