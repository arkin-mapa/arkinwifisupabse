import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Plan } from "@/types/plans";

interface PlanCardProps {
  plan: Plan;
  index: number;
  onPurchase: (plan: Plan) => void;
  isPurchasing: boolean;
}

const PlanCard = ({ plan, index, onPurchase, isPurchasing }: PlanCardProps) => {
  return (
    <motion.div
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
          onClick={() => onPurchase(plan)}
          disabled={isPurchasing || plan.availableVouchers === 0}
        >
          {isPurchasing ? "Processing..." : 
           plan.availableVouchers === 0 ? "Out of Stock" : "Purchase"}
        </Button>
      </div>
    </motion.div>
  );
};

export default PlanCard;