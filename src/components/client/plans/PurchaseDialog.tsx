import { Dialog, DialogContent } from "@/components/ui/dialog";
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
      <DialogContent className="max-w-[calc(100vw-2rem)] w-full sm:max-w-[425px] p-0 gap-0 max-h-[65vh] flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="px-4 py-3 border-b flex flex-col items-center space-y-0.5">
          <h3 className="text-base font-medium">{selectedPlan?.duration} Plan</h3>
          <p className="text-sm text-muted-foreground">₱{selectedPlan?.price.toFixed(2)}</p>
        </div>

        <ScrollArea className="flex-grow overflow-y-auto px-4 py-3">
          <div className="space-y-4">
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
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-gray-50 dark:bg-gray-900 rounded-b-lg space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-semibold">₱{totalAmount.toFixed(2)}</span>
          </div>

          <Button
            className="w-full h-9"
            onClick={onSubmit}
            disabled={isPending || 
              (purchaseDetails.paymentMethod === 'credit' && creditBalance < totalAmount) ||
              !enabledPaymentMethods.includes(purchaseDetails.paymentMethod)}
          >
            {isPending ? "Processing..." : "Confirm Purchase"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
