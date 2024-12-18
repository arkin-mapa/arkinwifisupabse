import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plans";
import type { Database } from "@/types/database.types";

type PaymentMethod = Database['public']['Enums']['payment_method'];

interface PaymentMethodSetting {
  method: PaymentMethod;
  is_enabled: boolean;
}

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
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<PaymentMethodSetting[]>([]);

  useEffect(() => {
    loadCreditBalance();
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    // Set credit as default payment method if it's enabled and user has sufficient balance
    const creditMethod = enabledPaymentMethods.find(m => m.method === 'credit');
    if (creditMethod?.is_enabled && canUseCredit) {
      setPurchaseDetails({
        ...purchaseDetails,
        paymentMethod: 'credit'
      });
    } else {
      // Otherwise, set the first enabled payment method as default
      const firstEnabled = enabledPaymentMethods.find(m => m.is_enabled);
      if (firstEnabled) {
        setPurchaseDetails({
          ...purchaseDetails,
          paymentMethod: firstEnabled.method
        });
      }
    }
  }, [enabledPaymentMethods]);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_method_settings')
        .select('method, is_enabled')
        .order('method');

      if (error) throw error;
      setEnabledPaymentMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

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

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'gcash':
        return 'GCash';
      case 'paymaya':
        return 'PayMaya';
      case 'credit':
        return 'Credit Balance';
      default:
        return method;
    }
  };

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
              {enabledPaymentMethods
                .filter(method => method.is_enabled && (method.method !== 'credit' || canUseCredit))
                .map(method => (
                  <div key={method.method} className="flex items-center space-x-2">
                    <RadioGroupItem value={method.method} id={method.method} />
                    <Label htmlFor={method.method}>
                      {getMethodLabel(method.method)}
                      {method.method === 'credit' && ` (₱${creditBalance.toFixed(2)})`}
                    </Label>
                  </div>
                ))}
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
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Confirm Purchase"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};