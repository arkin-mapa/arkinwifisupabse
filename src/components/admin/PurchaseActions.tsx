import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Purchase } from "@/types/plans";

interface PurchaseActionsProps {
  purchase: Purchase;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete?: (id: string) => void;
  isUpdating?: boolean;
}

const PurchaseActions = ({ 
  purchase,
  onApprove, 
  onReject, 
  onDelete,
  isUpdating 
}: PurchaseActionsProps) => {
  const handleApprove = async () => {
    try {
      if (!purchase.client_id) {
        toast.error("Cannot process: No client ID associated with this purchase");
        return;
      }
      
      onApprove(purchase.id);
    } catch (error) {
      console.error('Error during approval:', error);
      toast.error(error instanceof Error ? error.message : "Failed to approve purchase");
    }
  };

  if (purchase.status === "pending") {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          className="h-7 w-7 bg-green-500 hover:bg-green-600 transition-colors"
          onClick={handleApprove}
          title="Approve"
          disabled={isUpdating}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-7 w-7 transition-colors"
          onClick={() => onReject(purchase.id)}
          title="Reject"
          disabled={isUpdating}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (["approved", "rejected", "cancelled"].includes(purchase.status) && onDelete) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => onDelete(purchase.id)}
        title="Delete"
        disabled={isUpdating}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    );
  }

  return null;
};

export default PurchaseActions;