import AddPlanDialog from "./AddPlanDialog";
import VoucherPool from "./VoucherPool";
import PlansGrid from "./PlansGrid";
import { usePlansManager } from "@/hooks/usePlansManager";
import { handleAddPlan, handleDeletePlan, handleVoucherUpload } from "@/utils/planOperations";

const PlansManager = () => {
  const { plans, setPlans, vouchers, setVouchers, toast } = usePlansManager();

  const onAddPlan = (newPlan: Omit<Plan, 'id' | 'availableVouchers'>) => {
    handleAddPlan(newPlan, plans, setPlans, toast);
  };

  const onDeletePlan = (planId: string) => {
    handleDeletePlan(planId, plans, setPlans, vouchers, setVouchers, toast);
  };

  const onVoucherUpload = (planId: string, voucherCodes: string[]) => {
    handleVoucherUpload(planId, voucherCodes, plans, setPlans, vouchers, setVouchers, toast);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">WiFi Plans</h2>
        <AddPlanDialog onAddPlan={onAddPlan} />
      </div>

      <PlansGrid
        plans={plans}
        onDelete={onDeletePlan}
        onVoucherUpload={onVoucherUpload}
      />

      <VoucherPool vouchers={vouchers} />
    </div>
  );
};

export default PlansManager;