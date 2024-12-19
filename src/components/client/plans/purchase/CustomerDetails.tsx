import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CustomerDetailsProps {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (value: number) => void;
}

export const CustomerDetails = ({
  quantity,
  maxQuantity,
  onQuantityChange,
}: CustomerDetailsProps) => {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max={maxQuantity}
          value={quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value))}
          className="h-9"
        />
      </div>
    </div>
  );
};