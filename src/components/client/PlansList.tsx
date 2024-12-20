import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import type { Plan } from "@/types/plans";
import { motion } from "framer-motion";
import { fetchClientPlans, createPurchase } from "@/utils/supabaseData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/database.types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PlanCard } from "./plans/PlanCard";
import { PurchaseDialog } from "./plans/PurchaseDialog";

type PaymentMethod = Database['public']['Tables']['purchases']['Row']['payment_method'];
type PurchaseStatus = Database['public']['Tables']['purchases']['Row']['status'];

const PlansList = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState({
    customerName: "",
    quantity: 1,
    paymentMethod: 'cash' as PaymentMethod
  });

  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['clientPlans'],
    queryFn: fetchClientPlans,
    refetchInterval: 5000
  });

  const purchaseMutation = useMutation({
    mutationFn: async (plan: Plan) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("Please log in to make a purchase");
      }

      const clientId = session.session.user.id;

      if (purchaseDetails.paymentMethod === 'credit') {
        // For credit payments, directly create voucher wallet entries
        const { data: availableVouchers, error: voucherError } = await supabase
          .from('vouchers')
          .select('id')
          .eq('plan_id', plan.id)
          .eq('is_used', false)
          .limit(purchaseDetails.quantity);

        if (voucherError) throw voucherError;

        if (!availableVouchers || availableVouchers.length < purchaseDetails.quantity) {
          throw new Error('Not enough vouchers available');
        }

        // Create purchase record
        const { data: purchase, error: purchaseError } = await supabase
          .from('purchases')
          .insert({
            customer_name: purchaseDetails.customerName,
            client_id: clientId,
            plan_id: plan.id,
            quantity: purchaseDetails.quantity,
            total_amount: plan.price * purchaseDetails.quantity,
            payment_method: purchaseDetails.paymentMethod,
            status: 'approved' as PurchaseStatus
          })
          .select()
          .single();

        if (purchaseError) throw purchaseError;

        // Create credit transaction (deduction)
        const { error: creditError } = await supabase
          .from('credits')
          .insert({
            client_id: clientId,
            amount: plan.price * purchaseDetails.quantity,
            transaction_type: 'purchase',
            reference_id: purchase.id
          });

        if (creditError) throw creditError;

        // Use the transfer_vouchers_to_client function to handle the transfer
        const { error: transferError } = await supabase
          .rpc('transfer_vouchers_to_client', {
            p_client_id: clientId,
            p_voucher_ids: availableVouchers.map(v => v.id)
          });

        if (transferError) throw transferError;

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['clientPlans'] });
        return null;
      }

      // For non-credit payments, create a regular purchase
      return createPurchase({
        customerName: purchaseDetails.customerName,
        planId: plan.id,
        quantity: purchaseDetails.quantity,
        totalAmount: plan.price * purchaseDetails.quantity,
        paymentMethod: purchaseDetails.paymentMethod
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientPlans'] });
      toast.success(
        purchaseDetails.paymentMethod === 'credit' 
          ? "Vouchers added to your wallet!" 
          : "Purchase request submitted successfully!"
      );
      setSelectedPlan(null);
      setPurchaseDetails({
        customerName: "",
        quantity: 1,
        paymentMethod: 'cash'
      });
    },
    onError: (error) => {
      console.error('Purchase error:', error);
      if (error instanceof Error && error.message === "Please log in to make a purchase") {
        toast.error("Please log in to make a purchase");
        navigate("/auth");
      } else {
        toast.error("Failed to process purchase. Please try again.");
      }
    }
  });

  if (isLoading) {
    return <div className="text-center p-4">Loading plans...</div>;
  }

  return (
    <div className="space-y-4 px-4">
      <div className="grid grid-cols-1 gap-4">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={index}
            onPurchase={() => setSelectedPlan(plan)}
            isPending={purchaseMutation.isPending}
          />
        ))}
      </div>

      <PurchaseDialog
        selectedPlan={selectedPlan}
        purchaseDetails={purchaseDetails}
        setPurchaseDetails={setPurchaseDetails}
        onClose={() => setSelectedPlan(null)}
        onSubmit={() => selectedPlan && purchaseMutation.mutate(selectedPlan)}
        isPending={purchaseMutation.isPending}
      />
    </div>
  );
};

export default PlansList;