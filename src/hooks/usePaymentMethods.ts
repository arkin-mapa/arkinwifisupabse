import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";

type PaymentMethod = Database['public']['Enums']['payment_method'];

interface PaymentMethodSetting {
  method: PaymentMethod;
  is_enabled: boolean;
}

export const usePaymentMethods = (creditBalance: number, totalAmount: number) => {
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<PaymentMethodSetting[]>([]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_method_settings')
        .select('method, is_enabled')
        .order('method');

      if (error) throw error;
      setEnabledPaymentMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const canUseCredit = creditBalance >= totalAmount;

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'gcash': return 'GCash';
      case 'paymaya': return 'PayMaya';
      case 'credit': return 'Credit Balance';
      default: return method;
    }
  };

  const filterPaymentMethods = () => {
    return enabledPaymentMethods.filter(method => 
      method.is_enabled && (method.method !== 'credit' || canUseCredit)
    );
  };

  return {
    enabledPaymentMethods: filterPaymentMethods(),
    getMethodLabel,
    canUseCredit
  };
};