import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Plan } from "@/types/plans";

interface AddPlanDialogProps {
  onAddPlan: (plan: Omit<Plan, 'id' | 'availableVouchers'>) => void;
}

const AddPlanDialog = ({ onAddPlan }: AddPlanDialogProps) => {
  const [open, setOpen] = useState(false);
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

    onAddPlan({
      duration: newPlan.duration,
      price: parseFloat(newPlan.price),
    });

    setNewPlan({ duration: "", price: "" });
    setOpen(false);
    
    toast({
      title: "Success",
      description: "New plan added successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
  );
};

export default AddPlanDialog;