import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Plan } from "@/types/plans";

interface PlanCardProps {
  plan: Plan;
  index: number;
  onPurchase: () => void;
  isPending: boolean;
}

export const PlanCard = ({ plan, index, onPurchase, isPending }: PlanCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <div className="rounded-lg p-4 bg-white shadow-sm border">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h3 className="text-lg font-semibold">{plan.duration}</h3>
            <p className="text-2xl font-bold text-primary mt-1">₱{plan.price}</p>
            <p className="text-sm text-gray-600 mt-1">
              {plan.availableVouchers} voucher{plan.availableVouchers !== 1 ? 's' : ''} available
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={onPurchase}
            disabled={isPending || plan.availableVouchers === 0}
          >
            {isPending ? "Processing..." : 
             plan.availableVouchers === 0 ? "Out of Stock" : "Purchase"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};