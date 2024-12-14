import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Plan } from "@/types/plans";
import FileUploader from "./FileUploader";
import { Badge } from "@/components/ui/badge";

interface PlanCardProps {
  plan: Plan;
  onDelete: (id: string) => void;
  onVoucherExtracted: (planId: string, quantity: number) => void;
}

const PlanCard = ({ plan, onDelete, onVoucherExtracted }: PlanCardProps) => {
  const handleVoucherExtracted = (codes: string[]) => {
    // Pass the number of codes as quantity
    onVoucherExtracted(plan.id, codes.length);
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
          <div className="flex items-center gap-2">
            <Badge variant={plan.availableVouchers > 0 ? "default" : "destructive"}>
              {plan.availableVouchers} voucher{plan.availableVouchers !== 1 ? 's' : ''} available
            </Badge>
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