import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSessionContext } from "@supabase/auth-helpers-react";
import type { Purchase } from "@/types/plans";

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
  const { session } = useSessionContext();

  const handleAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (!session?.user) {
      toast.error("You must be logged in to perform this action");
      return;
    }

    try {
      switch (action) {
        case 'approve':
          await onApprove(purchaseId);
          break;
        case 'reject':
          await onReject(purchaseId);
          break;
        case 'delete':
          await onDelete(purchaseId);
          break;
      }
    } catch (error) {
      console.error(`Error during ${action} action:`, error);
      toast.error(`Failed to ${action} purchase. Please try again.`);
    }
  };

  if (status === "pending") {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          className="h-7 w-7 bg-green-500 hover:bg-green-600 transition-colors"
          onClick={() => handleAction('approve')}
          title="Approve"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-7 w-7 transition-colors"
          onClick={() => handleAction('reject')}
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
        onClick={() => handleAction('delete')}
        title="Delete"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    );
  }

  return null;
};

export default PurchaseActions;