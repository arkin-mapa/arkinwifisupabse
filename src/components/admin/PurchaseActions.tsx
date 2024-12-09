import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Purchase } from "@/types/plans";
import { supabase } from "@/integrations/supabase/client";

interface PurchaseActionsProps {
  purchaseId: string;
  status: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

const PurchaseActions = ({ 
  purchaseId, 
  status, 
  onApprove, 
  onReject, 
  onDelete 
}: PurchaseActionsProps) => {
  const handleApprove = async (id: string) => {
    try {
      // Get the purchase details
      const { data: purchase, error: fetchError } = await supabase
        .from("purchases")
        .select("*")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;
      if (!purchase) {
        toast.error("Purchase not found");
        return;
      }

      // Update purchase status
      onApprove(id);
    } catch (error) {
      console.error('Error during purchase approval:', error);
      toast.error(error instanceof Error ? error.message : "Failed to approve purchase. Please try again.");
    }
  };

  if (status === "pending") {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          className="h-7 w-7 bg-green-500 hover:bg-green-600 transition-colors"
          onClick={() => handleApprove(purchaseId)}
          title="Approve"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-7 w-7 transition-colors"
          onClick={() => onReject(purchaseId)}
          title="Reject"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (status === "approved" || status === "rejected" || status === "cancelled") {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => onDelete(purchaseId)}
        title="Delete"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    );
  }

  return null;
};

export default PurchaseActions;