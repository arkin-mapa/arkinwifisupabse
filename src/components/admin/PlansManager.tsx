import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import PlanCard from "./PlanCard";
import type { Plan } from "@/types/plans";

const PlansManager = () => {
  const [plans, setPlans] = useState<Plan[]>([
    { id: "1", duration: "2 hrs", price: 5, availableVouchers: 93 },
    { id: "2", duration: "4 hrs", price: 10, availableVouchers: 100 },
    { id: "3", duration: "6 hrs", price: 15, availableVouchers: 100 },
    { id: "4", duration: "8 hrs", price: 20, availableVouchers: 100 },
    { id: "5", duration: "5 days", price: 50, availableVouchers: 0 },
    { id: "6", duration: "30 days(Butanguid)", price: 200, availableVouchers: 95 },
  ]);

  const [newPlan, setNewPlan] = useState({
    duration: "",
    price: "",
  });

  const { toast } = useToast();

  const handleAddPlan = () => {
    if (!newPlan.duration || !newPlan.price) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    const newPlanObj: Plan = {
      id: (plans.length + 1).toString(),
      duration: newPlan.duration,
      price: parseFloat(newPlan.price),
      availableVouchers: 0,
    };

    setPlans([...plans, newPlanObj]);
    setNewPlan({ duration: "", price: "" });
    
    toast({
      title: "Success",
      description: "New plan added successfully",
    });
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(plans.filter(plan => plan.id !== planId));
    toast({
      title: "Plan deleted",
      description: "The plan has been removed successfully.",
    });
  };

  const handleVoucherUpload = (planId: string, vouchers: string[]) => {
    setPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === planId 
          ? { ...plan, availableVouchers: plan.availableVouchers + vouchers.length }
          : plan
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">WiFi Plans</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <span className="text-sm font-medium">Add Plan</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Plan</DialogTitle>
              <DialogDescription>
                Create a new WiFi plan by entering the duration and price.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2 hrs, 1 day"
                  value={newPlan.duration}
                  onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₱)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                />
              </div>
              <Button onClick={handleAddPlan} className="w-full">
                Add Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onDelete={handleDeletePlan}
            onVoucherUpload={handleVoucherUpload}
          />
        ))}
      </div>
    </div>
  );
};

export default PlansManager;