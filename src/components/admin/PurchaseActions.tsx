import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Purchase } from "@/types/plans";

interface PurchaseActionsProps {
  purchaseId: number;
  status: Purchase['status'];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}

const PurchaseActions = ({
  purchaseId,
  status,
  onApprove,
  onReject,
  onDelete,
}: PurchaseActionsProps) => {
  if (status === "pending") {
    return (
      <div className="flex items-center gap-2 justify-end">
        <Button
          size="sm"
          onClick={() => onApprove(purchaseId)}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Check className="w-4 h-4 mr-1" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onReject(purchaseId)}
          className="bg-red-500 hover:bg-red-600"
        >
          <X className="w-4 h-4 mr-1" />
          Reject
        </Button>
      </div>
    );
  }

  if (status === "approved" || status === "rejected") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this purchase record?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(purchaseId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return null;
};

export default PurchaseActions;