import { ScrollArea } from "@/components/ui/scroll-area";
import type { Voucher, Plan } from "@/types/plans";
import PlanGroup from "./PlanGroup";

interface VoucherListProps {
  vouchers: Record<string, Voucher[]>;
  plans: Record<string, Plan>;
  expandedPlans: Record<string, boolean>;
  onTogglePlan: (planId: string) => void;
  onDeleteVoucher: (voucherId: string) => void;
  selectedVouchers: Voucher[];
  onVoucherSelect: (voucher: Voucher) => void;
}

export const VoucherList = ({
  vouchers,
  plans,
  expandedPlans,
  onTogglePlan,
  onDeleteVoucher,
  selectedVouchers,
  onVoucherSelect
}: VoucherListProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="space-y-3 px-4 pb-4">
        {Object.keys(vouchers).length > 0 ? (
          Object.entries(vouchers).map(([planId, planVouchers]) => (
            <PlanGroup
              key={planId}
              planId={planId}
              plan={plans[planId]}
              vouchers={planVouchers}
              isExpanded={expandedPlans[planId] || false}
              onToggle={() => onTogglePlan(planId)}
              onDeleteVoucher={onDeleteVoucher}
              selectedVouchers={selectedVouchers}
              onVoucherSelect={onVoucherSelect}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No vouchers in your wallet.</p>
            <p className="mt-2">Scan a QR code to receive vouchers.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};