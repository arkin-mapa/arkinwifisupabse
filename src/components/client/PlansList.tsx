import { useState } from "react";
import { toast } from "sonner";
import type { Plan } from "@/types/plans";
import { motion } from "framer-motion";
import { fetchClientPlans, createPurchase } from "@/utils/supabaseData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/database.types";
import PlanCard from "./plans/PlanCard";
import PurchaseDialog from "./plans/PurchaseDialog";

type PaymentMethod = Database['public']['Tables']['purchases']['Row']['payment_method'];

const PlansList = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState({
    customerName: "",
    quantity: 1,
    paymentMethod: 'cash' as PaymentMethod
  });

  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['clientPlans'],
    queryFn: fetchClientPlans,
    refetchInterval: 5000
  });

  console.log('Fetched plans:', plans);

  const purchaseMutation = useMutation({
    mutationFn: (plan: Plan) => createPurchase({
      customerName: purchaseDetails.customerName,
      planId: plan.id,
      quantity: purchaseDetails.quantity,
      totalAmount: plan.price * purchaseDetails.quantity,
      paymentMethod: purchaseDetails.paymentMethod
    }),
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
      toast.error("Failed to submit purchase request. Please try again.");
    }
  });

  const handlePurchase = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleSubmitPurchase = () => {
    if (!purchaseDetails.customerName) {
      toast.error("Please enter your name");
      return;
    }

    if (purchaseDetails.quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    if (!selectedPlan) return;

    purchaseMutation.mutate(selectedPlan);
  };

  if (isLoading) {
    return <div className="text-center">Loading plans...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <PlanCard
              plan={plan}
              onPurchase={handlePurchase}
              isProcessing={purchaseMutation.isPending}
            />
          </motion.div>
        ))}
      </div>

      <PurchaseDialog
        selectedPlan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onSubmit={handleSubmitPurchase}
        purchaseDetails={purchaseDetails}
        onDetailsChange={(details) => setPurchaseDetails(prev => ({ ...prev, ...details }))}
        isProcessing={purchaseMutation.isPending}
      />
    </>
  );
};

export default PlansList;