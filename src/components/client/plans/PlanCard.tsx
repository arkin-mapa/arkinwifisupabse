import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Plan } from "@/types/plans";

interface PlanCardProps {
  plan: Plan;
  onPurchase: (plan: Plan) => void;
  isProcessing: boolean;
}

const PlanCard = ({ plan, onPurchase, isProcessing }: PlanCardProps) => {
  return (
    <div className="border rounded-lg p-6 bg-white/90 backdrop-blur-sm shadow-sm 
                    transition-all duration-300 hover:shadow-lg hover:scale-105">
      <h3 className="text-xl font-semibold mb-2">{plan.duration}</h3>
      <p className="text-3xl font-bold text-primary mb-4">₱{plan.price}</p>
      <div className="mb-4">
        <Badge variant={plan.availableVouchers > 0 ? "default" : "destructive"}>
          {plan.availableVouchers} voucher{plan.availableVouchers !== 1 ? 's' : ''} available
        </Badge>
      </div>
      <Button 
        className="w-full bg-primary hover:bg-primary/90"
        onClick={() => onPurchase(plan)}
        disabled={isProcessing || plan.availableVouchers === 0}
      >
        {isProcessing ? "Processing..." : 
         plan.availableVouchers === 0 ? "Out of Stock" : "Purchase"}
      </Button>
    </div>
  );
};

export default PlanCard;