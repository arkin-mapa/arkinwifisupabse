import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface PurchaseActionsProps {
  purchaseId: number;
  status: string;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const PurchaseActions = ({ purchaseId, status, onApprove, onReject }: PurchaseActionsProps) => {
  if (status !== "pending") return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="bg-green-500 hover:bg-green-600 transition-colors"
        onClick={() => onApprove(purchaseId)}
      >
        <Check className="w-4 h-4 mr-1" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="transition-colors"
        onClick={() => onReject(purchaseId)}
      >
        <X className="w-4 h-4 mr-1" />
        Reject
      </Button>
    </div>
  );
};

export default PurchaseActions;