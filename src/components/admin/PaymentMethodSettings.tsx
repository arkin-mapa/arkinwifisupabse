import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";

type PaymentMethod = Database['public']['Enums']['payment_method'];

interface PaymentMethodSetting {
  id: string;
  method: PaymentMethod;
  is_enabled: boolean;
}

const DEFAULT_METHODS: PaymentMethod[] = ['cash', 'gcash', 'paymaya', 'credit'];

export const PaymentMethodSettings = () => {
  const [settings, setSettings] = useState<PaymentMethodSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_method_settings')
        .select('*')
        .order('id');

      if (error) throw error;

      // Transform the data to include the payment method
      const transformedSettings = DEFAULT_METHODS.map(method => {
        const existingSetting = data?.find(s => s.id === method);
        return {
          id: method,
          method: method,
          is_enabled: existingSetting?.is_enabled ?? true
        };
      });

      setSettings(transformedSettings);
    } catch (error) {
      console.error('Error loading payment method settings:', error);
      toast.error("Failed to load payment method settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_method_settings')
        .update({ is_enabled: !currentValue })
        .eq('id', id);

      if (error) throw error;

      setSettings(settings.map(setting => 
        setting.id === id 
          ? { ...setting, is_enabled: !currentValue }
          : setting
      ));

      toast.success(`${currentValue ? 'Disabled' : 'Enabled'} payment method`);
    } catch (error) {
      console.error('Error updating payment method setting:', error);
      toast.error("Failed to update payment method setting");
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'gcash':
        return 'GCash';
      case 'paymaya':
        return 'PayMaya';
      case 'credit':
        return 'Credit Balance';
      default:
        return method;
    }
  };

  if (isLoading) {
    return <div>Loading payment method settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Payment Methods</h3>
      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-center justify-between">
            <label htmlFor={setting.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {getMethodLabel(setting.method)}
            </label>
            <Switch
              id={setting.id}
              checked={setting.is_enabled}
              onCheckedChange={() => handleToggle(setting.id, setting.is_enabled)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};