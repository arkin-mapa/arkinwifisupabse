import { Badge } from "@/components/ui/badge";
import type { Purchase } from "@/types/plans";

interface PurchaseStatusProps {
  status: Purchase['status'];
}

export const PurchaseStatus = ({ status }: PurchaseStatusProps) => {
  const getBadgeVariant = (status: Purchase['status']) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Badge variant={getBadgeVariant(status)}>
      {status}
    </Badge>
  );
};