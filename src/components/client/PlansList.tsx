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
import { motion } from "framer-motion";
import PaymentMethodInstructions from "./PaymentMethodInstructions";

const getStoredPurchases = (): Purchase[] => {
  const stored = localStorage.getItem('purchases');
  if (!stored) return [];
  
  // Filter out completed purchases
  const purchases = JSON.parse(stored);
  const activePurchases = purchases.filter(
    (p: Purchase) => p.status === "pending"
  );
  
  // Update localStorage with only active purchases
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
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="border rounded-lg p-6 bg-white/90 backdrop-blur-sm shadow-sm 
                          transition-all duration-300 hover:shadow-lg hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">{plan.duration}</h3>
              <p className="text-3xl font-bold text-primary mb-4">₱{plan.price}</p>
              <p className="text-gray-600 mb-4">Available Vouchers: {plan.availableVouchers}</p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handlePurchase(plan)}
                disabled={purchasing === plan.id || plan.availableVouchers === 0}
              >
                {purchasing === plan.id ? "Processing..." : 
                 plan.availableVouchers === 0 ? "Out of Stock" : "Purchase"}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={selectedPlan !== null} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-[425px]">
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
                className="mt-1"
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
                className="mt-1"
              />
            </div>

            <div>
              <Label>Payment Method</Label>
              <RadioGroup
                value={purchaseDetails.paymentMethod}
                onValueChange={(value: "cash" | "gcash" | "paymaya") => setPurchaseDetails({
                  ...purchaseDetails,
                  paymentMethod: value
                })}
                className="mt-2 space-y-2"
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

            <PaymentMethodInstructions method={purchaseDetails.paymentMethod} />

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