import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Plan, Purchase } from "@/types/plans";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Get existing purchases from localStorage or initialize empty array
const getStoredPurchases = (): Purchase[] => {
  const stored = localStorage.getItem('purchases');
  return stored ? JSON.parse(stored) : [];
};

const PlansList = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState({
    customerName: "",
    quantity: 1,
    paymentMethod: "cash"
  });

  // Load plans from localStorage on component mount
  useEffect(() => {
    const loadPlans = () => {
      const storedPlans = localStorage.getItem('wifiPlans');
      if (storedPlans) {
        setPlans(JSON.parse(storedPlans));
      }
    };

    loadPlans();
    // Add event listener for storage changes
    window.addEventListener('storage', loadPlans);
    
    return () => {
      window.removeEventListener('storage', loadPlans);
    };
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
    
    // Create new purchase object
    const newPurchase: Purchase = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      customerName: purchaseDetails.customerName,
      plan: selectedPlan.duration,
      quantity: purchaseDetails.quantity,
      total: selectedPlan.price * purchaseDetails.quantity,
      paymentMethod: purchaseDetails.paymentMethod as "cash" | "gcash" | "paymaya",
      status: "pending"
    };

    // Get existing purchases and add new one
    const existingPurchases = getStoredPurchases();
    const updatedPurchases = [...existingPurchases, newPurchase];
    
    // Save to localStorage
    localStorage.setItem('purchases', JSON.stringify(updatedPurchases));

    // Reset state and show success message
    setPurchasing(null);
    setSelectedPlan(null);
    setPurchaseDetails({
      customerName: "",
      quantity: 1,
      paymentMethod: "cash"
    });

    toast.success("Purchase request submitted successfully!");
  };

  return (
    <>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-2">{plan.duration}</h3>
            <p className="text-2xl font-bold mb-2">₱{plan.price}</p>
            <p className="text-gray-500 mb-4">Available Vouchers: {plan.availableVouchers}</p>
            <Button 
              className="w-full"
              onClick={() => handlePurchase(plan)}
              disabled={purchasing === plan.id || plan.availableVouchers === 0}
            >
              {purchasing === plan.id ? "Processing..." : plan.availableVouchers === 0 ? "Out of Stock" : "Purchase"}
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={selectedPlan !== null} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent>
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
              />
            </div>

            <div>
              <Label>Payment Method</Label>
              <RadioGroup
                value={purchaseDetails.paymentMethod}
                onValueChange={(value) => setPurchaseDetails({
                  ...purchaseDetails,
                  paymentMethod: value
                })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gcash" id="gcash" />
                  <Label htmlFor="gcash">GCash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paymaya" id="paymaya" />
                  <Label htmlFor="paymaya">PayMaya</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-4">
              <Button
                className="w-full"
                onClick={handleSubmitPurchase}
                disabled={purchasing === selectedPlan?.id}
              >
                {purchasing === selectedPlan?.id ? "Processing..." : "Confirm Purchase"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlansList;