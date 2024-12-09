import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Plan, Voucher } from "@/types/plans";

export const usePlansManager = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [vouchers, setVouchers] = useState<Record<string, Voucher[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    const storedPlans = localStorage.getItem('wifiPlans');
    const storedVouchers = localStorage.getItem('vouchers');
    
    if (storedPlans) {
      const parsedPlans = JSON.parse(storedPlans);
      const updatedPlans = parsedPlans.map(plan => ({
        ...plan,
        availableVouchers: (JSON.parse(storedVouchers || '{}')[plan.duration] || [])
          .filter(v => !v.isUsed).length
      }));
      setPlans(updatedPlans);
      localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));
    } else {
      const defaultPlans: Plan[] = [
        { id: "1", duration: "2 hrs", price: 5, availableVouchers: 0 },
        { id: "2", duration: "4 hrs", price: 10, availableVouchers: 0 },
        { id: "3", duration: "6 hrs", price: 15, availableVouchers: 0 },
        { id: "4", duration: "8 hrs", price: 20, availableVouchers: 0 },
        { id: "5", duration: "5 days", price: 50, availableVouchers: 0 },
        { id: "6", duration: "30 days", price: 200, availableVouchers: 0 },
      ];
      localStorage.setItem('wifiPlans', JSON.stringify(defaultPlans));
      setPlans(defaultPlans);
    }

    if (storedVouchers) {
      setVouchers(JSON.parse(storedVouchers));
    }
  }, []);

  return {
    plans,
    setPlans,
    vouchers,
    setVouchers,
    toast
  };
};