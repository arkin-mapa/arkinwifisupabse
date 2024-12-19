import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plans";
import type { Database } from "@/types/database.types";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerDetails } from "./purchase/CustomerDetails";
import { PaymentMethodSelector } from "./purchase/PaymentMethodSelector";

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
      <DialogContent className="max-w-[calc(100vw-2rem)] w-full sm:max-w-[425px] p-0 gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-0 shrink-0">
          <DialogTitle className="text-xl font-bold">Purchase {selectedPlan?.duration} Plan</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Please fill in your details to complete the purchase.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <CustomerDetails
              customerName={purchaseDetails.customerName}
              quantity={purchaseDetails.quantity}
              maxQuantity={selectedPlan?.availableVouchers || 1}
              onCustomerNameChange={(value) => setPurchaseDetails({
                ...purchaseDetails,
                customerName: value
              })}
              onQuantityChange={(value) => setPurchaseDetails({
                ...purchaseDetails,
                quantity: value
              })}
            />

            <PaymentMethodSelector
              selectedMethod={purchaseDetails.paymentMethod}
              onMethodChange={(value) => setPurchaseDetails({
                ...purchaseDetails,
                paymentMethod: value
              })}
              enabledMethods={enabledPaymentMethods}
              creditBalance={creditBalance}
              totalAmount={totalAmount}
            />

            <div className="pt-2 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">₱{totalAmount.toFixed(2)}</span>
              </div>

              <Button
                className="w-full h-11"
                onClick={onSubmit}
                disabled={isPending || 
                  (purchaseDetails.paymentMethod === 'credit' && creditBalance < totalAmount) ||
                  !enabledPaymentMethods.includes(purchaseDetails.paymentMethod)}
              >
                {isPending ? "Processing..." : "Confirm Purchase"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};