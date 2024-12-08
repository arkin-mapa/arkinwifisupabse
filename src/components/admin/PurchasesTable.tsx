import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PurchaseActions from "./PurchaseActions";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Purchase } from "@/types/plans";

interface PurchasesTableProps {
  purchases: Purchase[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}

const PurchasesTable = ({ purchases, onApprove, onReject, onDelete }: PurchasesTableProps) => {
  const getBadgeVariant = (status: Purchase['status']) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="border border-border/50 shadow-sm">
      <ScrollArea className="h-[calc(100vh-16rem)] rounded-md">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0">
            <TableRow>
              <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Customer</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Plan</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Quantity</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Total</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Payment</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="font-semibold text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow 
                key={purchase.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{purchase.date}</TableCell>
                <TableCell>{purchase.customerName}</TableCell>
                <TableCell>{purchase.plan}</TableCell>
                <TableCell>{purchase.quantity}</TableCell>
                <TableCell className="font-semibold">₱{purchase.total}</TableCell>
                <TableCell className="capitalize">{purchase.paymentMethod}</TableCell>
                <TableCell>
                  <Badge 
                    variant={getBadgeVariant(purchase.status)}
                    className={`
                      ${purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                      ${purchase.status === 'approved' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                      ${purchase.status === 'rejected' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                      ${purchase.status === 'cancelled' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' : ''}
                    `}
                  >
                    {purchase.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <PurchaseActions
                    purchaseId={purchase.id}
                    status={purchase.status}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};

export default PurchasesTable;