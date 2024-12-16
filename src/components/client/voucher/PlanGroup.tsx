import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, PrinterIcon } from "lucide-react";
import type { Voucher, Plan } from "@/types/plans";
import VoucherCard from "./VoucherCard";
import { Button } from "@/components/ui/button";
import { printPlanVouchers } from "@/utils/printUtils";
import { toast } from "sonner";

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
  const handlePrintAllPlanVouchers = () => {
    if (!printPlanVouchers(vouchers, plan!)) {
      toast.error("Unable to open print window. Please check your popup settings.");
    } else {
      toast.success("Print window opened successfully");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-white p-4 md:p-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg flex-1"
          onClick={onToggle}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <h3 className="text-lg font-semibold text-gray-900">
            {plan?.duration || 'Unknown Plan'}
          </h3>
          <span className="ml-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            {vouchers.length} voucher{vouchers.length !== 1 ? 's' : ''}
          </span>
        </div>
        {vouchers.length > 0 && (
          <Button
            onClick={handlePrintAllPlanVouchers}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print All
          </Button>
        )}
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