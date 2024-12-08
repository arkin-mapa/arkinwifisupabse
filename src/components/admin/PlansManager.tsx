import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Upload } from "lucide-react";
import { useState } from "react";

interface Plan {
  id: string;
  duration: string;
  price: number;
  availableVouchers: number;
}

const PlansManager = () => {
  const [plans] = useState<Plan[]>([
    { id: "1", duration: "2 hrs", price: 5, availableVouchers: 93 },
    { id: "2", duration: "4 hrs", price: 10, availableVouchers: 100 },
    { id: "3", duration: "6 hrs", price: 15, availableVouchers: 100 },
    { id: "4", duration: "8 hrs", price: 20, availableVouchers: 100 },
    { id: "5", duration: "5 days", price: 50, availableVouchers: 0 },
    { id: "6", duration: "30 days(Butanguid)", price: 200, availableVouchers: 95 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">WiFi Plans</h2>
        <Button className="gap-2">
          <span className="text-sm font-medium">Add Plan</span>
        </Button>
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
                <Button variant="outline" className="w-full gap-2">
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