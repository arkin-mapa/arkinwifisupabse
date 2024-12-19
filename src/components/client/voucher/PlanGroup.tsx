import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, CheckSquare, Trash2 } from "lucide-react";
import type { Voucher, Plan } from "@/types/plans";
import VoucherCard from "./VoucherCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PlanGroupProps {
  planId: string;
  plan: Plan | undefined;
  vouchers: Voucher[];
  isExpanded: boolean;
  onToggle: () => void;
  onDeleteVoucher: (id: string) => void;
  selectedVouchers: Voucher[];
  onVoucherSelect: (voucher: Voucher) => void;
}

const PlanGroup = ({
  planId,
  plan,
  vouchers,
  isExpanded,
  onToggle,
  onDeleteVoucher,
  selectedVouchers,
  onVoucherSelect,
}: PlanGroupProps) => {
  const unusedVouchers = vouchers.filter(v => !v.isAssigned);
  
  const handleSelectAll = () => {
    const allSelected = unusedVouchers.every(voucher =>
      selectedVouchers.some(selected => selected.id === voucher.id)
    );

    if (allSelected) {
      // Deselect all vouchers from this plan
      selectedVouchers
        .filter(v => vouchers.some(pv => pv.id === v.id))
        .forEach(v => onVoucherSelect(v));
    } else {
      // Select all unused vouchers from this plan
      unusedVouchers
        .filter(v => !selectedVouchers.some(sv => sv.id === v.id))
        .forEach(v => onVoucherSelect(v));
    }
  };

  const handleDeleteAll = async () => {
    const selectedFromPlan = selectedVouchers.filter(v => 
      vouchers.some(pv => pv.id === v.id)
    );

    if (selectedFromPlan.length === 0) {
      toast.error("Please select vouchers to delete");
      return;
    }

    // Delete all selected vouchers from this plan
    for (const voucher of selectedFromPlan) {
      await onDeleteVoucher(voucher.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-white/50 backdrop-blur-sm shadow-sm dark:bg-gray-800/50"
    >
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div 
            className="flex items-center gap-2 flex-1 cursor-pointer"
            onClick={onToggle}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <h3 className="text-sm font-medium">
              {plan?.duration || 'Unknown Plan'}
            </h3>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {unusedVouchers.length}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-7 w-7 p-0"
              title="Select All"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteAll}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              title="Delete Selected"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {vouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                plan={plan}
                onDelete={onDeleteVoucher}
                isSelected={selectedVouchers.some(v => v.id === voucher.id)}
                onSelect={() => onVoucherSelect(voucher)}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PlanGroup;