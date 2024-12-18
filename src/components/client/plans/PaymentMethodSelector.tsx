import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database.types";

type PaymentMethod = Database['public']['Enums']['payment_method'];

interface PaymentMethodSelectorProps {
  paymentMethods: { method: PaymentMethod; is_enabled: boolean }[];
  currentMethod: PaymentMethod;
  creditBalance: number;
  onMethodChange: (method: PaymentMethod) => void;
  getMethodLabel: (method: PaymentMethod) => string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethods,
  currentMethod,
  creditBalance,
  onMethodChange,
  getMethodLabel
}) => {
  return (
    <div>
      <Label>Payment Method</Label>
      <RadioGroup
        value={currentMethod}
        onValueChange={(value: PaymentMethod) => onMethodChange(value)}
        className="mt-2 space-y-2"
      >
        {paymentMethods.map(method => (
          <div key={method.method} className="flex items-center space-x-2">
            <RadioGroupItem value={method.method} id={method.method} />
            <Label htmlFor={method.method}>
              {getMethodLabel(method.method)}
              {method.method === 'credit' && ` (₱${creditBalance.toFixed(2)})`}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};