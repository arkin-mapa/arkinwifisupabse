import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";

interface VoucherPoolProps {
  vouchers: Record<string, Voucher[]>;
}

export const VoucherPool = ({ vouchers }: VoucherPoolProps) => {
  const [voucherPool, setVoucherPool] = useState<Record<string, Voucher[]>>(vouchers);

  // Update local state when vouchers prop changes
  useEffect(() => {
    setVoucherPool(vouchers);
  }, [vouchers]);

  useEffect(() => {
    const channel = supabase
      .channel('voucher-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vouchers'
        },
        (payload) => {
          // Update the voucher pool when changes occur
          setVoucherPool(prevPool => {
            const updatedPool = { ...prevPool };
            // Handle deletion or transfer
            if (payload.eventType === 'DELETE' || (payload.eventType === 'UPDATE' && payload.new.is_used)) {
              Object.keys(updatedPool).forEach(duration => {
                updatedPool[duration] = updatedPool[duration].filter(
                  v => v.id !== payload.old.id
                );
              });
            }
            return updatedPool;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check if there are any vouchers to display
  const hasVouchers = Object.keys(voucherPool).length > 0;

  if (!hasVouchers) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Voucher Pool</h3>
        <p className="text-gray-500">No vouchers available</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Voucher Pool</h3>
      <div className="space-y-4">
        {Object.entries(voucherPool).map(([duration, durationVouchers]) => {
          const availableVouchers = durationVouchers.filter(v => !v.isUsed);
          
          return (
            <div key={duration} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{duration} Plan Vouchers</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Available vouchers: {availableVouchers.length}
                </p>
                {availableVouchers.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Voucher codes: {availableVouchers.map(v => v.code).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};