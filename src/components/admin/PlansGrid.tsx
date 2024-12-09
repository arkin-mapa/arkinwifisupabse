import PlanCard from "./PlanCard";
import type { Plan } from "@/types/plans";

interface PlansGridProps {
  plans: Plan[];
  onDelete: (id: string) => void;
  onVoucherUpload: (planId: string, vouchers: string[]) => void;
}

const PlansGrid = ({ plans, onDelete, onVoucherUpload }: PlansGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onDelete={onDelete}
          onVoucherUpload={onVoucherUpload}
        />
      ))}
    </div>
  );
};

export default PlansGrid;