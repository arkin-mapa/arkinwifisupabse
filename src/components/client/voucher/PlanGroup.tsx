import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Voucher, Plan } from "@/types/plans";
import VoucherCard from "./VoucherCard";

interface PlanGroupProps {
  planId: string;
  plan: Plan | undefined;
  vouchers: Voucher[];
  isExpanded: boolean;
  onToggle: () => void;
  onDeleteVoucher: (id: string) => void;
  onPrintVoucher: (voucher: Voucher) => void;
}

const PlanGroup = ({
  planId,
  plan,
  vouchers,
  isExpanded,
  onToggle,
  onDeleteVoucher,
  onPrintVoucher,
}: PlanGroupProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-white p-6"
    >
      <div 
        className="flex justify-between items-center mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <h3 className="text-lg font-semibold text-gray-900">
            {plan?.duration || 'Unknown Plan'}
          </h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
          {vouchers.length} voucher{vouchers.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {isExpanded && (
        <div className="grid gap-4">
          {vouchers.map((voucher) => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              onDelete={onDeleteVoucher}
              onPrint={onPrintVoucher}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PlanGroup;