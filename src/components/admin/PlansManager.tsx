import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Plan {
  id: string;
  duration: string;
  price: number;
  availableVouchers: number;
}

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
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileUpload = async (planId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      toast({
        title: "Processing vouchers",
        description: "Extracting voucher codes from document...",
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract text that matches the pattern (6-10 digits with font size 14)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        // This is a simplified example - in reality, you'd need a proper PDF/DOC parser
        const vouchers = text.match(/\d{6,10}/g) || [];
        
        toast({
          title: "Success",
          description: `${vouchers.length} vouchers have been extracted and added to the pool.`,
        });
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process vouchers. Please try again.",
      });
    }
  };

  const handleUploadClick = (planId: string) => {
    fileInputRefs.current[planId]?.click();
  };

  const handleFileChange = (planId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        handleFileUpload(planId, file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
        });
      }
    }
  };

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
          <Card key={plan.id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{plan.duration}</h3>
                    <p className="text-emerald-600 font-semibold">₱{plan.price}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Available vouchers: {plan.availableVouchers}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Enter voucher code" className="flex-1" />
                  <Button variant="secondary">Add</Button>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  ref={(el) => fileInputRefs.current[plan.id] = el}
                  onChange={(e) => handleFileChange(plan.id, e)}
                />
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => handleUploadClick(plan.id)}
                >
                  <Upload className="h-4 w-4" />
                  Upload Vouchers
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlansManager;