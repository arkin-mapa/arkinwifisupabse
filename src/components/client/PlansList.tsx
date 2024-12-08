import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("");

  const handlePurchaseClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handlePurchaseSubmit = () => {
    if (!customerName || !quantity || !paymentMethod) {
      toast.error("Please fill in all fields");
      return;
    }

    setPurchasing(selectedPlan?.id || null);
    // Simulate purchase request
    setTimeout(() => {
      setPurchasing(null);
      setIsDialogOpen(false);
      toast.success("Purchase request submitted successfully!");
      // Reset form
      setCustomerName("");
      setQuantity("1");
      setPaymentMethod("");
    }, 1000);
  };

  return (
    <>
      <div className="grid md:grid-cols-3 gap-4">
        {mockPlans.map((plan) => (
          <div key={plan.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-2">{plan.duration}</p>
            <p className="text-2xl font-bold mb-2">${plan.price}</p>
            <p className="text-gray-500 mb-4">{plan.description}</p>
            <Button 
              className="w-full"
              onClick={() => handlePurchaseClick(plan)}
              disabled={purchasing === plan.id}
            >
              {purchasing === plan.id ? "Processing..." : "Purchase"}
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase {selectedPlan?.name} Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="paymaya">PayMaya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handlePurchaseSubmit}
              disabled={purchasing === selectedPlan?.id}
            >
              {purchasing === selectedPlan?.id ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlansList;