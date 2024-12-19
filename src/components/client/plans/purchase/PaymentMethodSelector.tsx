import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Database } from "@/types/database.types";

type PaymentMethod = Database['public']['Tables']['purchases']['Row']['payment_method'];

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (value: PaymentMethod) => void;
  enabledMethods: string[];
  creditBalance: number;
  totalAmount: number;
}

export const PaymentMethodSelector = ({
  selectedMethod,
  onMethodChange,
  enabledMethods,
  creditBalance,
  totalAmount,
}: PaymentMethodSelectorProps) => {
  const canUseCredit = creditBalance >= totalAmount;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Payment Method</Label>
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value: PaymentMethod) => onMethodChange(value)}
        className="grid gap-3"
      >
        {enabledMethods.includes('cash') && (
          <div className="flex items-center space-x-3 rounded-lg border p-4">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash" className="flex-1">Cash</Label>
          </div>
        )}
        {enabledMethods.includes('gcash') && (
          <div className="flex items-center space-x-3 rounded-lg border p-4">
            <RadioGroupItem value="gcash" id="gcash" />
            <Label htmlFor="gcash" className="flex-1">GCash</Label>
          </div>
        )}
        {enabledMethods.includes('paymaya') && (
          <div className="flex items-center space-x-3 rounded-lg border p-4">
            <RadioGroupItem value="paymaya" id="paymaya" />
            <Label htmlFor="paymaya" className="flex-1">PayMaya</Label>
          </div>
        )}
        {enabledMethods.includes('credit') && (
          <div className="flex items-center space-x-3 rounded-lg border p-4">
            <RadioGroupItem 
              value="credit" 
              id="credit" 
              disabled={!canUseCredit}
            />
            <div className="flex-1">
              <Label 
                htmlFor="credit" 
                className={!canUseCredit ? "text-muted-foreground" : ""}
              >
                Credit Balance
              </Label>
              <p className="text-sm text-muted-foreground">
                Available: ₱{creditBalance.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </RadioGroup>
    </div>
  );
};