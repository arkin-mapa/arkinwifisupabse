import { useState } from "react";
import { toast } from "sonner";
import { usePlans } from "@/hooks/usePlans";
import { supabase } from "@/integrations/supabase/client";
import { PlanCard } from "./plans/PlanCard";
import { PurchaseDialog } from "./plans/PurchaseDialog";
import type { Plan } from "@/types/plans";

const PlansList = () => {
  const { data: plans = [] } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState({
    customerName: "",
    quantity: 1,
    paymentMethod: "cash"
  });

  const handlePurchase = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handlePurchaseDetailsChange = (field: string, value: string | number) => {
    setPurchaseDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitPurchase = async () => {
    if (!purchaseDetails.customerName) {
      toast.error("Please enter your name");
      return;
    }

    if (purchaseDetails.quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    if (!selectedPlan) return;

    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from("purchases")
        .insert({
          plan_id: selectedPlan.id,
          quantity: purchaseDetails.quantity,
          total: selectedPlan.price * purchaseDetails.quantity,
          payment_method: purchaseDetails.paymentMethod,
        });

      if (error) throw error;

      toast.success("Purchase request submitted successfully!");
      setSelectedPlan(null);
      setPurchaseDetails({
        customerName: "",
        quantity: 1,
        paymentMethod: "cash"
      });
    } catch (error) {
      toast.error("Failed to submit purchase request");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={index}
            onPurchase={handlePurchase}
            isProcessing={isProcessing}
          />
        ))}
      </div>

      <PurchaseDialog
        plan={selectedPlan}
        isOpen={selectedPlan !== null}
        onClose={() => setSelectedPlan(null)}
        purchaseDetails={purchaseDetails}
        onPurchaseDetailsChange={handlePurchaseDetailsChange}
        onSubmit={handleSubmitPurchase}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default PlansList;