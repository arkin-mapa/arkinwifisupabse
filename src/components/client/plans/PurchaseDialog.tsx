import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plans";
import type { Database } from "@/types/database.types";
import { useQuery } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type PaymentMethod = Database['public']['Tables']['purchases']['Row']['payment_method'];

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

  const { data: enabledPaymentMethods = [] } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_method_settings')
        .select('method')
        .eq('is_enabled', true);

      if (error) throw error;
      return data.map(pm => pm.method);
    }
  });

  useEffect(() => {
    loadCreditBalance();

    // Subscribe to credit changes
    const channel = supabase
      .channel('credit-balance')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credits'
        },
        () => {
          loadCreditBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  // Reset payment method if current one is disabled
  useEffect(() => {
    if (!enabledPaymentMethods.includes(purchaseDetails.paymentMethod)) {
      setPurchaseDetails({
        ...purchaseDetails,
        paymentMethod: enabledPaymentMethods[0] as PaymentMethod
      });
    }
  }, [enabledPaymentMethods, purchaseDetails.paymentMethod]);

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

          <div>
            <Label>Payment Method</Label>
            <RadioGroup
              value={purchaseDetails.paymentMethod}
              onValueChange={(value: PaymentMethod) => setPurchaseDetails({
                ...purchaseDetails,
                paymentMethod: value
              })}
              className="mt-2 space-y-2"
            >
              {enabledPaymentMethods.includes('cash') && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
              )}
              {enabledPaymentMethods.includes('gcash') && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gcash" id="gcash" />
                  <Label htmlFor="gcash">GCash</Label>
                </div>
              )}
              {enabledPaymentMethods.includes('paymaya') && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paymaya" id="paymaya" />
                  <Label htmlFor="paymaya">PayMaya</Label>
                </div>
              )}
              {enabledPaymentMethods.includes('credit') && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="credit" 
                    id="credit" 
                    disabled={!canUseCredit}
                  />
                  <Label htmlFor="credit" className={!canUseCredit ? "text-muted-foreground" : ""}>
                    Credit Balance (₱{creditBalance.toFixed(2)})
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Total Amount: ₱{totalAmount.toFixed(2)}
            </p>
          </div>

          <Button
            className="w-full"
            onClick={onSubmit}
            disabled={isPending || 
              (purchaseDetails.paymentMethod === 'credit' && !canUseCredit) ||
              !enabledPaymentMethods.includes(purchaseDetails.paymentMethod)}
          >
            {isPending ? "Processing..." : "Confirm Purchase"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};