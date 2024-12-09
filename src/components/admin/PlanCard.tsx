import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Plan } from "@/types/plans";
import { FileUploader } from "./FileUploader";

interface PlanCardProps {
  plan: Plan;
  onDelete: (id: string) => void;
  onVoucherExtracted: (planId: string, codes: string[]) => void;
}

const PlanCard = ({ plan, onDelete, onVoucherExtracted }: PlanCardProps) => {
  const handleVoucherExtracted = (codes: string[]) => {
    onVoucherExtracted(plan.id, codes);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-semibold">{plan.duration}</h3>
            <p className="text-2xl font-bold text-primary">₱{plan.price}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(plan.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 mt-4">
          <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
            Available vouchers: {plan.availableVouchers}
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