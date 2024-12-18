import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plans";
import type { Database } from "@/types/database.types";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";

type PaymentMethod = Database['public']['Enums']['payment_method'];

interface PurchaseDialogProps {
  selectedPlan: Plan | null;
  purchaseDetails: {
    customerName: string;
    quantity: number;
    paymentMethod: PaymentMethod;
  };
  setPurchaseDetails: (details: {
    customerName: string;
    quantity: number;
    paymentMethod: PaymentMethod;
  }) => void;
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

export const PurchaseDialog = ({
  selectedPlan,
  purchaseDetails,
  setPurchaseDetails,
  onClose,
  onSubmit,
  isPending
}: PurchaseDialogProps) => {
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const { enabledPaymentMethods, getMethodLabel } = usePaymentMethods();

  useEffect(() => {
    loadCreditBalance();
  }, []);

  const loadCreditBalance = async () => {
    try {
      const { data: credits, error } = await supabase
        .from('credits')
        .select('amount, transaction_type');

      if (error) throw error;

      const total = credits?.reduce((acc, curr) => {
        return curr.transaction_type === 'deposit' 
          ? acc + Number(curr.amount) 
          : acc - Number(curr.amount);
      }, 0) || 0;

      setCreditBalance(total);
    } catch (error) {
      console.error('Error loading credit balance:', error);
    }
  };

  const totalAmount = (selectedPlan?.price || 0) * purchaseDetails.quantity;
  const canUseCredit = creditBalance >= totalAmount;

  // Filter payment methods based on credit balance
  const availablePaymentMethods = enabledPaymentMethods.filter(method => 
    method.method !== 'credit' || (method.method === 'credit' && canUseCredit)
  );

  return (
    <Dialog open={selectedPlan !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase {selectedPlan?.duration} Plan</DialogTitle>
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
              onChange={(e) => setPurchaseDetails({
                ...purchaseDetails,
                customerName: e.target.value
              })}
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
              max={selectedPlan?.availableVouchers || 1}
              value={purchaseDetails.quantity}
              onChange={(e) => setPurchaseDetails({
                ...purchaseDetails,
                quantity: parseInt(e.target.value)
              })}
              className="mt-1"
            />
          </div>

          {availablePaymentMethods.length > 0 && (
            <PaymentMethodSelector
              paymentMethods={availablePaymentMethods}
              currentMethod={purchaseDetails.paymentMethod}
              creditBalance={creditBalance}
              onMethodChange={(method) => setPurchaseDetails({
                ...purchaseDetails,
                paymentMethod: method
              })}
              getMethodLabel={getMethodLabel}
            />
          )}

          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Total Amount: ₱{totalAmount.toFixed(2)}
            </p>
          </div>

          <Button
            className="w-full"
            onClick={onSubmit}
            disabled={isPending || availablePaymentMethods.length === 0}
          >
            {isPending ? "Processing..." : "Confirm Purchase"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};