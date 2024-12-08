import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { Plan } from "@/types/plans";
import { FileUploader } from "./FileUploader";

interface PlanCardProps {
  plan: Plan;
  onDelete: (id: string) => void;
  onVoucherUpload: (planId: string, vouchers: string[]) => void;
}

const PlanCard = ({ plan, onDelete, onVoucherUpload }: PlanCardProps) => {
  const handleVoucherExtracted = (vouchers: string[]) => {
    onVoucherUpload(plan.id, vouchers);
  };

  return (
    <Card className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => onDelete(plan.id)}
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
          <FileUploader 
            onExtracted={handleVoucherExtracted}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCard;