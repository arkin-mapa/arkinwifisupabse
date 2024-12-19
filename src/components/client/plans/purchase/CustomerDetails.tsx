import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CustomerDetailsProps {
  customerName: string;
  quantity: number;
  maxQuantity: number;
  onCustomerNameChange: (value: string) => void;
  onQuantityChange: (value: number) => void;
}

export const CustomerDetails = ({
  customerName,
  quantity,
  maxQuantity,
  onCustomerNameChange,
  onQuantityChange,
}: CustomerDetailsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customerName" className="text-sm font-medium">Your Name</Label>
        <Input
          id="customerName"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          placeholder="Enter your name"
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max={maxQuantity}
          value={quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value))}
          className="h-10"
        />
      </div>
    </div>
  );
};