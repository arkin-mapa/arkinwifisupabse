import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import type { Plan } from "@/types/plans";

const mockPlans: Plan[] = [
  { id: "1", duration: "2 hrs", price: 5, availableVouchers: 93 },
  { id: "2", duration: "4 hrs", price: 10, availableVouchers: 100 },
  { id: "3", duration: "6 hrs", price: 15, availableVouchers: 100 },
  { id: "4", duration: "8 hrs", price: 20, availableVouchers: 100 },
  { id: "5", duration: "5 days", price: 50, availableVouchers: 0 },
  { id: "6", duration: "30 days(Butanguid)", price: 200, availableVouchers: 95 },
];

const PlansList = () => {
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = (planId: string) => {
    setPurchasing(planId);
    // Simulate purchase request
    setTimeout(() => {
      setPurchasing(null);
      toast.success("Purchase request submitted successfully!");
    }, 1000);
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {mockPlans.map((plan) => (
        <div key={plan.id} className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">{plan.duration}</h3>
          <p className="text-2xl font-bold mb-2">₱{plan.price}</p>
          <p className="text-gray-500 mb-4">Available Vouchers: {plan.availableVouchers}</p>
          <Button 
            className="w-full"
            onClick={() => handlePurchase(plan.id)}
            disabled={purchasing === plan.id || plan.availableVouchers === 0}
          >
            {purchasing === plan.id ? "Processing..." : plan.availableVouchers === 0 ? "Out of Stock" : "Purchase"}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default PlansList;