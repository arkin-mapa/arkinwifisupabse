import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import type { Plan } from "@/types/plans";
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
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState({
    customerName: "",
    quantity: 1,
    paymentMethod: "cash"
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

    setPurchasing(selectedPlan?.id || null);
    
    // Simulate purchase request
    setTimeout(() => {
      setPurchasing(null);
      setSelectedPlan(null);
      toast.success("Purchase request submitted successfully!");
      
      // Reset form
      setPurchaseDetails({
        customerName: "",
        quantity: 1,
        paymentMethod: "cash"
      });
    }, 1000);
  };

  return (
    <>
      <div className="grid md:grid-cols-3 gap-4">
        {mockPlans.map((plan) => (
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

      <Dialog open={selectedPlan !== null} onOpenChange={() => setSelectedPlan(null)}>
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