import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/types/plans";

interface PurchaseDialogProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  purchaseDetails: {
    customerName: string;
    quantity: number;
    paymentMethod: string;
  };
  onPurchaseDetailsChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export const PurchaseDialog = ({
  plan,
  isOpen,
  onClose,
  purchaseDetails,
  onPurchaseDetailsChange,
  onSubmit,
  isProcessing
}: PurchaseDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase {plan?.duration} Plan</DialogTitle>
          <DialogDescription>
            Please fill in your details to complete the purchase.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerName">Your Name</Label>
            <Input
              id="customerName"
              value={purchaseDetails.customerName}
              onChange={(e) => onPurchaseDetailsChange("customerName", e.target.value)}
              placeholder="Enter your name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={plan?.availableVouchers || 1}
              value={purchaseDetails.quantity}
              onChange={(e) => onPurchaseDetailsChange("quantity", parseInt(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Payment Method</Label>
            <RadioGroup
              value={purchaseDetails.paymentMethod}
              onValueChange={(value) => onPurchaseDetailsChange("paymentMethod", value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gcash" id="gcash" />
                <Label htmlFor="gcash">GCash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paymaya" id="paymaya" />
                <Label htmlFor="paymaya">PayMaya</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="pt-4">
            <Button
              className="w-full"
              onClick={onSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm Purchase"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};