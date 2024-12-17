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
    if (!plan) {
      toast.error("Plan information not available");
      return;
    }
    
    if (!printPlanVouchers(vouchers, plan)) {
      toast.error("Unable to open print window. Please check your popup settings.");
    } else {
      toast.success("Print window opened successfully");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-card shadow-sm"
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
            <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
              {vouchers.length}
            </span>
          </div>
          {vouchers.length > 0 && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handlePrintAllPlanVouchers();
              }}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              <PrinterIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="space-y-2">
            {vouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                plan={plan}
                onDelete={onDeleteVoucher}
                onPrint={onPrintVoucher}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PlanGroup;