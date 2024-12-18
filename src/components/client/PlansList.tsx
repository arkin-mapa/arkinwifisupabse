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

      // Check credit balance if using credit payment
      if (purchaseDetails.paymentMethod === 'credit') {
        const { data: credits, error } = await supabase
          .from('credits')
          .select('amount')
          .eq('client_id', session.session.user.id);

        if (error) {
          console.error('Error fetching credits:', error);
          throw new Error("Failed to check credit balance");
        }

        const totalAmount = plan.price * purchaseDetails.quantity;
        const currentBalance = credits?.[0]?.amount || 0;
        
        if (currentBalance < totalAmount) {
          throw new Error("Insufficient credit balance");
        }
      }
      
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
      toast.success("Purchase request submitted successfully!");
      setSelectedPlan(null);
      setPurchaseDetails({
        customerName: "",
        quantity: 1,
        paymentMethod: 'cash'
      });
    },
    onError: (error) => {
      console.error('Purchase error:', error);
      if (error instanceof Error) {
        if (error.message === "Please log in to make a purchase") {
          toast.error("Please log in to make a purchase");
          navigate("/auth");
        } else if (error.message === "Insufficient credit balance") {
          toast.error("Insufficient credit balance for this purchase");
        } else if (error.message === "Failed to check credit balance") {
          toast.error("Unable to verify credit balance. Please try again.");
        } else {
          toast.error("Failed to submit purchase request. Please try again.");
        }
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