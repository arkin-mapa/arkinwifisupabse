import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Plan, Purchase } from "@/types/plans";
import PurchaseDialog from "./purchase/PurchaseDialog";
import PlanCard from "./purchase/PlanCard";

const getStoredPurchases = (): Purchase[] => {
  const stored = localStorage.getItem('purchases');
  if (!stored) return [];
  
  const purchases = JSON.parse(stored);
  const activePurchases = purchases.filter(
    (p: Purchase) => p.status === "pending"
  );
  
  localStorage.setItem('purchases', JSON.stringify(activePurchases));
  return activePurchases;
};

const PlansList = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState({
    customerName: "",
    quantity: 1,
    paymentMethod: "cash" as "cash" | "gcash" | "paymaya"
  });

  useEffect(() => {
    const loadPlans = () => {
      const storedPlans = localStorage.getItem('wifiPlans');
      if (storedPlans) {
        setPlans(JSON.parse(storedPlans));
      }
    };

    loadPlans();
    window.addEventListener('storage', loadPlans);
    return () => window.removeEventListener('storage', loadPlans);
  }, []);

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

    setPurchasing(selectedPlan.id);
    
    const newPurchase: Purchase = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      customerName: purchaseDetails.customerName,
      plan: selectedPlan.duration,
      quantity: purchaseDetails.quantity,
      total: selectedPlan.price * purchaseDetails.quantity,
      paymentMethod: purchaseDetails.paymentMethod,
      status: "pending"
    };

    const existingPurchases = getStoredPurchases();
    const updatedPurchases = [...existingPurchases, newPurchase];
    
    localStorage.setItem('purchases', JSON.stringify(updatedPurchases));

    setPurchasing(null);
    setSelectedPlan(null);
    setPurchaseDetails({
      customerName: "",
      quantity: 1,
      paymentMethod: "cash"
    });

    toast.success("Purchase request submitted! You will receive your voucher after payment verification.");
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
            isPurchasing={purchasing === plan.id}
          />
        ))}
      </div>

      <PurchaseDialog
        selectedPlan={selectedPlan}
        onOpenChange={(open) => !open && setSelectedPlan(null)}
        purchaseDetails={purchaseDetails}
        setPurchaseDetails={setPurchaseDetails}
        onSubmit={handleSubmitPurchase}
        isPurchasing={purchasing === selectedPlan?.id}
      />
    </>
  );
};

export default PlansList;