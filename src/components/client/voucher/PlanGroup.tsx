import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Voucher, Plan } from "@/types/plans";
import VoucherCard from "./VoucherCard";
import { Button } from "@/components/ui/button";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-white/50 backdrop-blur-sm shadow-sm dark:bg-gray-800/50"
    >
      <div className="p-3">
        <div 
          className="flex items-center justify-between gap-2 cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2 flex-1">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <h3 className="text-sm font-medium">
              {plan?.duration || 'Unknown Plan'}
            </h3>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {vouchers.length}
            </span>
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