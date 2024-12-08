import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface Plan {
  id: number;
  name: string;
  duration: string;
  price: number;
  description: string;
}

const mockPlans: Plan[] = [
  {
    id: 1,
    name: "Basic",
    duration: "24 Hours",
    price: 5,
    description: "1 Day unlimited internet access"
  },
  {
    id: 2,
    name: "Standard",
    duration: "7 Days",
    price: 25,
    description: "Weekly unlimited internet access"
  },
  {
    id: 3,
    name: "Premium",
    duration: "30 Days",
    price: 80,
    description: "Monthly unlimited internet access"
  }
];

const PlansList = () => {
  const [purchasing, setPurchasing] = useState<number | null>(null);

  const handlePurchase = (planId: number) => {
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
          <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
          <p className="text-gray-600 mb-2">{plan.duration}</p>
          <p className="text-2xl font-bold mb-2">${plan.price}</p>
          <p className="text-gray-500 mb-4">{plan.description}</p>
          <Button 
            className="w-full"
            onClick={() => handlePurchase(plan.id)}
            disabled={purchasing === plan.id}
          >
            {purchasing === plan.id ? "Processing..." : "Purchase"}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default PlansList;