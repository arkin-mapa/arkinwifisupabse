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
import { motion } from "framer-motion";
import { fetchClientPlans, createPurchase } from "@/utils/supabaseData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/database.types";

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
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  console.log('Fetched plans:', plans); // Debug log

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
            <div className="border rounded-lg p-6 bg-white/90 backdrop-blur-sm shadow-sm 
                          transition-all duration-300 hover:shadow-lg hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">{plan.duration}</h3>
              <p className="text-3xl font-bold text-primary mb-4">₱{plan.price}</p>
              <p className="text-gray-600 mb-4">Available Vouchers: {plan.availableVouchers}</p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handlePurchase(plan)}
                disabled={purchaseMutation.isPending || plan.availableVouchers === 0}
              >
                {purchaseMutation.isPending ? "Processing..." : 
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
                onValueChange={(value: PaymentMethod) => setPurchaseDetails({
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

            <div className="pt-4">
              <Button
                className="w-full"
                onClick={handleSubmitPurchase}
                disabled={purchaseMutation.isPending}
              >
                {purchaseMutation.isPending ? "Processing..." : "Confirm Purchase"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlansList;