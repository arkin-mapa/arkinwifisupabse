import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";
import { useToast } from "@/hooks/use-toast";

export const useVoucherSync = (initialVouchers: Record<string, Voucher[]>) => {
  const [localVouchers, setLocalVouchers] = useState<Record<string, Voucher[]>>(initialVouchers);
  const { toast } = useToast();

  useEffect(() => {
    setLocalVouchers(initialVouchers);
  }, [initialVouchers]);

  useEffect(() => {
    const channel = supabase
      .channel('voucher-status-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voucher_wallet'
        },
        () => {
          syncVoucherStatus();
        }
      )
      .subscribe();

    // Initial sync
    syncVoucherStatus();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialVouchers]);

  const syncVoucherStatus = async () => {
    try {
      // Get all vouchers from wallet with their status
      const { data: walletVouchers, error: walletError } = await supabase
        .from('voucher_wallet')
        .select(`
          voucher_id,
          is_used,
          vouchers (
            id,
            is_used
          )
        `);

      if (walletError) throw walletError;

      // Update local vouchers with wallet status
      const updatedVouchers = { ...localVouchers };
      Object.keys(updatedVouchers).forEach(planDuration => {
        updatedVouchers[planDuration] = updatedVouchers[planDuration].map(voucher => {
          const walletVoucher = walletVouchers?.find(wv => wv.voucher_id === voucher.id);
          if (walletVoucher) {
            return {
              ...voucher,
              isUsed: walletVoucher.is_used || walletVoucher.vouchers?.is_used || false
            };
          }
          return voucher;
        });
      });

      setLocalVouchers(updatedVouchers);
    } catch (error) {
      console.error('Error syncing voucher status:', error);
      toast({
        title: "Error",
        description: "Failed to sync voucher status",
        variant: "destructive"
      });
    }
  };

  return { localVouchers, setLocalVouchers, syncVoucherStatus };
};