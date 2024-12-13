import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PurchaseActions from "./PurchaseActions";
import type { Purchase } from "@/types/plans";

interface PurchasesTableProps {
  purchases: Purchase[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete?: (id: string) => void;
  isUpdating?: boolean;
}

const PurchasesTable = ({ purchases, onApprove, onReject, onDelete, isUpdating }: PurchasesTableProps) => {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((purchase) => (
          <TableRow key={purchase.id}>
            <TableCell>{purchase.date}</TableCell>
            <TableCell>{purchase.customerName}</TableCell>
            <TableCell>{purchase.plan}</TableCell>
            <TableCell>{purchase.quantity}</TableCell>
            <TableCell>₱{purchase.total}</TableCell>
            <TableCell className="capitalize">{purchase.paymentMethod}</TableCell>
            <TableCell>
              <Badge variant={getBadgeVariant(purchase.status)}>
                {purchase.status}
              </Badge>
            </TableCell>
            <TableCell>
              <PurchaseActions
                purchase={purchase}
                onApprove={onApprove}
                onReject={onReject}
                onDelete={onDelete}
                isUpdating={isUpdating}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PurchasesTable;